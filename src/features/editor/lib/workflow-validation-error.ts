import type { WorkflowValidationIssue } from "@/features/workflows/lib/workflow-validator";

export const getWorkflowValidationIssuesFromError = (
  error: unknown,
): WorkflowValidationIssue[] => {
  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "";

  if (!message) {
    return [];
  }

  try {
    const payload = JSON.parse(message) as {
      type?: string;
      issues?: WorkflowValidationIssue[];
    };

    if (payload.type === "VALIDATION_ERROR" && Array.isArray(payload.issues)) {
      return payload.issues;
    }
  } catch {
    return [];
  }

  return [];
};
