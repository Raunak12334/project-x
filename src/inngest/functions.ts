import type { Realtime } from "@inngest/realtime";
import {
  ExecutionStatus,
  NodeStatus,
  type NodeType,
  Prisma,
} from "@prisma/client";
import { NonRetriableError } from "inngest";
import type { StepTools } from "@/features/executions/types";
import type { NodeExecutionResult } from "@/features/nodes/core/types";
import { executeNode } from "@/features/nodes/system/engine-adapter";
import { resolveWorkflowStartNodeIds } from "@/features/workflows/lib/start-nodes";
import { isLangGraphEnabled } from "@/langgraph/config";
import { runWorkflowGraph } from "@/langgraph/run-graph";
import prisma from "@/lib/db";
import {
  executionScalarSelect,
  supportsExecutionWorkflowVersionId,
  withExecutionWorkflowVersionId,
} from "@/lib/execution-schema-compat";
import { logger } from "@/lib/logger";
import { anthropicChannel } from "./channels/anthropic";
import { dbQueryChannel } from "./channels/db-query";
import { discordChannel } from "./channels/discord";
import { emailChannel } from "./channels/email";
import { emailParserChannel } from "./channels/email-parser";
import { fileStorageChannel } from "./channels/file-storage";
import { geminiChannel } from "./channels/gemini";
import { gemmaChannel } from "./channels/gemma";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { googleSheetsChannel } from "./channels/google-sheets";
import { httpRequestChannel } from "./channels/http-request";
import { hubspotChannel } from "./channels/hubspot";
import { huggingFaceChannel } from "./channels/huggingface";
import { instagramChannel } from "./channels/instagram";
import { linkedinChannel } from "./channels/linkedin";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { openAiChannel } from "./channels/openai";
import { scheduleChannel } from "./channels/schedule";
import { shopifyChannel } from "./channels/shopify";
import { slackChannel } from "./channels/slack";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { telegramChannel } from "./channels/telegram";
import { twilioSmsChannel } from "./channels/twilio-sms";
import { webhookTriggerChannel } from "./channels/webhook-trigger";
import { xChannel } from "./channels/x";
import { inngest } from "./client";

type RuntimeNode = {
  id: string;
  type: NodeType;
  data: unknown;
};

type RuntimeConnection = {
  fromNodeId: string;
  toNodeId: string;
  fromOutput: string;
};

type WorkflowVersionNode = {
  id: string;
  type: NodeType;
  data?: unknown;
  position?: unknown;
};

type WorkflowVersionConnection = {
  source?: string;
  target?: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  fromNodeId?: string;
  toNodeId?: string;
  fromOutput?: string | null;
  toInput?: string | null;
};

const toJsonValue = (value: unknown): Prisma.InputJsonValue => {
  if (value === undefined) {
    return Prisma.JsonNull as unknown as Prisma.InputJsonValue;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
};

const toInputJsonValue = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const getErrorStack = (error: unknown) =>
  error instanceof Error ? error.stack : undefined;

const orderRuntimeNodes = (
  nodes: RuntimeNode[],
  connections: RuntimeConnection[],
) => {
  if (connections.length === 0) {
    return nodes;
  }

  const incoming = new Map(nodes.map((node) => [node.id, 0]));
  const outgoing = new Map<string, string[]>();

  for (const connection of connections) {
    incoming.set(
      connection.toNodeId,
      (incoming.get(connection.toNodeId) ?? 0) + 1,
    );
    outgoing.set(connection.fromNodeId, [
      ...(outgoing.get(connection.fromNodeId) ?? []),
      connection.toNodeId,
    ]);
  }

  const queue = nodes
    .filter((node) => (incoming.get(node.id) ?? 0) === 0)
    .map((node) => node.id);
  const orderedIds: string[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId) {
      continue;
    }

    orderedIds.push(nodeId);
    for (const targetId of outgoing.get(nodeId) ?? []) {
      const nextIncoming = (incoming.get(targetId) ?? 0) - 1;
      incoming.set(targetId, nextIncoming);
      if (nextIncoming === 0) {
        queue.push(targetId);
      }
    }
  }

  if (orderedIds.length !== nodes.length) {
    throw new Error("Workflow contains a cycle");
  }

  const byId = new Map(nodes.map((node) => [node.id, node]));
  return orderedIds
    .map((nodeId) => byId.get(nodeId))
    .filter((node): node is RuntimeNode => Boolean(node));
};

