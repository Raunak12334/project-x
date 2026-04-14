export const DEFAULT_CONNECTION_HANDLE = "main";

const LEGACY_SOURCE_HANDLE = "source-1";
const LEGACY_TARGET_HANDLE = "target-1";

export type WorkflowConnectionHandle = string | null | undefined;

export type WorkflowConnectionInput = {
  source: string;
  target: string;
  sourceHandle?: WorkflowConnectionHandle;
  targetHandle?: WorkflowConnectionHandle;
};

export type NormalizedWorkflowConnection = {
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
};

export type WorkflowDbConnectionInput = {
  fromNodeId: string;
  toNodeId: string;
  fromOutput?: WorkflowConnectionHandle;
  toInput?: WorkflowConnectionHandle;
};

const normalizeHandle = (
  handle: WorkflowConnectionHandle,
  legacyDefaultHandle: string,
) => {
  if (!handle || handle === legacyDefaultHandle) {
    return DEFAULT_CONNECTION_HANDLE;
  }

  return handle;
};

export const normalizeConnectionSourceHandle = (
  handle: WorkflowConnectionHandle,
) => normalizeHandle(handle, LEGACY_SOURCE_HANDLE);

export const normalizeConnectionTargetHandle = (
  handle: WorkflowConnectionHandle,
) => normalizeHandle(handle, LEGACY_TARGET_HANDLE);

export const makeConnectionKey = (
  fromNodeId: string,
  toNodeId: string,
  fromOutput?: WorkflowConnectionHandle,
  toInput?: WorkflowConnectionHandle,
) =>
  [
    fromNodeId,
    toNodeId,
    normalizeConnectionSourceHandle(fromOutput),
    normalizeConnectionTargetHandle(toInput),
  ].join(":");

export const makeEdgeConnectionKey = (edge: WorkflowConnectionInput) =>
  makeConnectionKey(
    edge.source,
    edge.target,
    edge.sourceHandle,
    edge.targetHandle,
  );

export const makeDbConnectionKey = (connection: WorkflowDbConnectionInput) =>
  makeConnectionKey(
    connection.fromNodeId,
    connection.toNodeId,
    connection.fromOutput,
    connection.toInput,
  );

export const normalizeWorkflowConnection = (
  connection: WorkflowConnectionInput,
): NormalizedWorkflowConnection => ({
  source: connection.source,
  target: connection.target,
  sourceHandle: normalizeConnectionSourceHandle(connection.sourceHandle),
  targetHandle: normalizeConnectionTargetHandle(connection.targetHandle),
});

export const hasWorkflowConnection = (
  edges: WorkflowConnectionInput[],
  candidate: WorkflowConnectionInput,
) => {
  const candidateKey = makeEdgeConnectionKey(candidate);

  return edges.some((edge) => makeEdgeConnectionKey(edge) === candidateKey);
};

export const dedupeWorkflowConnections = <
  TConnection extends WorkflowConnectionInput,
>(
  connections: TConnection[],
) => {
  const seen = new Set<string>();

  return connections.filter((connection) => {
    const key = makeEdgeConnectionKey(connection);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export const normalizeAndDedupeWorkflowConnections = <
  TConnection extends WorkflowConnectionInput,
>(
  connections: TConnection[],
) => dedupeWorkflowConnections(connections).map(normalizeWorkflowConnection);
