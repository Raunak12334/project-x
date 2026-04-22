ALTER TYPE "CredentialType" ADD VALUE IF NOT EXISTS 'COMPOSIO';
ALTER TYPE "CredentialType" ADD VALUE IF NOT EXISTS 'GENERIC';
ALTER TYPE "NodeType" ADD VALUE IF NOT EXISTS 'COMPOSIO';

CREATE TABLE IF NOT EXISTS "composio_integration" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "toolkitSlug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "logo" TEXT,
  "accountName" TEXT,
  "authToken" TEXT NOT NULL,
  "connectionId" TEXT,
  "isConnected" BOOLEAN NOT NULL DEFAULT false,
  "lastSyncedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),

  CONSTRAINT "composio_integration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "composio_integration_organizationId_toolkitSlug_key"
  ON "composio_integration"("organizationId", "toolkitSlug");

CREATE INDEX IF NOT EXISTS "composio_integration_organizationId_idx"
  ON "composio_integration"("organizationId");

CREATE INDEX IF NOT EXISTS "composio_integration_organizationId_isConnected_idx"
  ON "composio_integration"("organizationId", "isConnected");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'composio_integration_organizationId_fkey'
  ) THEN
    ALTER TABLE "composio_integration"
      ADD CONSTRAINT "composio_integration_organizationId_fkey"
      FOREIGN KEY ("organizationId") REFERENCES "organization"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