const parseWorkflowVersionNodes = (value: unknown): RuntimeNode[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((node): RuntimeNode | null => {
      const record = node as WorkflowVersionNode;
      if (!record.id || !record.type) {
        return null;
      }

      return {
        id: record.id,
        type: record.type,
        data: record.data ?? {},
      };
    })
    .filter((node): node is RuntimeNode => Boolean(node));
};

const parseWorkflowVersionConnections = (
  value: unknown,
): RuntimeConnection[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((connection): RuntimeConnection | null => {
      const record = connection as WorkflowVersionConnection;
      const fromNodeId = record.fromNodeId ?? record.source;
      const toNodeId = record.toNodeId ?? record.target;

      if (!fromNodeId || !toNodeId) {
        return null;
      }

      return {
        fromNodeId,
        toNodeId,
        fromOutput: record.fromOutput ?? record.sourceHandle ?? "main",
      };
    })
    .filter((connection): connection is RuntimeConnection =>
      Boolean(connection),
    );
};

const getSelectedRouteForNode = (
  variables: Record<string, unknown>,
  nodeId: string,
): string => {
  const routes = variables.__routes;

  if (!routes || typeof routes !== "object" || Array.isArray(routes)) {
    return "main";
  }

  const selectedRoute = (routes as Record<string, unknown>)[nodeId];

  return typeof selectedRoute === "string" ? selectedRoute : "main";
};

const selectNextConnections = (
  connections: RuntimeConnection[],
  context: Record<string, unknown>,
  nodeId: string,
) => {
  if (connections.length === 0) {
    return [];
  }

  // If there's only one connection, always follow it unless it's explicitly conditional
  if (connections.length === 1 && connections[0].fromOutput === "main") {
    return connections;
  }

  const usesConditionalRouting =
    connections.some((connection) => connection.fromOutput !== "main") ||
    new Set(connections.map((connection) => connection.fromOutput)).size > 1;

  if (!usesConditionalRouting) {
    return connections;
  }

  const selectedRoute = getSelectedRouteForNode(context, nodeId);
  logger.debug("workflow.route.selected", {
    nodeId,
    connectionCount: connections.length,
    selectedRoute,
  });

  const matchingConnections = connections.filter(
    (connection) => connection.fromOutput === selectedRoute,
  );

  if (matchingConnections.length > 0) {
    logger.debug("workflow.route.matched", {
      nodeId,
      selectedRoute,
      connectionCount: matchingConnections.length,
    });
    return matchingConnections;
  }

  const fallbackConnections = connections.filter(
    (connection) =>
      connection.fromOutput === "default" || connection.fromOutput === "main",
  );

  logger.debug("workflow.route.fallback", {
    nodeId,
    connectionCount: fallbackConnections.length,
  });

  return fallbackConnections;
};

