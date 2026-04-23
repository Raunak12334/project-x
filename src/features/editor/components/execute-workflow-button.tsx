import { useAtomValue, useSetAtom } from "jotai";
import { FlaskConicalIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { normalizeAndDedupeWorkflowConnections } from "@/features/workflows/lib/connections";
import { createWorkflowGraphHash } from "../lib/graph-hash";
import { getWorkflowValidationIssuesFromError } from "../lib/workflow-validation-error";
import {
  editorAtom,
  editorLastSavedHashAtom,
  workflowValidationIssuesAtom,
} from "../store/atoms";

export const ExecuteWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const editor = useAtomValue(editorAtom);
  const setLastSavedHash = useSetAtom(editorLastSavedHashAtom);
  const setValidationIssues = useSetAtom(workflowValidationIssuesAtom);
  const executeWorkflow = useExecuteWorkflow();
  const [statusLabel, setStatusLabel] = useState("Execute workflow");

  const handleExecute = async () => {
    if (!editor) {
      return;
    }

    const nodes = editor.getNodes();
    const edges = normalizeAndDedupeWorkflowConnections(editor.getEdges());

    setStatusLabel("Saving and running...");

    try {
      await executeWorkflow.mutateAsync({
        id: workflowId,
        nodes,
        edges,
      });
      setLastSavedHash(createWorkflowGraphHash(nodes, edges));
      setValidationIssues([]);
    } catch (error) {
      const issues = getWorkflowValidationIssuesFromError(error);
      if (issues.length > 0) {
        setValidationIssues(issues);
      }
    } finally {
      setStatusLabel("Execute workflow");
    }
  };

  return (
    <Button
      size="lg"
      onClick={handleExecute}
      disabled={executeWorkflow.isPending || !editor}
    >
      <FlaskConicalIcon className="size-4" />
      {executeWorkflow.isPending ? statusLabel : "Execute workflow"}
    </Button>
  );
};
