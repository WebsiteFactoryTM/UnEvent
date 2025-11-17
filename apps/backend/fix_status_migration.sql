-- Migration to fix status -> moderationStatus rename and add _status column
-- Run this manually: psql $DATABASE_URL -f fix_status_migration.sql

BEGIN;

-- Step 1: Create new enum types for moderation_status
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

-- Step 2: Migrate existing columns from old enum to new enum
-- Locations
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'locations' 
    AND column_name = 'moderation_status'
  ) THEN
    -- Drop default constraint
    ALTER TABLE "locations" ALTER COLUMN "moderation_status" DROP DEFAULT;
    
    -- Convert to varchar first
    ALTER TABLE "locations" 
    ALTER COLUMN "moderation_status" TYPE varchar USING "moderation_status"::varchar;
    
    -- Then convert to new enum
    ALTER TABLE "locations" 
    ALTER COLUMN "moderation_status" TYPE "enum_locations_moderation_status" 
    USING "moderation_status"::"enum_locations_moderation_status";
    
    -- Restore default
    ALTER TABLE "locations" ALTER COLUMN "moderation_status" SET DEFAULT 'pending';
  END IF;
END $$;

-- Events
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'moderation_status'
  ) THEN
    ALTER TABLE "events" ALTER COLUMN "moderation_status" DROP DEFAULT;
    
    ALTER TABLE "events" 
    ALTER COLUMN "moderation_status" TYPE varchar USING "moderation_status"::varchar;
    
    ALTER TABLE "events" 
    ALTER COLUMN "moderation_status" TYPE "enum_events_moderation_status" 
    USING "moderation_status"::"enum_events_moderation_status";
    
    ALTER TABLE "events" ALTER COLUMN "moderation_status" SET DEFAULT 'pending';
  END IF;
END $$;

-- Services
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' 
    AND column_name = 'moderation_status'
  ) THEN
    ALTER TABLE "services" ALTER COLUMN "moderation_status" DROP DEFAULT;
    
    ALTER TABLE "services" 
    ALTER COLUMN "moderation_status" TYPE varchar USING "moderation_status"::varchar;
    
    ALTER TABLE "services" 
    ALTER COLUMN "moderation_status" TYPE "enum_services_moderation_status" 
    USING "moderation_status"::"enum_services_moderation_status";
    
    ALTER TABLE "services" ALTER COLUMN "moderation_status" SET DEFAULT 'pending';
  END IF;
END $$;

-- Step 3: Migrate version tables
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = '_locations_v' 
    AND column_name = 'version_moderation_status'
  ) THEN
    ALTER TABLE "_locations_v" 
    ALTER COLUMN "version_moderation_status" TYPE varchar USING "version_moderation_status"::varchar;
    
    ALTER TABLE "_locations_v" 
    ALTER COLUMN "version_moderation_status" TYPE "enum__locations_v_version_moderation_status" 
    USING "version_moderation_status"::"enum__locations_v_version_moderation_status";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = '_events_v' 
    AND column_name = 'version_moderation_status'
  ) THEN
    ALTER TABLE "_events_v" 
    ALTER COLUMN "version_moderation_status" TYPE varchar USING "version_moderation_status"::varchar;
    
    ALTER TABLE "_events_v" 
    ALTER COLUMN "version_moderation_status" TYPE "enum__events_v_version_moderation_status" 
    USING "version_moderation_status"::"enum__events_v_version_moderation_status";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = '_services_v' 
    AND column_name = 'version_moderation_status'
  ) THEN
    ALTER TABLE "_services_v" 
    ALTER COLUMN "version_moderation_status" TYPE varchar USING "version_moderation_status"::varchar;
    
    ALTER TABLE "_services_v" 
    ALTER COLUMN "version_moderation_status" TYPE "enum__services_v_version_moderation_status" 
    USING "version_moderation_status"::"enum__services_v_version_moderation_status";
  END IF;
END $$;

-- Step 4: Add _status column for Payload's draft system
ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "_status" varchar DEFAULT 'published';
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "_status" varchar DEFAULT 'published';
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "_status" varchar DEFAULT 'published';

-- Add _status to version tables (note: version tables use "version_" prefix)
ALTER TABLE "_locations_v" ADD COLUMN IF NOT EXISTS "version__status" varchar;
ALTER TABLE "_events_v" ADD COLUMN IF NOT EXISTS "version__status" varchar;
ALTER TABLE "_services_v" ADD COLUMN IF NOT EXISTS "version__status" varchar;

-- Step 5: Drop old enum types (they should no longer be in use)
DROP TYPE IF EXISTS "enum_locations_status" CASCADE;
DROP TYPE IF EXISTS "enum_events_status" CASCADE;
DROP TYPE IF EXISTS "enum_services_status" CASCADE;
DROP TYPE IF EXISTS "enum__locations_v_version_status" CASCADE;
DROP TYPE IF EXISTS "enum__events_v_version_status" CASCADE;
DROP TYPE IF EXISTS "enum__services_v_version_status" CASCADE;

COMMIT;

