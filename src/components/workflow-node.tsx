"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { SettingsIcon, TrashIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./ui/button";

interface WorkflowNodeProps {
  children: ReactNode;
  showToolbar?: boolean;
  onDelete?: () => void;
  onSettings?: () => void;
  name?: string;
  description?: string;
}

export function WorkflowNode({
  children,
  showToolbar = true,
  onDelete,
  onSettings,
  name,
  description,
}: WorkflowNodeProps) {
  return (
    <>
      {showToolbar && (
        <NodeToolbar className="w-[40px] justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={onSettings}>
            <SettingsIcon className="size-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <TrashIcon className="size-3" />
          </Button>
        </NodeToolbar>
      )}
      {children}
      {name && (
        <NodeToolbar
          position={Position.Bottom}
          isVisible
          className="w-[40px] text-center"
        >
          <p className="text-xs font-medium leading-4">{name}</p>
          {description && (
            <p className="text-muted-foreground truncate text-[10px] leading-4">
              {description}
            </p>
          )}
        </NodeToolbar>
      )}
    </>
  );
}
