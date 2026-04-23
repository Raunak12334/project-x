import type { NodeType } from "@prisma/client";
import type { Edge, Node } from "@xyflow/react";
import { isTriggerNodeType } from "./start-nodes";

export type EditorNode = Pick<Node, "id" | "type" | "data" | "position">;
export type EditorEdge = Pick<
  Edge,
  "source" | "target" | "sourceHandle" | "targetHandle"
>;

export const getTriggerNodes = (nodes: EditorNode[]) =>
  nodes.filter(
    (node) =>
      typeof node.type === "string" && isTriggerNodeType(node.type as NodeType),
  );

export const buildAdjacency = (nodes: EditorNode[], edges: EditorEdge[]) => {
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    const targets = adjacency.get(edge.source) ?? [];
    targets.push(edge.target);
    adjacency.set(edge.source, targets);
  }

  return adjacency;
};

export const findReachableNodes = (
  triggerId: string,
  adjacency: Map<string, string[]>,
) => {
  const reachable = new Set<string>();
  const stack = [triggerId];

  while (stack.length > 0) {
    const nodeId = stack.pop();

    if (!nodeId || reachable.has(nodeId)) {
      continue;
    }

    reachable.add(nodeId);
    stack.push(...(adjacency.get(nodeId) ?? []));
  }

  return reachable;
};

export const findDisconnectedNodes = (
  nodes: EditorNode[],
  reachableIds: Set<string>,
) => nodes.filter((node) => !reachableIds.has(node.id));

export const getIncomingEdges = (nodeId: string, edges: EditorEdge[]) =>
  edges.filter((edge) => edge.target === nodeId);

export const getOutgoingEdges = (nodeId: string, edges: EditorEdge[]) =>
  edges.filter((edge) => edge.source === nodeId);
