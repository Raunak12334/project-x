UPDATE "credential"
SET "valueEncrypted" = "value"
WHERE "valueEncrypted" IS NULL
  AND "value" IS NOT NULL;

UPDATE "credential"
SET "value" = NULL
WHERE "value" IS NOT NULL;
