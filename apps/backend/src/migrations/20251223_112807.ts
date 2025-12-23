import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-23T11:28:07.474Z';
  ALTER TABLE "events" ALTER COLUMN "tier" SET DEFAULT 'standard';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-23T11:28:07.474Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_tier" SET DEFAULT 'standard';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-23T11:28:07.474Z';
  ALTER TABLE "locations" ALTER COLUMN "tier" SET DEFAULT 'standard';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-23T11:28:07.474Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_tier" SET DEFAULT 'standard';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-23T11:28:07.474Z';
  ALTER TABLE "services" ALTER COLUMN "tier" SET DEFAULT 'standard';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-23T11:28:07.474Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_tier" SET DEFAULT 'standard';
  
  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'search' AND column_name = 'type' AND data_type != 'jsonb'
    ) THEN
      ALTER TABLE "search" ALTER COLUMN "type" SET DATA TYPE jsonb USING 
        CASE 
          WHEN "type" IS NULL THEN NULL
          WHEN "type" = '' THEN NULL
          ELSE "type"::jsonb
        END;
    END IF;
  END $$;
  
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'search' AND column_name = 'city_name') THEN
      ALTER TABLE "search" ADD COLUMN "city_name" varchar;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'search' AND column_name = 'image_url') THEN
      ALTER TABLE "search" ADD COLUMN "image_url" varchar;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'search' AND column_name = 'listing_collection_name') THEN
      ALTER TABLE "search" ADD COLUMN "listing_collection_name" varchar;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'search' AND column_name = 'slug') THEN
      ALTER TABLE "search" ADD COLUMN "slug" varchar;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'search' AND column_name = 'rating') THEN
      ALTER TABLE "search" ADD COLUMN "rating" numeric;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'search' AND column_name = 'tier') THEN
      ALTER TABLE "search" ADD COLUMN "tier" varchar;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'search' AND column_name = 'views') THEN
      ALTER TABLE "search" ADD COLUMN "views" numeric;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'search' AND column_name = 'favorites_count') THEN
      ALTER TABLE "search" ADD COLUMN "favorites_count" numeric;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'search' AND column_name = 'type_text') THEN
      ALTER TABLE "search" ADD COLUMN "type_text" varchar;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'search' AND column_name = 'suitable_for_text') THEN
      ALTER TABLE "search" ADD COLUMN "suitable_for_text" varchar;
    END IF;
  END $$;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "tier" DROP DEFAULT;
  ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-19T14:16:57.147Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_tier" DROP DEFAULT;
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-19T14:16:57.147Z';
  ALTER TABLE "locations" ALTER COLUMN "tier" DROP DEFAULT;
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-19T14:16:57.147Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_tier" DROP DEFAULT;
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-19T14:16:57.147Z';
  ALTER TABLE "services" ALTER COLUMN "tier" DROP DEFAULT;
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-19T14:16:57.147Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_tier" DROP DEFAULT;
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-19T14:16:57.147Z';
  ALTER TABLE "search" ALTER COLUMN "type" SET DATA TYPE varchar;
  ALTER TABLE "search" DROP COLUMN "city_name";
  ALTER TABLE "search" DROP COLUMN "image_url";
  ALTER TABLE "search" DROP COLUMN "listing_collection_name";
  ALTER TABLE "search" DROP COLUMN "slug";
  ALTER TABLE "search" DROP COLUMN "rating";
  ALTER TABLE "search" DROP COLUMN "tier";
  ALTER TABLE "search" DROP COLUMN "views";
  ALTER TABLE "search" DROP COLUMN "favorites_count";
  ALTER TABLE "search" DROP COLUMN "type_text";
  ALTER TABLE "search" DROP COLUMN "suitable_for_text";`)
}
