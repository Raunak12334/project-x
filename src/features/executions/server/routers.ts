import { ExecutionStatus } from "@prisma/client";
import z from "zod";
import { PAGINATION } from "@/config/constants";
import { sendWorkflowExecution } from "@/inngest/utils";
import {
  getLatestExecutionCheckpoint,
  updateExecutionCheckpointState,
} from "@/langgraph/checkpoints";
import prisma from "@/lib/db";
import {
  executionScalarSelect,
  nodeExecutionScalarSelect,
} from "@/lib/execution-schema-compat";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const executionsRouter = createTRPCRouter({
  approve: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const execution = await prisma.execution.findUniqueOrThrow({
        where: {
          id: input.id,
          workflow: {
            organizationId: ctx.auth.organizationId,
          },
        },
        select: executionScalarSelect,
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
      const execution = await prisma.execution.findUniqueOrThrow({
        where: {
          id: input.id,
          workflow: {
            organizationId: ctx.auth.organizationId,
          },
        },
        select: {
          ...executionScalarSelect,
          checkpoints: true,
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
      const execution = await prisma.execution.findUniqueOrThrow({
        where: {
          id: input.id,
          workflow: {
            organizationId: ctx.auth.organizationId,
          },
        },
        select: {
          ...executionScalarSelect,
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
    .query(({ ctx, input }) => {
      return prisma.execution
        .findUniqueOrThrow({
          where: {
            id: input.id,
            workflow: {
              organizationId: ctx.auth.organizationId,
            },
          },
          select: {
            ...executionScalarSelect,
            checkpoints: {
              orderBy: {
                sequence: "asc",
              },
            },
            nodeExecutions: {
              orderBy: [
                {
                  startedAt: "asc",
                },
                {
                  attempt: "asc",
                },
              ],
              select: {
                ...nodeExecutionScalarSelect,
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
        })
        .then((execution) => ({
          ...execution,
          workflowVersionId: null,
        }));
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
            ...executionScalarSelect,
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
