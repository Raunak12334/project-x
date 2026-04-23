type GraphHashNode = {
  id: string;
  type?: string | null;
  position: { x: number; y: number };
  data?: unknown;
};

type GraphHashEdge = {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(
        ([key, nestedValue]) =>
          `${JSON.stringify(key)}:${stableStringify(nestedValue)}`,
      )
      .join(",")}}`;
  }

  return JSON.stringify(value);
};

export function createWorkflowGraphHash(
  nodes: GraphHashNode[],
  edges: GraphHashEdge[],
) {
  const normalizedNodes = nodes
    .map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data ?? {},
    }))
    .sort((left, right) => left.id.localeCompare(right.id));

  const normalizedEdges = edges
    .map((edge) => ({
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? "main",
      targetHandle: edge.targetHandle ?? "main",
    }))
    .sort((left, right) =>
      [left.source, left.target, left.sourceHandle, left.targetHandle]
        .join(":")
        .localeCompare(
          [
            right.source,
            right.target,
            right.sourceHandle,
            right.targetHandle,
          ].join(":"),
        ),
    );

  return stableStringify({ nodes: normalizedNodes, edges: normalizedEdges });
}
