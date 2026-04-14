"use client";

import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode } from "react";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import {
  type NodeStatus,
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";
import { WorkflowNode } from "@/components/workflow-node";

import { nodeCatalog } from "@/config/node-catalog";

interface BaseTriggerNodeProps extends NodeProps {
  icon?: LucideIcon | string;
  name?: string;
  description?: string;
  children?: ReactNode;
  status?: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export const BaseTriggerNode = memo(
  ({
    id,
    type,
    icon: propsIcon,
    name: propsName,
    description,
    children,
    status = "initial",
    onSettings,
    onDoubleClick,
  }: BaseTriggerNodeProps) => {
    const catalogItem = nodeCatalog.find((item) => item.type === type);
    const Icon = propsIcon || catalogItem?.icon || "/logo.svg";
    const name = propsName || catalogItem?.label || "Trigger Node";
    const { setNodes, setEdges } = useReactFlow();
    const handleDelete = () => {
      setNodes((currentNodes) => {
        const updatedNodes = currentNodes.filter((node) => node.id !== id);
        return updatedNodes;
      });

      setEdges((currentEdges) => {
        const updatedEdges = currentEdges.filter(
          (edge) => edge.source !== id && edge.target !== id,
        );
        return updatedEdges;
      });
    };

    return (
      <WorkflowNode
        name={name}
        description={description}
        onDelete={handleDelete}
        onSettings={onSettings}
      >
        <NodeStatusIndicator
          status={status}
          variant="border"
          className="rounded-l-2xl"
        >
          <BaseNode
            status={status}
            onDoubleClick={onDoubleClick}
            className="rounded-l-2xl relative group"
          >
            <BaseNodeContent className="flex flex-col items-center justify-center p-3">
              {typeof Icon === "string" ? (
                <Image src={Icon} alt={name} width={24} height={24} />
              ) : (
                <Icon className="size-6 text-muted-foreground" />
              )}
              {children}
              <BaseHandle id="main" type="source" position={Position.Right} />
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    );
  },
);

BaseTriggerNode.displayName = "BaseTriggerNode";
