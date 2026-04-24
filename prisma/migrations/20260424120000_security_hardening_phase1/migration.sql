CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE "workflow"
ADD COLUMN IF NOT EXISTS "webhookSecretHash" TEXT,
ADD COLUMN IF NOT EXISTS "webhookSecretLastRotatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "webhookSecretVersion" INTEGER NOT NULL DEFAULT 1;

UPDATE "workflow"
SET
  "webhookSecretHash" = encode(digest("webhookSecret", 'sha256'), 'hex'),
  "webhookSecretLastRotatedAt" = COALESCE("updatedAt", NOW())
WHERE "webhookSecret" IS NOT NULL
  AND "webhookSecretHash" IS NULL;

DROP INDEX IF EXISTS "workflow_webhookSecret_key";
ALTER TABLE "workflow" DROP COLUMN IF EXISTS "webhookSecret";

ALTER TABLE "credential"
DROP COLUMN IF EXISTS "value";

ALTER TABLE "composio_integration"
ADD COLUMN IF NOT EXISTS "authTokenEncrypted" TEXT;

UPDATE "composio_integration"
SET "authTokenEncrypted" = "authToken"
WHERE "authTokenEncrypted" IS NULL
  AND "authToken" IS NOT NULL;

ALTER TABLE "composio_integration"
ALTER COLUMN "authTokenEncrypted" SET NOT NULL;

ALTER TABLE "composio_integration"
DROP COLUMN IF EXISTS "authToken";

ALTER TABLE "AuditLog"
ADD COLUMN IF NOT EXISTS "ipAddress" TEXT,
ADD COLUMN IF NOT EXISTS "userAgent" TEXT,
ADD COLUMN IF NOT EXISTS "requestId" TEXT,
ADD COLUMN IF NOT EXISTS "severity" TEXT NOT NULL DEFAULT 'INFO',
ADD COLUMN IF NOT EXISTS "resourceType" TEXT,
ADD COLUMN IF NOT EXISTS "resourceId" TEXT;

ALTER TABLE "AuditLog"
DROP COLUMN IF EXISTS "deletedAt";

ALTER TABLE "execution_audit_log"
ADD COLUMN IF NOT EXISTS "ipAddress" TEXT,
ADD COLUMN IF NOT EXISTS "userAgent" TEXT,
ADD COLUMN IF NOT EXISTS "requestId" TEXT,
ADD COLUMN IF NOT EXISTS "severity" TEXT NOT NULL DEFAULT 'INFO',
ADD COLUMN IF NOT EXISTS "resourceType" TEXT,
ADD COLUMN IF NOT EXISTS "resourceId" TEXT;

ALTER TABLE "execution_audit_log"
DROP COLUMN IF EXISTS "deletedAt";

ALTER TABLE "rate_limit_bucket"
ADD COLUMN IF NOT EXISTS "subjectType" TEXT NOT NULL DEFAULT 'ORG',
ADD COLUMN IF NOT EXISTS "subjectId" TEXT,
ADD COLUMN IF NOT EXISTS "route" TEXT NOT NULL DEFAULT '';

UPDATE "rate_limit_bucket"
SET "subjectId" = COALESCE("subjectId", "organizationId")
WHERE "subjectId" IS NULL;

ALTER TABLE "rate_limit_bucket"
ALTER COLUMN "subjectId" SET NOT NULL;

DROP INDEX IF EXISTS "rate_limit_bucket_organizationId_limitType_resetAt_key";
CREATE UNIQUE INDEX IF NOT EXISTS "rate_limit_bucket_organizationId_subjectType_subjectId_limitType_route_resetAt_key"
ON "rate_limit_bucket"("organizationId", "subjectType", "subjectId", "limitType", "route", "resetAt");

CREATE UNIQUE INDEX IF NOT EXISTS "execution_workflowId_idempotencyKey_key"
ON "execution"("workflowId", "idempotencyKey")
WHERE "idempotencyKey" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "execution_workflowId_inngestEventId_key"
ON "execution"("workflowId", "inngestEventId");

DROP INDEX IF EXISTS "user_email_key";
CREATE UNIQUE INDEX "user_email_key"
ON "user"("email")
WHERE "deletedAt" IS NULL;

DROP INDEX IF EXISTS "team_invite_email_organizationId_key";
CREATE UNIQUE INDEX "team_invite_email_organizationId_key"
ON "team_invite"("email", "organizationId")
WHERE "deletedAt" IS NULL;

DROP INDEX IF EXISTS "composio_integration_organizationId_toolkitSlug_key";
CREATE UNIQUE INDEX "composio_integration_organizationId_toolkitSlug_key"
ON "composio_integration"("organizationId", "toolkitSlug")
WHERE "deletedAt" IS NULL;

DROP INDEX IF EXISTS "blog_post_slug_key";
CREATE UNIQUE INDEX "blog_post_slug_key"
ON "blog_post"("slug")
WHERE "deletedAt" IS NULL;
