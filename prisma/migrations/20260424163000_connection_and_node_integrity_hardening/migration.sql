DROP INDEX IF EXISTS "connection_fromNodeId_toNodeId_fromOutput_toInput_key";

CREATE UNIQUE INDEX IF NOT EXISTS "connection_workflowId_fromNodeId_toNodeId_fromOutput_toInput_key"
ON "connection"("workflowId", "fromNodeId", "toNodeId", "fromOutput", "toInput");

CREATE INDEX IF NOT EXISTS "connection_workflowId_idx"
ON "connection"("workflowId");

ALTER TABLE "node" DROP CONSTRAINT IF EXISTS "node_credentialId_fkey";

ALTER TABLE "node"
ADD CONSTRAINT "node_credentialId_fkey"
FOREIGN KEY ("credentialId") REFERENCES "credential"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
