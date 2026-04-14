"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { WorkflowNode } from "@/components/workflow-node";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import {
  NodeStatusIndicator,
  type NodeStatus,
} from "@/components/react-flow/node-status-indicator";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getNodeDefinition } from "../core/registry";
import { NodeConfigRenderer } from "./node-config-renderer";
import type { NodeType } from "@prisma/client";
import Image from "next/image";

export const HardenNode = memo((props: NodeProps) => {
  const { id, type, data } = props;
  const definition = getNodeDefinition(
    type as NodeType,
    (data as any).version || 1,
  );
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
      : (null as any),
  );

  const handleDelete = useCallback(() => {
    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== id));
    setEdges((currentEdges) =>
      currentEdges.filter((edge) => edge.source !== id && edge.target !== id),
    );
  }, [id, setNodes, setEdges]);

  const handleOpenSettings = useCallback(() => setDialogOpen(true), []);

  const handleSave = useCallback(
    (values: any) => {
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

  const icon = definition?.icon || "logo";
  const name = definition?.label || "Unknown Node";
  const summary = useMemo(() => {
    return definition?.getSummary?.(data) || definition?.description;
  }, [data, definition]);

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
            version={(data as any).version || 1}
            defaultValues={data}
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
          <BaseNode status={nodeStatus as NodeStatus} onDoubleClick={handleOpenSettings}>
            <BaseNodeContent className="flex flex-col items-center justify-center p-2 min-w-[64px]">
              <Image
                src={icon.startsWith("/") ? icon : `/logos/${icon}.svg`}
                alt={name}
                width={24}
                height={24}
                className="object-contain mb-1"
              />

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
