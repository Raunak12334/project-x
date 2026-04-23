import { createId } from "@paralleldrive/cuid2";
import { NodeType, type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
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
import { validateWorkflow } from "@/features/workflows/lib/workflow-validator";
import { sendWorkflowExecution } from "@/inngest/utils";
import prisma from "@/lib/db";
import { createWebhookSecret } from "@/lib/webhook-security";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";

const workflowNodeInputSchema = z.object({
  id: z.string(),
  type: z.string().nullish(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.string(), z.any()).optional(),
});

const workflowEdgeInputSchema = z.object({
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().nullish(),
  targetHandle: z.string().nullish(),
});

type WorkflowNodeInput = z.infer<typeof workflowNodeInputSchema>;
type WorkflowEdgeInput = z.infer<typeof workflowEdgeInputSchema>;

const getValidationContext = async (organizationId: string) => {
  const [credentials, integrations] = await Promise.all([
    prisma.credential.findMany({
      where: { organizationId, deletedAt: null },
      select: { id: true },
    }),
    prisma.composioIntegration.findMany({
      where: { organizationId, deletedAt: null, isConnected: true },
      select: { id: true },
    }),
  ]);

  return {
    validCredentialIds: new Set(credentials.map((credential) => credential.id)),
    validIntegrationIds: new Set(
      integrations.map((integration) => integration.id),
    ),
  };
};

const throwValidationError = (
  issues: ReturnType<typeof validateWorkflow>["issues"],
) => {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: JSON.stringify({
      ok: false,
      type: "VALIDATION_ERROR",
      issues,
    }),
  });
};

const validateWorkflowOrThrow = async (params: {
  workflowId: string;
  organizationId: string;
  nodes: WorkflowNodeInput[];
  edges: WorkflowEdgeInput[];
}) => {
  const validationContext = await getValidationContext(params.organizationId);
  const result = validateWorkflow({
    workflowId: params.workflowId,
    nodes: params.nodes as Node[],
    edges: params.edges as Edge[],
    ...validationContext,
  });

  if (!result.isValid) {
    throwValidationError(result.issues);
  }

  return result;
};

const persistWorkflowGraph = async (params: {
  tx: Prisma.TransactionClient;
  workflowId: string;
  nodes: WorkflowNodeInput[];
  edges: WorkflowEdgeInput[];
}) => {
  const { tx, workflowId, nodes, edges } = params;
  const nodeTypeSchema = z.enum(NodeType);

  await tx.connection.deleteMany({
    where: { workflowId },
  });

  const activeNodeIds = nodes.map((node) => node.id);
  await tx.node.updateMany({
    where: {
      workflowId,
      id: { notIn: activeNodeIds },
    },
    data: { deletedAt: new Date() },
  });

  await Promise.all(
    nodes.map((node) => {
      const type = nodeTypeSchema.parse(node.type);

      return tx.node.upsert({
        where: { id: node.id },
        create: {
          id: node.id,
          workflowId,
          name: type,
          type,
          position: node.position,
          data: node.data || {},
          deletedAt: null,
        },
        update: {
          name: type,
          type,
          position: node.position,
          data: node.data || {},
          deletedAt: null,
        },
      });
    }),
  );

  const connections = normalizeAndDedupeWorkflowConnections(edges).map(
    (edge) => ({
      workflowId,
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
    console.debug("[workflows.persist] Duplicate connections removed", {
      workflowId,
      received: edges.length,
      saved: connections.length,
    });
  }

  await tx.connection.createMany({
    data: connections,
    skipDuplicates: true,
  });

  await tx.workflow.update({
    where: { id: workflowId },
    data: { updatedAt: new Date() },
  });
};

export const workflowsRouter = createTRPCRouter({
  execute: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(workflowNodeInputSchema).optional(),
        edges: z.array(workflowEdgeInputSchema).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          organizationId: ctx.auth.organizationId,
        },
      });

      if (input.nodes && input.edges) {
        await validateWorkflowOrThrow({
          workflowId: input.id,
          organizationId: ctx.auth.organizationId,
          nodes: input.nodes,
          edges: input.edges,
        });

        await prisma.$transaction(async (tx) => {
          await persistWorkflowGraph({
            tx,
            workflowId: input.id,
            nodes: input.nodes ?? [],
            edges: input.edges ?? [],
          });
        });
      } else {
        const workflowWithGraph = await prisma.workflow.findUniqueOrThrow({
          where: {
            id: input.id,
            organizationId: ctx.auth.organizationId,
          },
          include: {
            nodes: {
              where: {
                deletedAt: null,
              },
            },
            connections: true,
          },
        });

        await validateWorkflowOrThrow({
          workflowId: input.id,
          organizationId: ctx.auth.organizationId,
          nodes: workflowWithGraph.nodes.map((node) => ({
            id: node.id,
            type: node.type,
            position: node.position as { x: number; y: number },
            data: (node.data as Record<string, unknown>) || {},
          })),
          edges: workflowWithGraph.connections.map((connection) => ({
            source: connection.fromNodeId,
            target: connection.toNodeId,
            sourceHandle: connection.fromOutput,
            targetHandle: connection.toInput,
          })),
        });
      }

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
        webhookSecret: createWebhookSecret(),
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

      // Check premium template access
      if (template.isPremium && ctx.subscription?.plan === "FREE") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Premium templates require a PRO subscription. Upgrade to access this template.",
        });
      }

      return prisma.$transaction(async (tx) => {
        const workflow = await tx.workflow.create({
          data: {
            name: template.name,
            organizationId: ctx.auth.organizationId,
            webhookSecret: createWebhookSecret(),
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
        nodes: z.array(workflowNodeInputSchema),
        edges: z.array(workflowEdgeInputSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, nodes, edges } = input;

      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id, organizationId: ctx.auth.organizationId },
      });

      await validateWorkflowOrThrow({
        workflowId: id,
        organizationId: ctx.auth.organizationId,
        nodes,
        edges,
      });

      // Transaction to ensure consistency
      return await prisma.$transaction(async (tx) => {
        await persistWorkflowGraph({
          tx,
          workflowId: id,
          nodes,
          edges,
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
        include: {
          nodes: {
            where: {
              deletedAt: null,
            },
          },
          connections: true,
        },
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
        webhookSecret: workflow.webhookSecret || "",
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
