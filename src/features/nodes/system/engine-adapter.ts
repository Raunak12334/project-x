import { NodeType } from "@prisma/client";
import { getExecutor as getLegacyExecutor } from "@/features/executions/lib/executor-registry";
import { decrypt } from "@/lib/encryption";
import { getNodeDefinition } from "../core/registry";
import type {
  NodeExecutionResult,
  PublishFn,
  StepRunner,
  WorkflowContext,
} from "../core/types";

const BRANCHING_NODE_TYPES = new Set<NodeType>([
  NodeType.CONDITION,
  NodeType.ROUTER,
]);

export const extractRouteIdFromLegacyResult = (params: {
  result: unknown;
  nodeId: string;
  context?: WorkflowContext;
}): string | undefined => {
  const { result, nodeId, context } = params;

  if (result && typeof result === "object" && !Array.isArray(result)) {
    const record = result as Record<string, unknown>;

    if (typeof record.routeId === "string" && record.routeId.length > 0) {
      return record.routeId;
    }

    if (
      record.__routes &&
      typeof record.__routes === "object" &&
      !Array.isArray(record.__routes)
    ) {
      const route = (record.__routes as Record<string, unknown>)[nodeId];

      if (typeof route === "string" && route.length > 0) {
        return route;
      }
    }
  }

  const contextRoutes = context?.__routes;

  if (
    contextRoutes &&
    typeof contextRoutes === "object" &&
    !Array.isArray(contextRoutes)
  ) {
    const route = (contextRoutes as Record<string, unknown>)[nodeId];

    if (typeof route === "string" && route.length > 0) {
      return route;
    }
  }

  return undefined;
};

const adaptLegacyResult = (params: {
  node: { id: string; type: NodeType };
  result: unknown;
  context: WorkflowContext;
}): NodeExecutionResult => {
  const routeId = extractRouteIdFromLegacyResult({
    result: params.result,
    nodeId: params.node.id,
    context: params.context,
  });

  if (!routeId && BRANCHING_NODE_TYPES.has(params.node.type)) {
    return {
      status: "FAILURE",
      data: {},
      routeId: "",
      error: {
        message: `Branching node ${params.node.id} did not return a route`,
        code: "MISSING_BRANCH_ROUTE",
        isRetriable: false,
      },
    };
  }

  return {
    status: "SUCCESS",
    data: params.result,
    routeId: routeId ?? "main",
  };
};

/**
 * Adapter to bridge legacy execution logic with the new hardened node system.
 * It detects if a node has a new definition and uses it, otherwise falls back to legacy.
 */
export async function executeNode(params: {
  node: {
    id: string;
    type: NodeType;
    data: Record<string, unknown>;
    version?: number;
  };
  organizationId: string;
  context: WorkflowContext;
  step: StepRunner;
  publish: PublishFn;
}): Promise<NodeExecutionResult> {
  const { node, organizationId, context, step, publish } = params;
  const definition = getNodeDefinition(node.type, node.version || 1);

  if (!definition) {
    // Fallback to legacy system
    const legacyExecutor = getLegacyExecutor(node.type);
    const result = await legacyExecutor({
      data: node.data,
      nodeId: node.id,
      organizationId,
      context,
      step,
      publish,
    });

    return adaptLegacyResult({ node, result, context });
  }

  // New hardened execution path
  // 1. Resolve credentials (basic implementation for now)
  const resolvedCredentials: Record<string, string> = {};
  for (const req of definition.credentials) {
    const credId = node.data[req.key];
    if (typeof credId === "string" && credId) {
      const { default: prisma } = await import("@/lib/db");
      const credential = await step.run(
        `${node.id}-resolve-cred-${req.key}`,
        async () => {
          return prisma.credential.findFirst({
            where: { id: credId, organizationId },
          });
        },
      );

      if (credential) {
        resolvedCredentials[req.key] = decrypt(
          credential.valueEncrypted || credential.value || "",
        );
      }
    }
  }

  // 2. Inject nodeId into config for realtime updates if needed
  const configWithMetadata = {
    ...node.data,
    nodeId: node.id,
  };

  // 3. Execute
  if (definition.execute) {
    const result = await definition.execute({
      config: configWithMetadata,
      context,
      organizationId,
      credentials: resolvedCredentials,
      step,
      publish,
    });

    return result;
  }

  // If no execution function on definition, try legacy registry as fallback
  const legacyExecutor = getLegacyExecutor(node.type);
  const result = await legacyExecutor({
    data: configWithMetadata,
    nodeId: node.id,
    organizationId,
    context,
    step,
    publish,
  });

  return adaptLegacyResult({ node, result, context });
}
