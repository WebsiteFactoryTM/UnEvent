-- Simple migration to add moderation_status column
-- This replaces the failed 004 migration with a simpler approach

BEGIN;

-- Step 1: Create enum types if they don't exist
DO $$ BEGIN
  CREATE TYPE "enum_locations_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "enum_events_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "enum_services_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "enum__locations_v_version_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "enum__events_v_version_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "enum__services_v_version_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add moderation_status column to main tables if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'locations' AND column_name = 'moderation_status'
  ) THEN
    ALTER TABLE "locations" 
    ADD COLUMN "moderation_status" "enum_locations_moderation_status" DEFAULT 'pending';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'moderation_status'
  ) THEN
    ALTER TABLE "events" 
    ADD COLUMN "moderation_status" "enum_events_moderation_status" DEFAULT 'pending';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'moderation_status'
  ) THEN
    ALTER TABLE "services" 
    ADD COLUMN "moderation_status" "enum_services_moderation_status" DEFAULT 'pending';
  END IF;
END $$;

-- Step 3: Add moderation_status to version tables if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = '_locations_v' AND column_name = 'version_moderation_status'
  ) THEN
    ALTER TABLE "_locations_v" 
    ADD COLUMN "version_moderation_status" "enum__locations_v_version_moderation_status";
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = '_events_v' AND column_name = 'version_moderation_status'
  ) THEN
    ALTER TABLE "_events_v" 
    ADD COLUMN "version_moderation_status" "enum__events_v_version_moderation_status";
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = '_services_v' AND column_name = 'version_moderation_status'
  ) THEN
    ALTER TABLE "_services_v" 
    ADD COLUMN "version_moderation_status" "enum__services_v_version_moderation_status";
  END IF;
END $$;

-- Step 4: Add _status column for Payload's draft system if it doesn't exist
ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "_status" varchar DEFAULT 'published';
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "_status" varchar DEFAULT 'published';
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "_status" varchar DEFAULT 'published';

-- Add _status to version tables
ALTER TABLE "_locations_v" ADD COLUMN IF NOT EXISTS "version__status" varchar;
ALTER TABLE "_events_v" ADD COLUMN IF NOT EXISTS "version__status" varchar;
ALTER TABLE "_services_v" ADD COLUMN IF NOT EXISTS "version__status" varchar;

COMMIT;

-- Step 5: Create indexes on moderation_status for better query performance
-- (These must be outside the transaction because of CONCURRENTLY)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_locations_moderation_status" ON "locations" ("moderation_status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_events_moderation_status" ON "events" ("moderation_status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_services_moderation_status" ON "services" ("moderation_status");

