-- Migration to add deleted_at column for soft delete functionality
-- Mimics PayloadCMS migration 20251204_135953
-- Adds deleted_at timestamp column to locations, events, and services tables (main and version tables)
-- Includes indexes for efficient filtering and cleanup queries

BEGIN;

-- Step 1: Update last_viewed_at defaults (PayloadCMS housekeeping)
ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T13:59:53.258Z';
ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T13:59:53.258Z';
ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T13:59:53.258Z';
ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T13:59:53.258Z';
ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T13:59:53.258Z';
ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T13:59:53.258Z';

-- Step 2: Add deleted_at column to main tables if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE "events" 
    ADD COLUMN "deleted_at" timestamp(3) with time zone;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'locations' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE "locations" 
    ADD COLUMN "deleted_at" timestamp(3) with time zone;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE "services" 
    ADD COLUMN "deleted_at" timestamp(3) with time zone;
  END IF;
END $$;

-- Step 3: Add version_deleted_at column to version tables if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = '_events_v' AND column_name = 'version_deleted_at'
  ) THEN
    ALTER TABLE "_events_v" 
    ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = '_locations_v' AND column_name = 'version_deleted_at'
  ) THEN
    ALTER TABLE "_locations_v" 
    ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = '_services_v' AND column_name = 'version_deleted_at'
  ) THEN
    ALTER TABLE "_services_v" 
    ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  END IF;
END $$;

COMMIT;

-- Step 4: Create indexes for efficient filtering and cleanup queries
-- (These must be outside the transaction because of CONCURRENTLY)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "events_deleted_at_idx" ON "events" USING btree ("deleted_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "_events_v_version_version_deleted_at_idx" ON "_events_v" USING btree ("version_deleted_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "locations_deleted_at_idx" ON "locations" USING btree ("deleted_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "_locations_v_version_version_deleted_at_idx" ON "_locations_v" USING btree ("version_deleted_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "services_deleted_at_idx" ON "services" USING btree ("deleted_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "_services_v_version_version_deleted_at_idx" ON "_services_v" USING btree ("version_deleted_at");

