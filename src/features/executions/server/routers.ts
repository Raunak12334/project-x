import { ExecutionStatus, type Prisma } from "@prisma/client";
import z from "zod";
import { PAGINATION } from "@/config/constants";
import { sendWorkflowExecution } from "@/inngest/utils";
import {
  getLatestExecutionCheckpoint,
  updateExecutionCheckpointState,
} from "@/langgraph/checkpoints";
import prisma from "@/lib/db";
import {
  getExecutionScalarSelect,
  getNodeExecutionColumns,
  getNodeExecutionScalarSelect,
} from "@/lib/execution-schema-compat";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const executionsRouter = createTRPCRouter({
  approve: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const executionSelect = await getExecutionScalarSelect();
      const execution = await prisma.execution.findUniqueOrThrow({
        where: {
          id: input.id,
          workflow: {
            organizationId: ctx.auth.organizationId,
          },
        },
        select: executionSelect,
      });

      if (execution.status !== ExecutionStatus.WAITING_APPROVAL) {
        throw new Error("Execution is not waiting for approval");
      }

      const checkpoint = await getLatestExecutionCheckpoint(execution.id);

      if (!checkpoint) {
        throw new Error("No checkpoint is available for this execution");
      }

      const state = checkpoint.state as Record<string, unknown>;
      const variables =
        state.variables &&
        typeof state.variables === "object" &&
        !Array.isArray(state.variables)
          ? (state.variables as Record<string, unknown>)
          : {};
      const pendingApproval =
        variables.__pendingApproval &&
        typeof variables.__pendingApproval === "object" &&
        !Array.isArray(variables.__pendingApproval)
          ? (variables.__pendingApproval as Record<string, unknown>)
          : null;
      const nodeId =
        pendingApproval && typeof pendingApproval.nodeId === "string"
          ? pendingApproval.nodeId
          : null;

      if (!nodeId) {
        throw new Error("Pending approval metadata is missing");
      }

      const approvals =
        variables.__approvals &&
        typeof variables.__approvals === "object" &&
        !Array.isArray(variables.__approvals)
          ? (variables.__approvals as Record<string, unknown>)
          : {};

      await updateExecutionCheckpointState({
        checkpointId: checkpoint.id,
        state: {
          ...(checkpoint.state as Record<string, unknown>),
          variables: {
            ...variables,
            __approvals: {
              ...approvals,
              [nodeId]: true,
            },
            __pendingApproval: undefined,
          },
        } as never,
      });

      await sendWorkflowExecution({
        workflowId: execution.workflowId,
        executionId: execution.id,
        resume: true,
      });

      return execution;
    }),
  replayFromCheckpoint: protectedProcedure
    .input(z.object({ id: z.string(), checkpointId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const executionSelect = await getExecutionScalarSelect();
      const execution = await prisma.execution.findUniqueOrThrow({
        where: {
          id: input.id,
          workflow: {
            organizationId: ctx.auth.organizationId,
          },
        },
        select: {
          ...executionSelect,
          checkpoints: {
            select: {
              id: true,
              nodeId: true,
              sequence: true,
              state: true,
            },
          },
        },
      });

      const checkpoint = execution.checkpoints.find(
        (item) => item.id === input.checkpointId,
      );

      if (!checkpoint) {
        throw new Error("Checkpoint not found for this execution");
      }

      await sendWorkflowExecution({
        workflowId: execution.workflowId,
        checkpointId: checkpoint.id,
      });

      return {
        executionId: execution.id,
        checkpointId: checkpoint.id,
      };
    }),
  resume: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const executionSelect = await getExecutionScalarSelect();
      const execution = await prisma.execution.findUniqueOrThrow({
        where: {
          id: input.id,
          workflow: {
            organizationId: ctx.auth.organizationId,
          },
        },
        select: {
          ...executionSelect,
          checkpoints: {
            orderBy: {
              sequence: "desc",
            },
            take: 1,
          },
        },
      });

      if (
        execution.status !== ExecutionStatus.FAILED &&
        execution.status !== ExecutionStatus.WAITING_APPROVAL
      ) {
        throw new Error(
          "Only failed or waiting-for-approval executions can be resumed",
        );
      }

      if (execution.checkpoints.length === 0) {
        throw new Error("No checkpoints are available for this execution");
      }

      await sendWorkflowExecution({
        workflowId: execution.workflowId,
        executionId: execution.id,
        resume: true,
      });

      return execution;
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const executionSelect = await getExecutionScalarSelect();
      const nodeExecutionColumns = await getNodeExecutionColumns();
      const nodeExecutionSelect = await getNodeExecutionScalarSelect();
      const nodeExecutionOrderBy: Prisma.NodeExecutionOrderByWithRelationInput[] =
        [{ startedAt: "asc" }];

      if (nodeExecutionColumns.has("attempt")) {
        nodeExecutionOrderBy.push({ attempt: "asc" });
      }

      const execution = await prisma.execution.findUniqueOrThrow({
        where: {
          id: input.id,
          workflow: {
            organizationId: ctx.auth.organizationId,
          },
        },
        select: {
          ...executionSelect,
          checkpoints: {
            orderBy: {
              sequence: "asc",
            },
            select: {
              id: true,
              nodeId: true,
              sequence: true,
              state: true,
            },
          },
          nodeExecutions: {
            orderBy: nodeExecutionOrderBy,
            select: {
              ...nodeExecutionSelect,
              node: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        ...execution,
        workflowVersionId:
          "workflowVersionId" in execution &&
          typeof execution.workflowVersionId === "string"
            ? execution.workflowVersionId
            : null,
        nodeExecutions: execution.nodeExecutions.map(
          (nodeExecution, index) => ({
            ...nodeExecution,
            attempt:
              typeof nodeExecution.attempt === "number"
                ? nodeExecution.attempt
                : index + 1,
            durationMs:
              typeof nodeExecution.durationMs === "number"
                ? nodeExecution.durationMs
                : null,
            routeId:
              typeof nodeExecution.routeId === "string"
                ? nodeExecution.routeId
                : null,
            logs: nodeExecution.logs ?? null,
            errorJson: nodeExecution.errorJson ?? null,
          }),
        ),
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
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const executionSelect = await getExecutionScalarSelect();

      const [items, totalCount] = await Promise.all([
        prisma.execution.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            workflow: {
              organizationId: ctx.auth.organizationId,
            },
          },
          orderBy: {
            startedAt: "desc",
          },
          select: {
            ...executionSelect,
            workflow: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.execution.count({
          where: {
            workflow: {
              organizationId: ctx.auth.organizationId,
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
