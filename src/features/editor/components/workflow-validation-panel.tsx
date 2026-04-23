"use client";

import { useAtomValue } from "jotai";
import { AlertTriangleIcon, XCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  editorAtom,
  workflowValidationIssuesAtom,
} from "@/features/editor/store/atoms";

export const WorkflowValidationPanel = () => {
  const editor = useAtomValue(editorAtom);
  const issues = useAtomValue(workflowValidationIssuesAtom);

  if (issues.length === 0) {
    return null;
  }

  const errors = issues.filter((issue) => issue.severity === "error").length;
  const warnings = issues.length - errors;

  const focusNode = (nodeId?: string) => {
    if (!nodeId || !editor) {
      return;
    }

    const node = editor.getNode(nodeId);
    if (!node) {
      return;
    }

    editor.setCenter(node.position.x, node.position.y, {
      zoom: 1.1,
      duration: 300,
    });
  };

  return (
    <div className="w-[360px] max-w-[calc(100vw-32px)] rounded-lg border bg-background/95 p-3 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <XCircleIcon className="size-4 text-destructive" />
          Workflow checks
        </div>
        <div className="flex items-center gap-1.5">
          {errors > 0 && <Badge variant="destructive">{errors} errors</Badge>}
          {warnings > 0 && (
            <Badge variant="secondary">{warnings} warnings</Badge>
          )}
        </div>
      </div>
      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
        {issues.map((issue, index) => (
          <Button
            key={`${issue.code}-${issue.nodeId ?? "graph"}-${issue.field ?? ""}-${index}`}
            type="button"
            variant="ghost"
            className="h-auto w-full justify-start rounded-md border px-3 py-2 text-left"
            onClick={() => focusNode(issue.nodeId)}
          >
            <span className="flex min-w-0 gap-2">
              <AlertTriangleIcon
                className={
                  issue.severity === "error"
                    ? "mt-0.5 size-4 shrink-0 text-destructive"
                    : "mt-0.5 size-4 shrink-0 text-amber-500"
                }
              />
              <span className="min-w-0">
                <span className="block whitespace-normal font-medium text-sm">
                  {issue.message}
                </span>
                {(issue.nodeId || issue.field) && (
                  <span className="mt-1 block text-muted-foreground text-xs">
                    {[issue.nodeId, issue.field].filter(Boolean).join(" / ")}
                  </span>
                )}
              </span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
