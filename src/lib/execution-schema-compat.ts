import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db";

let executionWorkflowVersionColumnPromise: Promise<boolean> | null = null;
let nodeExecutionNodeTypeColumnPromise: Promise<boolean> | null = null;
let nodeExecutionColumnsPromise: Promise<Set<string>> | null = null;
let executionColumnsPromise: Promise<Set<string>> | null = null;

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

const EXECUTION_OPTIONAL_COLUMNS = [
  "workflowVersionId",
  "deletedAt",
  "archivedAt",
  "idempotencyKey",
  "maxRetries",
  "retryCount",
  "versionUsed",
  "lastRetryAt",
  "priority",
  "queueStatus",
  "retryStrategy",
  "scheduledAt",
] as const;

export async function getExecutionColumns() {
  if (!executionColumnsPromise) {
    executionColumnsPromise = prisma.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'execution'
      `
      .then((rows) => new Set(rows.map((row) => row.column_name)))
      .catch(() => new Set<string>());
  }

  return executionColumnsPromise;
}

export async function supportsExecutionWorkflowVersionId() {
  if (!executionWorkflowVersionColumnPromise) {
    executionWorkflowVersionColumnPromise = getExecutionColumns()
      .then((columns) => columns.has("workflowVersionId"))
      .catch(() => false);
  }

  return executionWorkflowVersionColumnPromise;
}

export async function getExecutionScalarSelect() {
  const columns = await getExecutionColumns();
  const select: Prisma.ExecutionSelect = {
    id: true,
    workflowId: true,
    status: true,
    error: true,
    errorStack: true,
    startedAt: true,
    completedAt: true,
    inngestEventId: true,
    output: true,
  };

  for (const column of EXECUTION_OPTIONAL_COLUMNS) {
    if (columns.has(column)) {
      (select as Record<string, boolean>)[column] = true;
    }
  }

  return select;
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

const NODE_EXECUTION_OPTIONAL_COLUMNS = [
  "nodeType",
  "durationMs",
  "retryCount",
  "errorJson",
  "routeId",
  "logs",
  "archivedAt",
  "attempt",
] as const;

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

export async function getNodeExecutionColumns() {
  if (!nodeExecutionColumnsPromise) {
    nodeExecutionColumnsPromise = prisma.$queryRaw<
      Array<{ column_name: string }>
    >`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'node_execution'
      `
      .then((rows) => new Set(rows.map((row) => row.column_name)))
      .catch(() => new Set<string>());
  }

  return nodeExecutionColumnsPromise;
}

export async function getNodeExecutionScalarSelect() {
  const columns = await getNodeExecutionColumns();
  const select: Prisma.NodeExecutionSelect = {
    id: true,
    executionId: true,
    nodeId: true,
    status: true,
    startedAt: true,
    completedAt: true,
    error: true,
    input: true,
    output: true,
  };

  for (const column of NODE_EXECUTION_OPTIONAL_COLUMNS) {
    if (columns.has(column)) {
      (select as Record<string, boolean>)[column] = true;
    }
  }

  return select;
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

export async function stripUnsupportedNodeExecutionFields<
  T extends Prisma.NodeExecutionCreateInput | Prisma.NodeExecutionUpdateInput,
>(data: T) {
  const columns = await getNodeExecutionColumns();
  const result = { ...data } as Record<string, unknown>;

  for (const column of NODE_EXECUTION_OPTIONAL_COLUMNS) {
    if (!columns.has(column)) {
      delete result[column];
    }
  }

  return result as T;
}
