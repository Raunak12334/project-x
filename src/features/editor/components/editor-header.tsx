"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { SaveIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  useSuspenseWorkflow,
  useUpdateWorkflow,
  useUpdateWorkflowName,
} from "@/features/workflows/hooks/use-workflows";
import { normalizeAndDedupeWorkflowConnections } from "@/features/workflows/lib/connections";
import { createWorkflowGraphHash } from "../lib/graph-hash";
import { getWorkflowValidationIssuesFromError } from "../lib/workflow-validation-error";
import {
  editorAtom,
  editorDirtyAtom,
  editorLastSavedAtAtom,
  editorLastSavedHashAtom,
  editorSavingAtom,
  workflowValidationIssuesAtom,
} from "../store/atoms";

export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
  const editor = useAtomValue(editorAtom);
  const setLastSavedHash = useSetAtom(editorLastSavedHashAtom);
  const setLastSavedAt = useSetAtom(editorLastSavedAtAtom);
  const setIsSaving = useSetAtom(editorSavingAtom);
  const setValidationIssues = useSetAtom(workflowValidationIssuesAtom);
  const saveWorkflow = useUpdateWorkflow();

  const handleSave = async () => {
    if (!editor) {
      return;
    }

    const nodes = editor.getNodes();
    const edges = normalizeAndDedupeWorkflowConnections(editor.getEdges());

    try {
      setIsSaving(true);
      await saveWorkflow.mutateAsync({
        id: workflowId,
        nodes,
        edges,
      });
      setLastSavedHash(createWorkflowGraphHash(nodes, edges));
      setLastSavedAt(new Date());
      setValidationIssues([]);
    } catch (error) {
      const issues = getWorkflowValidationIssuesFromError(error);
      if (issues.length > 0) {
        setValidationIssues(issues);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ml-auto">
      <Button size="sm" onClick={handleSave} disabled={saveWorkflow.isPending}>
        <SaveIcon className="size-4" />
        Save
      </Button>
    </div>
  );
};

export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflowName();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflow.name);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workflow.name) {
      setName(workflow.name);
    }
  }, [workflow.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (name === workflow.name) {
      setIsEditing(false);
      return;
    }

    try {
      await updateWorkflow.mutateAsync({
        id: workflowId,
        name,
      });
    } catch {
      setName(workflow.name);
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setName(workflow.name);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        disabled={updateWorkflow.isPending}
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-7 w-auto min-w-[100px] px-2"
      />
    );
  }

  return (
    <BreadcrumbItem
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:text-foreground transition-colors"
    >
      {workflow.name}
    </BreadcrumbItem>
  );
};

export const EditorBreadcrumbs = ({ workflowId }: { workflowId: string }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link prefetch href="/workflows">
              Workflows
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <EditorNameInput workflowId={workflowId} />
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
  const isDirty = useAtomValue(editorDirtyAtom);
  const isSaving = useAtomValue(editorSavingAtom);
  const lastSavedAt = useAtomValue(editorLastSavedAtAtom);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />
      <div className="flex flex-row items-center justify-between gap-x-4 w-full">
        <div className="flex min-w-0 items-center gap-2">
          <EditorBreadcrumbs workflowId={workflowId} />
          {isSaving ? (
            <Badge variant="secondary">Saving</Badge>
          ) : isDirty ? (
            <Badge variant="secondary">Unsaved</Badge>
          ) : lastSavedAt ? (
            <Badge variant="outline">Saved</Badge>
          ) : null}
        </div>
        <EditorSaveButton workflowId={workflowId} />
      </div>
    </header>
  );
};
