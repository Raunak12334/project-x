-- Link executions to the exact workflow version used for a run.
ALTER TABLE "execution" ADD COLUMN "workflowVersionId" TEXT;

-- Store first-class per-node execution details instead of packing everything into output JSON.
ALTER TABLE "node_execution" ADD COLUMN "nodeType" "NodeType";
ALTER TABLE "node_execution" ADD COLUMN "durationMs" INTEGER;
ALTER TABLE "node_execution" ADD COLUMN "errorJson" JSONB;
ALTER TABLE "node_execution" ADD COLUMN "input" JSONB;
ALTER TABLE "node_execution" ADD COLUMN "routeId" TEXT;
ALTER TABLE "node_execution" ADD COLUMN "logs" JSONB;

CREATE INDEX "execution_workflowVersionId_idx" ON "execution"("workflowVersionId");

ALTER TABLE "execution"
  ADD CONSTRAINT "execution_workflowVersionId_fkey"
  FOREIGN KEY ("workflowVersionId") REFERENCES "workflow_version"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
