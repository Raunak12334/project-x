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
        <NodeToolbar className="min-w-16 justify-center gap-1">
          <Button size="icon" variant="ghost" className="size-7" onClick={onSettings}>
            <SettingsIcon className="size-3" />
          </Button>
          <Button size="icon" variant="ghost" className="size-7" onClick={onDelete}>
            <TrashIcon className="size-3" />
          </Button>
        </NodeToolbar>
      )}
      {children}
      {name && (
        <NodeToolbar
          position={Position.Bottom}
          isVisible
          className="w-28 text-center"
        >
          <p className="text-xs font-semibold leading-4 text-foreground">{name}</p>
          {description && (
            <p className="truncate text-[10px] leading-4 text-muted-foreground">
              {description}
            </p>
          )}
        </NodeToolbar>
      )}
    </>
  );
}
