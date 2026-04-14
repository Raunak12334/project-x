import type { Realtime } from "@inngest/realtime";
import { ExecutionStatus, type NodeType, Prisma } from "@prisma/client";
import { NonRetriableError } from "inngest";
import { executeNode } from "@/features/nodes/system/engine-adapter";
import type { StepTools } from "@/features/executions/types";
import { resolveWorkflowStartNodeIds } from "@/features/workflows/lib/start-nodes";
import { isLangGraphEnabled } from "@/langgraph/config";
import { runWorkflowGraph } from "@/langgraph/run-graph";
import prisma from "@/lib/db";
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
import { topologicalSort } from "./utils";

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
  console.log(
    `[selectNextConnections] Node ${nodeId} has ${connections.length} total connections. Routing to: ${selectedRoute}`,
  );

  const matchingConnections = connections.filter(
    (connection) => connection.fromOutput === selectedRoute,
  );

  if (matchingConnections.length > 0) {
    console.log(
      `[selectNextConnections] Node ${nodeId} found ${matchingConnections.length} matching connections for route ${selectedRoute}`,
    );
    return matchingConnections;
  }

  const fallbackConnections = connections.filter(
    (connection) =>
      connection.fromOutput === "default" || connection.fromOutput === "main",
  );

  console.log(
    `[selectNextConnections] Node ${nodeId} using ${fallbackConnections.length} fallback connections (main/default)`,
  );

  return fallbackConnections;
};

const runLegacyWorkflow = async (params: {
  orderedNodes: RuntimeNode[];
  connections: RuntimeConnection[];
  organizationId: string;
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
    console.log(
      `[runLegacyWorkflow] Checking node: ${node.id} (${node.type}). Active: ${activeNodes.has(node.id)}`,
    );
    if (!activeNodes.has(node.id)) {
      continue;
    }

    console.log(
      `[runLegacyWorkflow] Executing node: ${node.id} (${node.type})`,
    );

    const result = await executeNode({
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

    // CRITICAL FIX: Merge context instead of replacing it
    context = {
      ...context,
      ...result.data,
      __routes: {
        ...(context.__routes as Record<string, string>),
        [node.id]: result.routeId,
      },
    };

    const candidateConnections = outgoingConnections.get(node.id) ?? [];
    const nextConnections = selectNextConnections(
      candidateConnections,
      context,
      node.id,
    );

    console.log(
      `[runLegacyWorkflow] Node ${node.id} finished. Activating ${nextConnections.length} next nodes.`,
    );
    for (const connection of nextConnections) {
      console.log(
        `[runLegacyWorkflow]   Activating node: ${connection.toNodeId}`,
      );
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

      console.error(
        `Workflow execution failed for event ${originalEvent.id}:`,
        error.message,
      );

      // Find execution by inngestEventId (non-unique index)
      const execution = await prisma.execution.findFirst({
        where: { inngestEventId: originalEvent.id },
      });

      if (!execution) {
        console.warn(
          `No execution found for inngestEventId: ${originalEvent.id}`,
        );
        return;
      }

      return prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.FAILED,
          error: error.message,
          errorStack: error.stack,
        },
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

    if (!inngestEventId || !workflowId) {
      throw new NonRetriableError("Event ID or workflow ID is missing");
    }

    console.log(
      `Starting workflow execution for workflowId: ${workflowId}, executionId: ${resumeExecutionId || "new"}`,
    );

    const execution = await step.run("create-execution", async () => {
      if (resumeExecutionId) {
        return prisma.execution.update({
          where: {
            id: resumeExecutionId,
            workflowId,
          },
          data: {
            status: ExecutionStatus.RUNNING,
            error: null,
            errorStack: null,
            completedAt: null,
            inngestEventId,
            output: Prisma.JsonNull,
          },
        });
      }

      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
        },
      });
    });

    const { workflowDefinition, organizationId } = await step.run(
      "prepare-workflow-context",
      async () => {
        const workflow = await prisma.workflow.findUniqueOrThrow({
          where: { id: workflowId },
          include: {
            nodes: true,
            connections: true,
          },
        });

        const orderedNodes = topologicalSort(
          workflow.nodes,
          workflow.connections,
        );

        return {
          organizationId: workflow.organizationId,
          workflowDefinition: {
            nodes: orderedNodes.map((node) => ({
              id: node.id,
              type: node.type,
              data: node.data,
            })),
            connections: workflow.connections.map((connection) => ({
              fromNodeId: connection.fromNodeId,
              toNodeId: connection.toNodeId,
              fromOutput: connection.fromOutput,
            })),
          },
        };
      },
    );

    const graphResult = isLangGraphEnabled()
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
      });
    });

    return {
      workflowId,
      result: context,
    };
  },
);
