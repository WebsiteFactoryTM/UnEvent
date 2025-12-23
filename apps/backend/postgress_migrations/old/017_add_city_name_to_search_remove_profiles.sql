-- Migration to add city_name to search table and remove profiles from search
-- Mirrors Payload migration: 20251217_150432.ts
-- This migration:
-- 1. Removes profiles from search (drops foreign key and column)
-- 2. Adds city_name column to search table for searchable city names
-- 3. Updates default values for last_viewed_at columns

BEGIN;

-- Step 1: Drop foreign key constraint for profiles in search_rels (if exists)
DO $$ BEGIN
  ALTER TABLE "search_rels" DROP CONSTRAINT IF EXISTS "search_rels_profiles_fk";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Step 2: Drop index for profiles_id in search_rels (if exists)
DROP INDEX IF EXISTS "search_rels_profiles_id_idx";

-- Step 3: Update default values for last_viewed_at columns
ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T15:04:32.636Z';
ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T15:04:32.636Z';
ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T15:04:32.636Z';
ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T15:04:32.636Z';
ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T15:04:32.636Z';
ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T15:04:32.636Z';

-- Step 4: Add city_name column to search table (if it doesn't exist)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'search' AND column_name = 'city_name'
  ) THEN
    ALTER TABLE "search" ADD COLUMN "city_name" varchar;
  END IF;
END $$;

-- Step 5: Add image_url column to search table (if it doesn't exist)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'search' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE "search" ADD COLUMN "image_url" varchar;
  END IF;
END $$;

-- Step 6: Drop profiles_id column from search_rels (if exists)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'search_rels' AND column_name = 'profiles_id'
  ) THEN
    ALTER TABLE "search_rels" DROP COLUMN "profiles_id";
  END IF;
END $$;

COMMIT;
