"use client";

import type { NodeType } from "@prisma/client";
import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useMemo, useState } from "react";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import {
  type NodeStatus,
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkflowNode } from "@/components/workflow-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { getNodeDefinition } from "../core/registry";
import { NodeConfigRenderer } from "./node-config-renderer";

export const HardenNode = memo((props: NodeProps) => {
  const { id, type, data } = props;
  const nodeData = data as Record<string, unknown>;
  const version = typeof nodeData.version === "number" ? nodeData.version : 1;
  const definition = getNodeDefinition(type as NodeType, version);
  const { setNodes, setEdges } = useReactFlow();
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus(
    definition?.realtimeStatus
      ? {
          nodeId: id,
          channel: definition.realtimeStatus.channel,
          topic: definition.realtimeStatus.topic,
          refreshToken: definition.realtimeStatus.refreshToken,
        }
      : null,
  );

  const handleDelete = useCallback(() => {
    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== id));
    setEdges((currentEdges) =>
      currentEdges.filter((edge) => edge.source !== id && edge.target !== id),
    );
  }, [id, setNodes, setEdges]);

  const handleOpenSettings = useCallback(() => setDialogOpen(true), []);

  const handleSave = useCallback(
    (values: Record<string, unknown>) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...values,
              },
            };
          }
          return node;
        }),
      );
      setDialogOpen(false);
    },
    [id, setNodes],
  );

  const name = definition?.label || "Unknown Node";
  const summary = useMemo(() => {
    return definition?.getSummary?.(nodeData) || definition?.description;
  }, [nodeData, definition]);

  if (!definition) {
    return (
      <div className="p-4 border-2 border-dashed border-destructive text-destructive rounded-md bg-destructive/10 text-xs text-center">
        Definition for {type} not found
      </div>
    );
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{definition.label} Configuration</DialogTitle>
            <DialogDescription>{definition.description}</DialogDescription>
          </DialogHeader>
          <NodeConfigRenderer
            type={type as NodeType}
            version={version}
            defaultValues={nodeData}
            onSubmit={handleSave}
          />
        </DialogContent>
      </Dialog>

      <WorkflowNode
        name={name}
        description={summary}
        onDelete={handleDelete}
        onSettings={handleOpenSettings}
      >
        <NodeStatusIndicator status={nodeStatus as NodeStatus} variant="border">
          <BaseNode
            status={nodeStatus as NodeStatus}
            onDoubleClick={handleOpenSettings}
          >
            <BaseNodeContent className="w-full h-full flex items-center justify-center p-0">
              {/* Icon rendering is handled by lucide-react only */}

              {/* Render Ports Dynamically */}
              {definition.ports.map((port) => (
                <BaseHandle
                  key={port.id}
                  id={port.id}
                  type={port.direction === "in" ? "target" : "source"}
                  position={
                    port.direction === "in" ? Position.Left : Position.Right
                  }
                />
              ))}
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    </>
  );
});

HardenNode.displayName = "HardenNode";
