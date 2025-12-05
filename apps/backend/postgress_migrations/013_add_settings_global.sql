-- Migration: Add Settings Global
-- Description: Creates the settings table for admin panel controls
-- Date: 2025-12-05
-- Related migration: 20251205_075202.ts

-- Create enum for scheduler environment
CREATE TYPE "public"."enum_settings_scheduler_environment" AS ENUM('dev', 'staging', 'production');

-- Create settings table
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"enable_jobs" boolean DEFAULT false,
	"scheduler_environment" "enum_settings_scheduler_environment",
	"updated_at" timestamp(3) with time zone DEFAULT NOW(),
	"created_at" timestamp(3) with time zone DEFAULT NOW()
);

-- Update last_viewed_at defaults (these change with each migration)
-- Note: These updates are safe to run and ensure consistency with Payload's generated schema
ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT NOW();
ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT NOW();
ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT NOW();
ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT NOW();
ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT NOW();
ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT NOW();

-- Optional: Insert default settings record
-- Uncomment if you want to pre-populate with default values
-- INSERT INTO "settings" ("name", "enable_jobs", "scheduler_environment") 
-- VALUES ('default', false, 'dev');
