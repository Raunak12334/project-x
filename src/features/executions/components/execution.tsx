"use client";

import { ExecutionStatus, NodeStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useApproveExecution,
  useReplayExecutionCheckpoint,
  useResumeExecution,
  useSuspenseExecution,
} from "@/features/executions/hooks/use-executions";

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-600" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-blue-600 animate-spin" />;
    case ExecutionStatus.WAITING_APPROVAL:
      return <ClockIcon className="size-5 text-amber-600" />;
    default:
      return <ClockIcon className="size-5 text-muted-foreground" />;
  }
};

const formatStatus = (status: ExecutionStatus) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

const formatNodeStatus = (status: NodeStatus) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

const getNodeStatusIcon = (status: NodeStatus) => {
  switch (status) {
    case NodeStatus.SUCCESS:
      return <CheckCircle2Icon className="size-4 text-green-600" />;
    case NodeStatus.FAILED:
      return <XCircleIcon className="size-4 text-red-600" />;
    case NodeStatus.RUNNING:
      return <Loader2Icon className="size-4 animate-spin text-blue-600" />;
    default:
      return <ClockIcon className="size-4 text-muted-foreground" />;
  }
};

const formatDurationMs = (
  startedAt: Date | string,
  completedAt?: Date | string | null,
) => {
  if (!completedAt) {
    return null;
  }

  return `${new Date(completedAt).getTime() - new Date(startedAt).getTime()}ms`;
};

