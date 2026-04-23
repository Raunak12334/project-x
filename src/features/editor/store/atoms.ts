import type { ReactFlowInstance } from "@xyflow/react";
import { atom } from "jotai";
import type { WorkflowValidationIssue } from "@/features/workflows/lib/workflow-validator";

export const editorAtom = atom<ReactFlowInstance | null>(null);
export const selectedNodeIdAtom = atom<string | null>(null);
export const editorCurrentHashAtom = atom<string | null>(null);
export const editorLastSavedHashAtom = atom<string | null>(null);
export const editorDirtyAtom = atom(false);
export const workflowValidationIssuesAtom = atom<WorkflowValidationIssue[]>([]);
