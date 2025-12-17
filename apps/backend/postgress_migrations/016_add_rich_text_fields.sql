-- Update default values for last_viewed_at (mirrored from generated migration)
ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';

-- Add bio_rich to profiles
ALTER TABLE "profiles" ADD COLUMN "bio_rich" jsonb;

-- Add description_rich to events and its version table
ALTER TABLE "events" ADD COLUMN "description_rich" jsonb;
ALTER TABLE "_events_v" ADD COLUMN "version_description_rich" jsonb;

-- Add description_rich to locations and its version table
ALTER TABLE "locations" ADD COLUMN "description_rich" jsonb;
ALTER TABLE "_locations_v" ADD COLUMN "version_description_rich" jsonb;

-- Add description_rich to services and its version table
ALTER TABLE "services" ADD COLUMN "description_rich" jsonb;
ALTER TABLE "_services_v" ADD COLUMN "version_description_rich" jsonb;
