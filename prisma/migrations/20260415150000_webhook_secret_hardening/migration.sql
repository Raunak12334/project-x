CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE "workflow"
SET "webhookSecret" = encode(gen_random_bytes(32), 'hex')
WHERE "webhookSecret" IS NULL;

ALTER TABLE "workflow"
ALTER COLUMN "webhookSecret" SET NOT NULL;
