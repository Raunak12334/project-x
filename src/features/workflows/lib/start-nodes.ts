import { NodeType } from "@prisma/client";

export const triggerNodeTypes = [
  NodeType.MANUAL_TRIGGER,
  NodeType.WEBHOOK_TRIGGER,
  NodeType.GOOGLE_FORM_TRIGGER,
  NodeType.STRIPE_TRIGGER,
  NodeType.SCHEDULE,
] as const;

const triggerNodeTypeSet = new Set<NodeType>(triggerNodeTypes);

export const isTriggerNodeType = (type: NodeType) =>
  triggerNodeTypeSet.has(type);

export const resolveWorkflowStartNodeIds = (params: {
  nodes: Array<{ id: string; type: NodeType }>;
  triggerNodeId?: string;
}) => {
  if (params.triggerNodeId) {
    const matchingTrigger = params.nodes.find(
      (node) => node.id === params.triggerNodeId,
    );

    if (matchingTrigger) {
      return [matchingTrigger.id];
    }
  }

  const manualTriggers = params.nodes.filter(
    (node) => node.type === NodeType.MANUAL_TRIGGER,
  );

  if (manualTriggers.length === 1) {
    return [manualTriggers[0].id];
  }

  const triggerNodes = params.nodes.filter((node) =>
    isTriggerNodeType(node.type),
  );

  if (triggerNodes.length === 1) {
    return [triggerNodes[0].id];
  }

  return undefined;
};