const runLegacyWorkflow = async (params: {
  orderedNodes: RuntimeNode[];
  connections: RuntimeConnection[];
  organizationId: string;
  executionId: string;
  initialData: Record<string, unknown>;
  triggerNodeId?: string;
  step: StepTools;
  publish: Realtime.PublishFn;
}) => {
  const outgoingConnections = new Map<string, RuntimeConnection[]>();
  const incomingCount = new Map<string, number>();
  const activeNodes = new Set<string>();

  for (const node of params.orderedNodes) {
    incomingCount.set(node.id, 0);
  }

  for (const connection of params.connections) {
    const list = outgoingConnections.get(connection.fromNodeId) ?? [];
    list.push(connection);
    outgoingConnections.set(connection.fromNodeId, list);

    incomingCount.set(
      connection.toNodeId,
      (incomingCount.get(connection.toNodeId) ?? 0) + 1,
    );
  }

  const startNodeIds = resolveWorkflowStartNodeIds({
    nodes: params.orderedNodes,
    triggerNodeId: params.triggerNodeId,
  });

  if (startNodeIds?.length) {
    for (const nodeId of startNodeIds) {
      activeNodes.add(nodeId);
    }
  } else {
    for (const node of params.orderedNodes) {
      if ((incomingCount.get(node.id) ?? 0) === 0) {
        activeNodes.add(node.id);
      }
    }
  }

  let context = params.initialData;

  for (const node of params.orderedNodes) {
    logger.debug("workflow.node.checked", {
      nodeId: node.id,
      nodeType: node.type,
      active: activeNodes.has(node.id),
    });
    if (!activeNodes.has(node.id)) {
      continue;
    }

    logger.info("workflow.node.executing", {
      nodeId: node.id,
      nodeType: node.type,
      organizationId: params.organizationId,
    });

    const nodeInput = context;
    const nodeStartedAt = new Date();
    const nodeExecution = await params.step.run(
      `${node.id}-node-execution-start`,
      async () => {
        const attempt =
          (await prisma.nodeExecution.count({
            where: {
              executionId: params.executionId,
              nodeId: node.id,
            },
          })) + 1;

        return prisma.nodeExecution.create({
          data: {
            executionId: params.executionId,
            nodeId: node.id,
            nodeType: node.type,
            status: NodeStatus.RUNNING,
            startedAt: nodeStartedAt,
            attempt,
            input: toJsonValue(nodeInput),
            logs: toJsonValue([
              {
                level: "info",
                message: `Started ${node.type}`,
                timestamp: nodeStartedAt.toISOString(),
              },
            ]),
          },
        });
      },
    );

    let result: NodeExecutionResult;
    try {
      result = await executeNode({
        node: {
          id: node.id,
          type: node.type as NodeType,
          data: (node.data as Record<string, unknown>) ?? {},
        },
        organizationId: params.organizationId,
        context,
        step: params.step,
        publish: params.publish,
      });

      if (result.status === "FAILURE") {
        throw new Error(
          result.error?.message || `Node ${node.id} failed execution`,
        );
      }
    } catch (error) {
      const completedAt = new Date();
      const durationMs = completedAt.getTime() - nodeStartedAt.getTime();

      await params.step.run(`${node.id}-node-execution-failed`, async () => {
        return prisma.nodeExecution.update({
          where: { id: nodeExecution.id },
          data: {
            status: NodeStatus.FAILED,
            completedAt,
            durationMs,
            error: getErrorMessage(error),
            errorJson: toJsonValue({
              message: getErrorMessage(error),
              stack: getErrorStack(error),
            }),
            logs: toJsonValue([
              {
                level: "info",
                message: `Started ${node.type}`,
                timestamp: nodeStartedAt.toISOString(),
              },
              {
                level: "error",
                message: `Failed ${node.type}`,
                timestamp: completedAt.toISOString(),
                error: {
                  message: getErrorMessage(error),
                },
              },
            ]),
            output: toJsonValue({
              error: {
                message: getErrorMessage(error),
                stack: getErrorStack(error),
              },
            }),
          },
        });
      });

      throw error;
    }

    // CRITICAL FIX: Merge context instead of replacing it
    const resultData =
      result.data &&
      typeof result.data === "object" &&
      !Array.isArray(result.data)
        ? (result.data as Record<string, unknown>)
        : {};
    const resultRoutes =
      resultData.__routes &&
      typeof resultData.__routes === "object" &&
      !Array.isArray(resultData.__routes)
        ? (resultData.__routes as Record<string, string>)
        : {};

    context = {
      ...context,
      ...resultData,
      __routes: {
        ...(context.__routes as Record<string, string>),
        ...resultRoutes,
        [node.id]: result.routeId,
      },
    };

    const candidateConnections = outgoingConnections.get(node.id) ?? [];
    const nextConnections = selectNextConnections(
      candidateConnections,
      context,
      node.id,
    );

    logger.info("workflow.node.completed", {
      nodeId: node.id,
      routeId: result.routeId,
      nextNodeCount: nextConnections.length,
    });

    const nodeCompletedAt = new Date();
    const durationMs = nodeCompletedAt.getTime() - nodeStartedAt.getTime();
    await params.step.run(`${node.id}-node-execution-success`, async () => {
      return prisma.nodeExecution.update({
        where: { id: nodeExecution.id },
        data: {
          status: NodeStatus.SUCCESS,
          completedAt: nodeCompletedAt,
          durationMs,
          output: toJsonValue(resultData),
          routeId: result.routeId,
          logs: toJsonValue([
            {
              level: "info",
              message: `Started ${node.type}`,
              timestamp: nodeStartedAt.toISOString(),
            },
            {
              level: "info",
              message: `Selected route ${result.routeId}`,
              timestamp: nodeCompletedAt.toISOString(),
              routeId: result.routeId,
              nextNodeIds: nextConnections.map(
                (connection) => connection.toNodeId,
              ),
            },
            {
              level: "info",
              message: `Completed ${node.type}`,
              timestamp: nodeCompletedAt.toISOString(),
              durationMs,
            },
          ]),
        },
      });
    });

    for (const connection of nextConnections) {
      logger.debug("workflow.node.activated", {
        fromNodeId: node.id,
        toNodeId: connection.toNodeId,
      });
      activeNodes.add(connection.toNodeId);
    }
  }

  return context;
};

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: process.env.NODE_ENV === "production" ? 3 : 0,
    onFailure: async ({ event }) => {
      const error = event.data.error;
      const originalEvent = event.data.event;

      logger.error("workflow.execution.failed", {
        inngestEventId: originalEvent.id,
        error,
      });

      // Find execution by inngestEventId (non-unique index)
      const execution = await prisma.execution.findFirst({
        where: { inngestEventId: originalEvent.id },
        select: executionScalarSelect,
      });

      if (!execution) {
        logger.warn("workflow.execution_record_missing", {
          inngestEventId: originalEvent.id,
        });
        return;
      }

      return prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.FAILED,
          error: error.message,
          errorStack: error.stack,
        },
        select: executionScalarSelect,
      });
    },
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      webhookTriggerChannel(),
      gemmaChannel(),
      geminiChannel(),
      huggingFaceChannel(),
      openAiChannel(),
      anthropicChannel(),
      discordChannel(),
      slackChannel(),
      instagramChannel(),
      linkedinChannel(),
      telegramChannel(),
      xChannel(),
      googleSheetsChannel(),
      emailChannel(),
      emailParserChannel(),
      scheduleChannel(),
      fileStorageChannel(),
      dbQueryChannel(),
      twilioSmsChannel(),
      hubspotChannel(),
      shopifyChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;
    const resumeExecutionId = event.data.executionId as string | undefined;
    const checkpointId = event.data.checkpointId as string | undefined;
    const triggerNodeId = event.data.triggerNodeId as string | undefined;
    const idempotencyKey = event.data.idempotencyKey as string | undefined;
    const eventWorkflowVersionId = event.data.workflowVersionId as
      | string
      | undefined;

    if (!inngestEventId || !workflowId) {
      throw new NonRetriableError("Event ID or workflow ID is missing");
    }

    logger.info("workflow.execution.starting", {
      workflowId,
      executionId: resumeExecutionId || "new",
      inngestEventId,
      triggerNodeId,
      idempotencyKey,
    });

    if (!resumeExecutionId && idempotencyKey) {
      const existingExecution = await step.run(
        "check-idempotency",
        async () => {
          return prisma.execution.findFirst({
            where: { idempotencyKey },
            select: executionScalarSelect,
          });
        },
      );

      if (existingExecution) {
        logger.warn("workflow.execution.replay_skipped", {
          workflowId,
          idempotencyKey,
          existingExecutionId: existingExecution.id,
        });
        return existingExecution.output || {};
      }
    }

    const execution = await step.run("create-execution", async () => {
      const canStoreWorkflowVersionId =
        await supportsExecutionWorkflowVersionId();

      if (resumeExecutionId) {
        return prisma.execution.update({
          where: {
            id: resumeExecutionId,
            workflowId,
          },
          data: withExecutionWorkflowVersionId(
            {
              status: ExecutionStatus.RUNNING,
              error: null,
              errorStack: null,
              completedAt: null,
              inngestEventId,
              output: Prisma.JsonNull,
            },
            canStoreWorkflowVersionId ? eventWorkflowVersionId : null,
          ),
          select: executionScalarSelect,
        });
      }

      try {
        return await prisma.execution.create({
          data: withExecutionWorkflowVersionId(
            {
              workflowId,
              inngestEventId,
              idempotencyKey,
            },
            canStoreWorkflowVersionId ? eventWorkflowVersionId : null,
          ),
          select: executionScalarSelect,
        });
      } catch (error) {
        if (
          idempotencyKey &&
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "P2002"
        ) {
          const existingExecution = await prisma.execution.findFirstOrThrow({
            where: { idempotencyKey },
            select: executionScalarSelect,
          });
          logger.warn("workflow.execution.concurrent_replay_skipped", {
            workflowId,
            idempotencyKey,
            existingExecutionId: existingExecution.id,
          });
          return existingExecution;
        }

        throw error;
      }
    });

    if (!resumeExecutionId && execution.inngestEventId !== inngestEventId) {
      return execution.output || {};
    }

    const { workflowDefinition, organizationId, workflowVersionId } =
      await step.run("prepare-workflow-context", async () => {
        let workflowVersionId = eventWorkflowVersionId;

        if (!workflowVersionId) {
          const workflow = await prisma.workflow.findUniqueOrThrow({
            where: { id: workflowId },
            include: {
              nodes: {
                where: {
                  deletedAt: null,
                },
              },
              connections: true,
            },
          });
          const latest = await prisma.workflowVersion.aggregate({
            where: { workflowId },
            _max: { version: true },
          });
          const version = (latest._max.version ?? 0) + 1;
          const workflowVersion = await prisma.workflowVersion.create({
            data: {
              workflowId,
              version,
              name: workflow.name,
              nodes: toInputJsonValue(
                workflow.nodes.map((node) => ({
                  id: node.id,
                  type: node.type,
                  data: node.data,
                  position: node.position,
                })),
              ),
              connections: toInputJsonValue(
                workflow.connections.map((connection) => ({
                  source: connection.fromNodeId,
                  target: connection.toNodeId,
                  sourceHandle: connection.fromOutput,
                  targetHandle: connection.toInput,
                })),
              ),
            },
          });

          if (await supportsExecutionWorkflowVersionId()) {
            await prisma.execution.update({
              where: { id: execution.id },
              data: {
                workflowVersionId: workflowVersion.id,
                versionUsed: workflowVersion.version,
              },
              select: executionScalarSelect,
            });
          } else {
            await prisma.execution.update({
              where: { id: execution.id },
              data: {
                versionUsed: workflowVersion.version,
              },
              select: executionScalarSelect,
            });
          }

          workflowVersionId = workflowVersion.id;
        }

        const workflowVersion = await prisma.workflowVersion.findFirstOrThrow({
          where: {
            id: workflowVersionId,
            workflowId,
          },
          include: {
            workflow: {
              select: {
                organizationId: true,
              },
            },
          },
        });
        const nodes = parseWorkflowVersionNodes(workflowVersion.nodes);
        const connections = parseWorkflowVersionConnections(
          workflowVersion.connections,
        );
        const orderedNodes = orderRuntimeNodes(nodes, connections);

        return {
          organizationId: workflowVersion.workflow.organizationId,
          workflowVersionId: workflowVersion.id,
          workflowDefinition: {
            nodes: orderedNodes,
            connections,
          },
        };
      });

    const graphResult =
      isLangGraphEnabled() && !workflowVersionId
        ? await runWorkflowGraph({
            executionId: execution.id,
            workflowId,
            organizationId,
            inngestEventId,
            checkpointId,
            triggerNodeId,
            initialData: event.data.initialData || {},
            step,
            publish,
          })
        : null;

    let context: Record<string, unknown>;

    if (graphResult?.output) {
      context = graphResult.output;
    } else {
      context = await runLegacyWorkflow({
        orderedNodes: workflowDefinition.nodes,
        connections: workflowDefinition.connections,
        organizationId,
        executionId: execution.id,
        initialData: (event.data.initialData || {}) as Record<string, unknown>,
        triggerNodeId,
        step,
        publish,
      });
    }

    if (graphResult?.awaitingApproval) {
      await step.run("mark-waiting-approval", async () => {
        return prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: ExecutionStatus.WAITING_APPROVAL,
            output: context as Prisma.InputJsonValue,
          },
          select: executionScalarSelect,
        });
      });

      return {
        workflowId,
        result: context,
        waitingForApproval: true,
      };
    }

    await step.run("update-execution", async () => {
      return prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context as Prisma.InputJsonValue,
        },
        select: executionScalarSelect,
      });
    });

    return {
      workflowId,
      result: context,
    };
  },
);
