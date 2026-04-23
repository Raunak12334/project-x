import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db";

let executionWorkflowVersionColumnPromise: Promise<boolean> | null = null;
let nodeExecutionNodeTypeColumnPromise: Promise<boolean> | null = null;

export const executionScalarSelect = {
  id: true,
  workflowId: true,
  status: true,
  error: true,
  errorStack: true,
  startedAt: true,
  completedAt: true,
  inngestEventId: true,
  deletedAt: true,
  output: true,
  archivedAt: true,
  idempotencyKey: true,
  maxRetries: true,
  retryCount: true,
  versionUsed: true,
  lastRetryAt: true,
  priority: true,
  queueStatus: true,
  retryStrategy: true,
  scheduledAt: true,
} satisfies Prisma.ExecutionSelect;

export async function supportsExecutionWorkflowVersionId() {
  if (!executionWorkflowVersionColumnPromise) {
    executionWorkflowVersionColumnPromise = prisma.$queryRaw<
      Array<{ exists: boolean }>
    >`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'execution'
            AND column_name = 'workflowVersionId'
        ) AS "exists"
      `
      .then((rows) => rows[0]?.exists ?? false)
      .catch(() => false);
  }

  return executionWorkflowVersionColumnPromise;
}

export function withExecutionWorkflowVersionId<
  T extends Prisma.ExecutionCreateInput | Prisma.ExecutionUpdateInput,
>(data: T, workflowVersionId?: string | null) {
  if (!workflowVersionId) {
    return data;
  }

  return {
    ...data,
    workflowVersionId,
  };
}

export const nodeExecutionScalarSelect = {
  id: true,
  executionId: true,
  nodeId: true,
  status: true,
  startedAt: true,
  completedAt: true,
  durationMs: true,
  retryCount: true,
  error: true,
  errorJson: true,
  input: true,
  output: true,
  routeId: true,
  logs: true,
  archivedAt: true,
  attempt: true,
} satisfies Prisma.NodeExecutionSelect;

export async function supportsNodeExecutionNodeType() {
  if (!nodeExecutionNodeTypeColumnPromise) {
    nodeExecutionNodeTypeColumnPromise = prisma.$queryRaw<
      Array<{ exists: boolean }>
    >`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'node_execution'
            AND column_name = 'nodeType'
        ) AS "exists"
      `
      .then((rows) => rows[0]?.exists ?? false)
      .catch(() => false);
  }

  return nodeExecutionNodeTypeColumnPromise;
}

export function withNodeExecutionNodeType<
  T extends Prisma.NodeExecutionCreateInput | Prisma.NodeExecutionUpdateInput,
>(data: T, nodeType?: string | null) {
  if (!nodeType) {
    return data;
  }

  return {
    ...data,
    nodeType,
  };
}
