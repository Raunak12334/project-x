"use client";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  MiniMap,
  type Node,
  type NodeChange,
  Panel,
  ReactFlow,
} from "@xyflow/react";
import { NodeType } from "@prisma/client";
import { useSetAtom } from "jotai";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import {
  hasWorkflowConnection,
  normalizeWorkflowConnection,
} from "@/features/workflows/lib/connections";

import "@xyflow/react/dist/style.css";
import { nodeComponents } from "@/config/node-components";
import { editorAtom } from "../store/atoms";
import { AddNodeButton } from "./add-node-button";
import { ExecuteWorkflowButton } from "./execute-workflow-button";
import { WorkflowSidebar } from "./workflow-sidebar";
import { selectedNodeIdAtom } from "../store/atoms";

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};

export const EditorError = () => {
  return <ErrorView message="Error loading editor" />;
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);

  const setEditor = useSetAtom(editorAtom);
  const containerRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);

  const onSelectionChange = useCallback(
    ({ nodes }: { nodes: Node[] }) => {
      if (nodes.length > 0) {
        setSelectedNodeId(nodes[0].id);
      }
    },
    [setSelectedNodeId],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => {
        if (hasWorkflowConnection(edgesSnapshot, params)) {
          if (process.env.NODE_ENV !== "production") {
            console.debug("[workflow-editor] Duplicate edge ignored", params);
          }

          return edgesSnapshot;
        }

        return addEdge(normalizeWorkflowConnection(params), edgesSnapshot);
      }),
    [],
  );

  const hasManualTrigger = useMemo(() => {
    return nodes.some(
      (node) =>
        node.type === NodeType.MANUAL_TRIGGER || node.type === NodeType.INITIAL,
    );
  }, [nodes]);

  const isInitialOnlyWorkflow = useMemo(() => {
    return (
      edges.length === 0 &&
      nodes.length === 1 &&
      nodes[0]?.type === NodeType.INITIAL
    );
  }, [edges.length, nodes]);

  useEffect(() => {
    if (!isInitialOnlyWorkflow) {
      return;
    }

    const centerInitialNode = () => {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      const { clientWidth, clientHeight } = container;

      if (clientWidth === 0 || clientHeight === 0) {
        return;
      }

      setNodes((currentNodes) => {
        if (
          currentNodes.length !== 1 ||
          currentNodes[0]?.type !== NodeType.INITIAL
        ) {
          return currentNodes;
        }

        const centeredPosition = {
          x: Math.round(clientWidth / 2 - 20),
          y: Math.round(clientHeight / 2 - 20),
        };

        const currentPosition = currentNodes[0].position;

        if (
          currentPosition.x === centeredPosition.x &&
          currentPosition.y === centeredPosition.y
        ) {
          return currentNodes;
        }

        return [
          {
            ...currentNodes[0],
            position: centeredPosition,
          },
        ];
      });
    };

    const frame = window.requestAnimationFrame(centerInitialNode);
    window.addEventListener("resize", centerInitialNode);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", centerInitialNode);
    };
  }, [isInitialOnlyWorkflow]);

  return (
    <div ref={containerRef} className="size-full flex overflow-hidden">
      <div className="flex-1 relative h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeComponents}
          onInit={setEditor}
          fitView={!isInitialOnlyWorkflow}
          snapGrid={[10, 10]}
          snapToGrid
          panOnScroll
          panOnDrag={false}
          selectionOnDrag
        >
          <Background />
          <Controls />
          <MiniMap />
          <Panel position="top-right">
            <AddNodeButton />
          </Panel>
          {hasManualTrigger && (
            <Panel position="bottom-center">
              <ExecuteWorkflowButton workflowId={workflowId} />
            </Panel>
          )}
        </ReactFlow>
      </div>
      <WorkflowSidebar />
    </div>
  );
};
