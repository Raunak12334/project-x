"use client";

import { useAtom, useAtomValue } from "jotai";
import { InfoIcon, Settings2Icon } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { nodeCatalog } from "@/config/node-catalog";
import { editorAtom, selectedNodeIdAtom } from "../store/atoms";

export const WorkflowSidebar = () => {
  const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeIdAtom);
  const editor = useAtomValue(editorAtom);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId || !editor) return null;
    return editor.getNodes().find((n) => n.id === selectedNodeId);
  }, [selectedNodeId, editor]);

  const catalogItem = useMemo(() => {
    if (!selectedNode) return null;
    return nodeCatalog.find((item) => item.type === selectedNode.type);
  }, [selectedNode]);

  if (!selectedNode) return null;

  return (
    <Sheet
      open={!!selectedNodeId}
      onOpenChange={(open) => !open && setSelectedNodeId(null)}
    >
      <SheetContent className="w-[400px] sm:w-[540px] border-l border-slate-200 dark:border-slate-800 p-0 overflow-hidden flex flex-col bg-background shadow-2xl">
        <SheetHeader className="p-6 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings2Icon className="size-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold tracking-tight">
                {catalogItem?.label || "Node Properties"}
              </SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure your {catalogItem?.label.toLowerCase()} settings
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Node Metadata Section */}
          <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <InfoIcon className="size-3" />
              Node Details
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase">
                  Node ID
                </span>
                <p className="text-sm font-mono truncate">{selectedNode.id}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase">
                  Type
                </span>
                <p className="text-sm font-mono">{selectedNode.type}</p>
              </div>
            </div>
          </div>

          {/* Form Placeholder - This is where node-specific forms go */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Configuration</h4>
            <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full">
                <Settings2Icon className="size-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {catalogItem?.label} specific settings
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Coming soon: Specialized forms for this node type.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/30">
          <Button
            className="w-full h-11"
            onClick={() => setSelectedNodeId(null)}
          >
            Save Configuration
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
