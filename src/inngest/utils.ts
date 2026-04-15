import { createId } from "@paralleldrive/cuid2";
import type { Connection, Node } from "@prisma/client";
import toposort from "toposort";
import { inngest } from "./client";

export const topologicalSort = (
  nodes: Node[],
  connections: Connection[],
): Node[] => {
  // If no connections, return node as-is (they're all independent)
  if (connections.length === 0) {
    return nodes;
  }

  // Create edges array for toposort
  const edges: [string, string][] = connections.map((conn) => [
    conn.fromNodeId,
    conn.toNodeId,
  ]);

  // Perform topological sort using the .array method to properly handle independent nodes
  let sortedNodeIds: string[];
  try {
    const nodeIds = nodes.map((n) => n.id);
    sortedNodeIds = toposort.array(nodeIds, edges);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle");
    }
    throw error;
  }

  // Map sorted IDs back to node objects
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return sortedNodeIds
    .map((id) => nodeMap.get(id))
    .filter((node): node is Node => Boolean(node));
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  executionId?: string;
  checkpointId?: string;
  resume?: boolean;
  idempotencyKey?: string;
  [key: string]: unknown;
}) => {
  return inngest.send({
    name: "workflows/execute.workflow",
    data,
    id: data.idempotencyKey || createId(),
  });
};
