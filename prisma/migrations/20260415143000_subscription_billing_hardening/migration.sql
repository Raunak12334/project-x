-- Align billing storage with the current application contract while preserving
-- legacy ENTERPRISE plan rows from older deployments.

DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'UNPAID', 'TRIALING');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "Plan" ADD VALUE IF NOT EXISTS 'CUSTOM';

ALTER TABLE "subscription"
  ADD COLUMN IF NOT EXISTS "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "canceledAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "polarCustomerId" TEXT,
  ADD COLUMN IF NOT EXISTS "polarSubscriptionId" TEXT,
  ADD COLUMN IF NOT EXISTS "productId" TEXT,
  ADD COLUMN IF NOT EXISTS "priceId" TEXT,
  ADD COLUMN IF NOT EXISTS "workflowLimit" INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS "featureFlags" JSONB;

UPDATE "subscription"
SET "workflowLimit" = CASE
  WHEN "plan" = 'FREE' THEN 2
  ELSE -1
END
WHERE "workflowLimit" IS NULL OR "workflowLimit" = 2;

CREATE UNIQUE INDEX IF NOT EXISTS "subscription_polarCustomerId_key"
  ON "subscription"("polarCustomerId");

CREATE UNIQUE INDEX IF NOT EXISTS "subscription_polarSubscriptionId_key"
  ON "subscription"("polarSubscriptionId");

CREATE UNIQUE INDEX IF NOT EXISTS "execution_idempotencyKey_key"
  ON "execution"("idempotencyKey")
  WHERE "idempotencyKey" IS NOT NULL;
