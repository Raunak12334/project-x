import type { NodeType } from "@prisma/client";
import { getExecutor as getLegacyExecutor } from "@/features/executions/lib/executor-registry";
import { decrypt } from "@/lib/encryption";
import { getNodeDefinition } from "../core/registry";
import type {
  NodeExecutionResult,
  PublishFn,
  StepRunner,
  WorkflowContext,
} from "../core/types";

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

    // Adapt legacy context return to new result contract
    return {
      status: "SUCCESS",
      data: result,
      routeId: "main", // Legacy nodes always assume 'main' route
    };
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

  return {
    status: "SUCCESS",
    data: result,
    routeId: "main",
  };
}
