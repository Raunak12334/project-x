import { createId } from "@paralleldrive/cuid2";
import { NodeType, type Prisma } from "@prisma/client";
import type { Edge, Node } from "@xyflow/react";
import { generateSlug } from "random-word-slugs";
import z from "zod";
import { PAGINATION } from "@/config/constants";
import { getWorkflowTemplateById } from "@/features/templates/lib/workflow-templates";
import {
  makeConnectionKey,
  normalizeAndDedupeWorkflowConnections,
  normalizeConnectionSourceHandle,
  normalizeConnectionTargetHandle,
} from "@/features/workflows/lib/connections";
import { sendWorkflowExecution } from "@/inngest/utils";
import prisma from "@/lib/db";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";

export const workflowsRouter = createTRPCRouter({
  execute: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          organizationId: ctx.auth.organizationId,
        },
      });

      await sendWorkflowExecution({
        workflowId: input.id,
      });

      return workflow;
    }),
  create: premiumProcedure.mutation(({ ctx }) => {
    return prisma.workflow.create({
      data: {
        name: generateSlug(3),
        organizationId: ctx.auth.organizationId,
        nodes: {
          create: {
            type: NodeType.INITIAL,
            position: { x: 0, y: 0 },
            name: NodeType.INITIAL,
          },
        },
      },
    });
  }),
  createFromTemplate: premiumProcedure
    .input(z.object({ templateId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const template = getWorkflowTemplateById(input.templateId);

      if (!template) {
        throw new Error("Template not found");
      }

      return prisma.$transaction(async (tx) => {
        const workflow = await tx.workflow.create({
          data: {
            name: template.name,
            organizationId: ctx.auth.organizationId,
          },
        });

        const nodeIdMap = new Map(
          template.nodes.map((node) => [node.id, createId()]),
        );

        await tx.node.createMany({
          data: template.nodes.map((node) => ({
            id: nodeIdMap.get(node.id) ?? createId(),
            workflowId: workflow.id,
            name: node.type,
            type: node.type,
            position: node.position,
            data: (node.data || {}) as Prisma.InputJsonValue,
          })),
        });

        const connections = normalizeAndDedupeWorkflowConnections(
          template.edges,
        ).map((edge) => ({
          workflowId: workflow.id,
          fromNodeId: nodeIdMap.get(edge.source) ?? edge.source,
          toNodeId: nodeIdMap.get(edge.target) ?? edge.target,
          fromOutput: edge.sourceHandle,
          toInput: edge.targetHandle,
        }));

        await tx.connection.createMany({
          data: connections,
          skipDuplicates: true,
        });

        return workflow;
      });
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.delete({
        where: {
          id: input.id,
          organizationId: ctx.auth.organizationId,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.string().nullish(),
            position: z.object({ x: z.number(), y: z.number() }),
            data: z.record(z.string(), z.any()).optional(),
          }),
        ),
        edges: z.array(
          z.object({
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullish(),
            targetHandle: z.string().nullish(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, nodes, edges } = input;

      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id, organizationId: ctx.auth.organizationId },
      });

      // Transaction to ensure consistency
      return await prisma.$transaction(async (tx) => {
        // Delete existing connections and nodes before rebuilding the workflow.
        await tx.connection.deleteMany({
          where: { workflowId: id },
        });

        await tx.node.deleteMany({
          where: { workflowId: id },
        });

        // Create nodes
        await tx.node.createMany({
          data: nodes.map((node) => ({
            id: node.id,
            workflowId: id,
            name: node.type || "unknown",
            type: node.type as NodeType,
            position: node.position,
            data: node.data || {},
          })),
        });

        const connections = normalizeAndDedupeWorkflowConnections(edges).map(
          (edge) => ({
            workflowId: id,
            fromNodeId: edge.source,
            toNodeId: edge.target,
            fromOutput: edge.sourceHandle,
            toInput: edge.targetHandle,
          }),
        );

        if (
          process.env.NODE_ENV !== "production" &&
          connections.length !== edges.length
        ) {
          console.debug("[workflows.update] Duplicate connections removed", {
            workflowId: id,
            received: edges.length,
            saved: connections.length,
          });
        }

        await tx.connection.createMany({
          data: connections,
          skipDuplicates: true,
        });

        // Update workflow's updateAt timestamp
        await tx.workflow.update({
          where: { id },
          data: { updatedAt: new Date() },
        });

        return workflow;
      });
    }),
  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.update({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
        data: { name: input.name },
      });
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
        include: { nodes: true, connections: true },
      });

      // Transform server nodes to react-flow compatible nodes
      const nodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position as { x: number; y: number },
        data: (node.data as Record<string, unknown>) || {},
      }));

      // Transform server connections to react-flow compatible edges
      const edges: Edge[] = workflow.connections.map((connection) => ({
        id: makeConnectionKey(
          connection.fromNodeId,
          connection.toNodeId,
          connection.fromOutput,
          connection.toInput,
        ),
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: normalizeConnectionSourceHandle(connection.fromOutput),
        targetHandle: normalizeConnectionTargetHandle(connection.toInput),
      }));

      return {
        id: workflow.id,
        name: workflow.name,
        nodes,
        edges,
      };
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const [items, totalCount] = await Promise.all([
        prisma.workflow.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            organizationId: ctx.auth.organizationId,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.workflow.count({
          where: {
            organizationId: ctx.auth.organizationId,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
});
