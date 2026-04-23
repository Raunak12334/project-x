"use client";

import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import { memo, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import {
  type NodeStatus,
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";
import { WorkflowNode } from "@/components/workflow-node";

import { nodeCatalog } from "@/config/node-catalog";

interface BaseExecutionNodeProps extends NodeProps {
  icon?: LucideIcon | string;
  iconCandidates?: string[];
  name?: string;
  description?: string;
  children?: ReactNode;
  status?: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export const BaseExecutionNode = memo(
  ({
    id,
    type,
    data,
    icon: propsIcon,
    iconCandidates,
    name: propsName,
    description,
    children,
    status = "initial",
    onSettings,
    onDoubleClick,
  }: BaseExecutionNodeProps) => {
    const catalogItem = nodeCatalog.find((item) => item.type === type);
    const Icon = propsIcon || catalogItem?.icon || "/logo.svg";
    const dataLogoCandidates =
      data &&
      typeof data === "object" &&
      Array.isArray((data as { appLogoCandidates?: unknown }).appLogoCandidates)
        ? (data as { appLogoCandidates: string[] }).appLogoCandidates
        : undefined;
    const logoCandidates =
      iconCandidates || dataLogoCandidates || catalogItem?.logoCandidates;
    const name = propsName || catalogItem?.label || "Unknown Node";
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
        <NodeStatusIndicator status={status} variant="border">
          <BaseNode status={status} onDoubleClick={onDoubleClick}>
            <BaseNodeContent className="w-full h-full flex items-center justify-center p-0">
              {typeof Icon === "string" ? null : (
                <Icon className="size-5 text-muted-foreground" />
              )}
              {typeof Icon === "string" && (
                <BrandLogo
                  src={Icon}
                  alt={`${name} logo`}
                  className="size-5"
                  candidates={logoCandidates}
                />
              )}
              {children}
              <BaseHandle id="main" type="target" position={Position.Left} />
              <BaseHandle id="main" type="source" position={Position.Right} />
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    );
  },
);

BaseExecutionNode.displayName = "BaseExecutionNode";