export const ExecutionView = ({ executionId }: { executionId: string }) => {
  const { data: execution } = useSuspenseExecution(executionId);
  const approveExecution = useApproveExecution();
  const replayCheckpoint = useReplayExecutionCheckpoint();
  const resumeExecution = useResumeExecution();
  const [showStackTrace, setShowStackTrace] = useState(false);

  const duration = execution.completedAt
    ? Math.round(
        (new Date(execution.completedAt).getTime() -
          new Date(execution.startedAt).getTime()) /
          1000,
      )
    : null;

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon(execution.status)}
          <div>
            <CardTitle>{formatStatus(execution.status)}</CardTitle>
            <CardDescription>
              Execution for {execution.workflow.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Workflow
            </p>
            <Link
              prefetch
              className="text-sm hover:underline text-primary"
              href={`/workflows/${execution.workflowId}`}
            >
              {execution.workflow.name}
            </Link>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-sm">{formatStatus(execution.status)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Started</p>
            <p className="text-sm">
              {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
            </p>
          </div>

          {execution.completedAt ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <p className="text-sm">
                {formatDistanceToNow(execution.completedAt, {
                  addSuffix: true,
                })}
              </p>
            </div>
          ) : null}

          {duration !== null ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Duration
              </p>
              <p className="text-sm">{duration}s</p>
            </div>
          ) : null}

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Event ID
            </p>
            <p className="text-sm">{execution.inngestEventId}</p>
          </div>
        </div>

        {execution.status === ExecutionStatus.FAILED &&
        execution.checkpoints.length > 0 ? (
          <div className="flex justify-end">
            <Button
              onClick={() => resumeExecution.mutate({ id: execution.id })}
              disabled={resumeExecution.isPending}
            >
              Resume from checkpoint
            </Button>
          </div>
        ) : null}

        {execution.status === ExecutionStatus.WAITING_APPROVAL ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-amber-900">
                Waiting for approval
              </p>
              <p className="text-sm text-amber-800">
                This execution paused at a human approval node and will continue
                after approval.
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => approveExecution.mutate({ id: execution.id })}
                disabled={approveExecution.isPending}
              >
                Approve and continue
              </Button>
            </div>
          </div>
        ) : null}
        {execution.error && (
          <div className="mt-6 p-4 bg-red-50 rounded-md space-y-3">
            <div>
              <p className="text-sm font-medium text-red-900 mb-2">Error</p>
              <p className="text-sm text-red-800 font-mono">
                {execution.error}
              </p>
            </div>

            {execution.errorStack && (
              <Collapsible
                open={showStackTrace}
                onOpenChange={setShowStackTrace}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-900 hover:bg-red-100"
                  >
                    {showStackTrace ? "Hide stack trace" : "Show stack trace"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="text-xs font-mono text-red-800 overflow-auto mt-2 p-2 bg-red-100">
                    {execution.errorStack}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        {execution.output && (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2">Output</p>
            <pre className="text-xs font-mono overflow-auto">
              {JSON.stringify(execution.output, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 rounded-md border bg-background">
          <div className="border-b p-4">
            <p className="font-medium text-sm">Node timeline</p>
            <p className="text-muted-foreground text-xs">
              {execution.nodeExecutions.length} node
              {execution.nodeExecutions.length === 1 ? "" : "s"} recorded for
              this run
            </p>
          </div>

          {execution.nodeExecutions.length === 0 ? (
            <div className="p-4 text-muted-foreground text-sm">
              No node-level records have been captured for this execution yet.
            </div>
          ) : (
            <div className="divide-y">
              {execution.nodeExecutions.map((nodeExecution) => {
                const duration =
                  typeof nodeExecution.durationMs === "number"
                    ? `${nodeExecution.durationMs}ms`
                    : formatDurationMs(
                        nodeExecution.startedAt,
                        nodeExecution.completedAt,
                      );

                return (
                  <Collapsible key={nodeExecution.id}>
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-muted/60"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          {getNodeStatusIcon(nodeExecution.status)}
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-sm">
                              {nodeExecution.node.name ||
                                nodeExecution.node.type}
                            </span>
                            <span className="block truncate text-muted-foreground text-xs">
                              {nodeExecution.node.type} / {nodeExecution.nodeId}
                            </span>
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-3 text-muted-foreground text-xs">
                          {nodeExecution.routeId ? (
                            <span>Route: {nodeExecution.routeId}</span>
                          ) : null}
                          {duration ? <span>{duration}</span> : null}
                          <span>{formatNodeStatus(nodeExecution.status)}</span>
                        </span>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-3 border-t bg-muted/30 p-4">
                        <div className="grid gap-3 text-sm md:grid-cols-3">
                          <div>
                            <p className="font-medium text-muted-foreground text-xs">
                              Started
                            </p>
                            <p>
                              {new Date(
                                nodeExecution.startedAt,
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground text-xs">
                              Completed
                            </p>
                            <p>
                              {nodeExecution.completedAt
                                ? new Date(
                                    nodeExecution.completedAt,
                                  ).toLocaleString()
                                : "Still running"}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground text-xs">
                              Attempt
                            </p>
                            <p>{nodeExecution.attempt}</p>
                          </div>
                        </div>

                        {nodeExecution.error ? (
                          <div className="rounded-md border border-red-200 bg-red-50 p-3">
                            <p className="font-medium text-red-900 text-xs">
                              Error
                            </p>
                            <p className="mt-1 font-mono text-red-800 text-xs">
                              {nodeExecution.error}
                            </p>
                          </div>
                        ) : null}

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-md border bg-background p-3">
                            <p className="mb-2 font-medium text-xs">Input</p>
                            <pre className="max-h-72 overflow-auto text-xs">
                              {JSON.stringify(nodeExecution.input, null, 2)}
                            </pre>
                          </div>

                          <div className="rounded-md border bg-background p-3">
                            <p className="mb-2 font-medium text-xs">Output</p>
                            <pre className="max-h-72 overflow-auto text-xs">
                              {JSON.stringify(nodeExecution.output, null, 2)}
                            </pre>
                          </div>
                        </div>

                        {nodeExecution.logs ? (
                          <div className="rounded-md border bg-background p-3">
                            <p className="mb-2 font-medium text-xs">Logs</p>
                            <pre className="max-h-96 overflow-auto text-xs">
                              {JSON.stringify(nodeExecution.logs, null, 2)}
                            </pre>
                          </div>
                        ) : null}

                        {nodeExecution.errorJson ? (
                          <div className="rounded-md border bg-background p-3">
                            <p className="mb-2 font-medium text-xs">
                              Error details
                            </p>
                            <pre className="max-h-96 overflow-auto text-xs">
                              {JSON.stringify(nodeExecution.errorJson, null, 2)}
                            </pre>
                          </div>
                        ) : null}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </div>

        {execution.checkpoints.length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-md space-y-3">
            <div>
              <p className="text-sm font-medium">LangGraph Checkpoints</p>
              <p className="text-xs text-muted-foreground">
                {execution.checkpoints.length} snapshot
                {execution.checkpoints.length === 1 ? "" : "s"} captured during
                execution
              </p>
            </div>

            <div className="space-y-3">
              {execution.checkpoints.map((checkpoint) => (
                <div
                  key={checkpoint.id}
                  className="rounded-md border bg-background p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-medium">
                      Step {checkpoint.sequence}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {checkpoint.nodeId ?? "graph"}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          replayCheckpoint.mutate({
                            id: execution.id,
                            checkpointId: checkpoint.id,
                          })
                        }
                        disabled={replayCheckpoint.isPending}
                      >
                        Replay from here
                      </Button>
                    </div>
                  </div>
                  <pre className="text-xs font-mono overflow-auto">
                    {JSON.stringify(checkpoint.state, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
