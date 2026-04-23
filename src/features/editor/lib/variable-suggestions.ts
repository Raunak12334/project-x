import { NodeType } from "@prisma/client";
import type { Edge, Node } from "@xyflow/react";

export type VariableSuggestion = {
  label: string;
  token: string;
  description: string;
};

const getNodeVariableName = (node: Node) => {
  const variableName = node.data?.variableName;
  return typeof variableName === "string" && variableName.trim()
    ? variableName.trim()
    : null;
};

const getOutgoingShape = (node: Node): string[] => {
  switch (node.type) {
    case NodeType.OPENAI:
    case NodeType.GEMINI:
    case NodeType.GEMMA:
    case NodeType.ANTHROPIC:
    case NodeType.HUGGINGFACE:
      return ["text"];
    case NodeType.HTTP_REQUEST:
      return [
        "httpResponse.data",
        "httpResponse.status",
        "httpResponse.headers",
      ];
    case NodeType.COMPOSIO:
      return ["data"];
    case NodeType.ROUTER:
      return ["selectedRoute"];
    case NodeType.CONDITION:
      return ["result"];
    case NodeType.TEXT_TEMPLATE:
      return ["text"];
    case NodeType.JSON_TRANSFORM:
      return ["data"];
    default:
      return [];
  }
};

const findUpstreamNodeIds = (nodeId: string, edges: Edge[]) => {
  const reverse = new Map<string, string[]>();

  for (const edge of edges) {
    reverse.set(edge.target, [
      ...(reverse.get(edge.target) ?? []),
      edge.source,
    ]);
  }

  const visited = new Set<string>();
  const queue = [...(reverse.get(nodeId) ?? [])];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);
    queue.push(...(reverse.get(current) ?? []));
  }

  return visited;
};

export const getVariableSuggestions = ({
  nodeId,
  nodes,
  edges,
}: {
  nodeId: string;
  nodes: Node[];
  edges: Edge[];
}): VariableSuggestion[] => {
  const upstreamIds = findUpstreamNodeIds(nodeId, edges);
  const suggestions: VariableSuggestion[] = [
    {
      label: "Trigger payload",
      token: "{{json trigger}}",
      description: "Full trigger input as JSON",
    },
  ];

  for (const node of nodes) {
    if (!upstreamIds.has(node.id)) {
      continue;
    }

    const variableName = getNodeVariableName(node);
    if (!variableName) {
      continue;
    }

    const fields = getOutgoingShape(node);
    suggestions.push({
      label: variableName,
      token: `{{json ${variableName}}}`,
      description: "Full node output as JSON",
    });

    for (const field of fields) {
      suggestions.push({
        label: `${variableName}.${field}`,
        token: `{{${variableName}.${field}}}`,
        description: "Insert this upstream output",
      });
    }
  }

  return suggestions;
};
