"use client";

import { ExecutionStatus, NodeStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  FileJsonIcon,
  GitBranchIcon,
  Loader2Icon,
  TimerIcon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

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
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (char) => char.toUpperCase());
};

const formatNodeStatus = (status: NodeStatus) => {
  return status.toLowerCase().replace(/^\w/, (char) => char.toUpperCase());
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

const getExecutionStatusClass = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return "border-green-200 bg-green-50 text-green-700";
    case ExecutionStatus.FAILED:
      return "border-red-200 bg-red-50 text-red-700";
    case ExecutionStatus.RUNNING:
      return "border-blue-200 bg-blue-50 text-blue-700";
    case ExecutionStatus.WAITING_APPROVAL:
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
};

const getNodeStatusClass = (status: NodeStatus) => {
  switch (status) {
    case NodeStatus.SUCCESS:
      return "border-green-200 bg-green-50 text-green-700";
    case NodeStatus.FAILED:
      return "border-red-200 bg-red-50 text-red-700";
    case NodeStatus.RUNNING:
      return "border-blue-200 bg-blue-50 text-blue-700";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
};

const hasJsonValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return true;
};

const JsonPanel = ({
  title,
  value,
  empty = "No data captured",
}: {
  title: string;
  value: unknown;
  empty?: string;
}) => (
  <div className="rounded-lg border bg-white p-3">
    <div className="mb-2 flex items-center gap-2">
      <FileJsonIcon className="size-3.5 text-muted-foreground" />
      <p className="font-medium text-xs">{title}</p>
    </div>
    {hasJsonValue(value) ? (
      <pre className="max-h-72 overflow-auto rounded-md bg-muted/40 p-3 text-xs leading-5">
        {JSON.stringify(value, null, 2)}
      </pre>
    ) : (
      <p className="rounded-md bg-muted/40 p-3 text-muted-foreground text-xs">
        {empty}
      </p>
    )}
  </div>
);

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
    <Card className="border bg-white shadow-sm">
      <CardHeader className="border-b bg-muted/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border bg-white shadow-sm">
              {getStatusIcon(execution.status)}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {formatStatus(execution.status)}
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    getExecutionStatusClass(execution.status),
                  )}
                >
                  {formatStatus(execution.status)}
                </Badge>
              </CardTitle>
              <CardDescription>
                Execution for {execution.workflow.name}
              </CardDescription>
            </div>
          </div>

          {duration !== null ? (
            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm">
              <TimerIcon className="size-4 text-muted-foreground" />
              <span className="font-medium">{duration}s</span>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-3">
            <p className="text-muted-foreground text-xs font-medium">
              Workflow
            </p>
            <Link
              prefetch
              className="mt-1 block truncate text-primary text-sm hover:underline"
              href={`/workflows/${execution.workflowId}`}
            >
              {execution.workflow.name}
            </Link>
          </div>

          <div className="rounded-lg border bg-white p-3">
            <p className="text-muted-foreground text-xs font-medium">Started</p>
            <p className="mt-1 text-sm">
              {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
            </p>
          </div>

          <div className="rounded-lg border bg-white p-3">
            <p className="text-muted-foreground text-xs font-medium">
              {execution.completedAt ? "Completed" : "State"}
            </p>
            <p className="mt-1 text-sm">
              {execution.completedAt
                ? formatDistanceToNow(execution.completedAt, {
                    addSuffix: true,
                  })
                : "Still running"}
            </p>
          </div>

          <div className="rounded-lg border bg-white p-3">
            <p className="text-muted-foreground text-xs font-medium">
              Event ID
            </p>
            <p className="mt-1 truncate text-sm">{execution.inngestEventId}</p>
          </div>

          <div className="rounded-lg border bg-white p-3">
            <p className="text-muted-foreground text-xs font-medium">
              Workflow version
            </p>
            <p className="mt-1 text-sm">
              {execution.versionUsed
                ? `v${execution.versionUsed}`
                : execution.workflowVersionId
                  ? "Snapshot saved"
                  : "Current workflow"}
            </p>
          </div>

          <div className="rounded-lg border bg-white p-3">
            <p className="text-muted-foreground text-xs font-medium">
              Node records
            </p>
            <p className="mt-1 text-sm">
              {execution.nodeExecutions.length} captured
            </p>
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
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
            <div>
              <div className="mb-2 flex items-center gap-2 text-red-900">
                <AlertTriangleIcon className="size-4" />
                <p className="text-sm font-medium">Execution error</p>
              </div>
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
          <JsonPanel title="Final output" value={execution.output} />
        )}

        <div className="rounded-xl border bg-white">
          <div className="flex items-center justify-between gap-3 border-b p-4">
            <div>
              <p className="font-medium text-sm">Node timeline</p>
              <p className="text-muted-foreground text-xs">
                {execution.nodeExecutions.length} node
                {execution.nodeExecutions.length === 1 ? "" : "s"} recorded for
                this run
              </p>
            </div>
            <Badge variant="outline" className="bg-white">
              {execution.nodeExecutions.length} steps
            </Badge>
          </div>

          {execution.nodeExecutions.length === 0 ? (
            <div className="p-4 text-muted-foreground text-sm">
              No node-level records have been captured for this execution yet.
            </div>
          ) : (
            <div className="divide-y">
              {execution.nodeExecutions.map((nodeExecution, index) => {
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
                        className="group flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-muted/40"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-white text-xs font-semibold">
                            {index + 1}
                          </span>
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-white">
                            {getNodeStatusIcon(nodeExecution.status)}
                          </span>
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
                            <Badge
                              variant="outline"
                              className="border-blue-200 bg-blue-50 text-blue-700"
                            >
                              <GitBranchIcon className="size-3" />
                              {nodeExecution.routeId}
                            </Badge>
                          ) : null}
                          {duration ? (
                            <span className="hidden sm:inline">{duration}</span>
                          ) : null}
                          <Badge
                            variant="outline"
                            className={getNodeStatusClass(nodeExecution.status)}
                          >
                            {formatNodeStatus(nodeExecution.status)}
                          </Badge>
                          <ChevronDownIcon className="size-4 transition group-data-[state=open]:rotate-180" />
                        </span>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-3 border-t bg-muted/20 p-4">
                        <div className="grid gap-3 text-sm md:grid-cols-4">
                          <div className="rounded-lg border bg-white p-3">
                            <p className="font-medium text-muted-foreground text-xs">
                              Started
                            </p>
                            <p>
                              {new Date(
                                nodeExecution.startedAt,
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="rounded-lg border bg-white p-3">
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
                          <div className="rounded-lg border bg-white p-3">
                            <p className="font-medium text-muted-foreground text-xs">
                              Duration
                            </p>
                            <p>{duration || "Pending"}</p>
                          </div>
                          <div className="rounded-lg border bg-white p-3">
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
                          <JsonPanel
                            title="Input"
                            value={nodeExecution.input}
                          />
                          <JsonPanel
                            title="Output"
                            value={nodeExecution.output}
                          />
                        </div>

                        {nodeExecution.logs ? (
                          <JsonPanel title="Logs" value={nodeExecution.logs} />
                        ) : null}

                        {nodeExecution.errorJson ? (
                          <JsonPanel
                            title="Error details"
                            value={nodeExecution.errorJson}
                          />
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
