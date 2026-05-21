
-- Explicitly add the accessRoles column with a default value if it doesn't exist
-- or ensure the default value is set if it does exist.
DO $$ 
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='credential' AND column_name='accessRoles') THEN
        ALTER TABLE "credential" ADD COLUMN "accessRoles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
    ELSE
        -- If it exists, ensure it's NOT NULL and has the correct default
        ALTER TABLE "credential" ALTER COLUMN "accessRoles" SET NOT NULL;
        ALTER TABLE "credential" ALTER COLUMN "accessRoles" SET DEFAULT ARRAY[]::TEXT[];
        
        -- Update any existing NULL values to empty array (just in case)
        UPDATE "credential" SET "accessRoles" = ARRAY[]::TEXT[] WHERE "accessRoles" IS NULL;
    END IF;
END $$;
