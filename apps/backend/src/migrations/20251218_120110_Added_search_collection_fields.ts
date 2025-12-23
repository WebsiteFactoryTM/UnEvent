import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search_rels" DROP CONSTRAINT IF EXISTS "search_rels_profiles_fk";
  
  DROP INDEX IF EXISTS "search_rels_profiles_id_idx";
  ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T12:01:09.917Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T12:01:09.917Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T12:01:09.917Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T12:01:09.917Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T12:01:09.917Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T12:01:09.917Z';
  
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
  END $$;
  
  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'search_rels' AND column_name = 'profiles_id'
    ) THEN
      ALTER TABLE "search_rels" DROP COLUMN "profiles_id";
    END IF;
  END $$;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "search" ALTER COLUMN "type" SET DATA TYPE varchar;
  ALTER TABLE "search_rels" ADD COLUMN "profiles_id" integer;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_profiles_fk" FOREIGN KEY ("profiles_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "search_rels_profiles_id_idx" ON "search_rels" USING btree ("profiles_id");
  ALTER TABLE "search" DROP COLUMN "city_name";
  ALTER TABLE "search" DROP COLUMN "image_url";
  ALTER TABLE "search" DROP COLUMN "listing_collection_name";
  ALTER TABLE "search" DROP COLUMN "slug";
  ALTER TABLE "search" DROP COLUMN "rating";
  ALTER TABLE "search" DROP COLUMN "tier";
  ALTER TABLE "search" DROP COLUMN "views";
  ALTER TABLE "search" DROP COLUMN "favorites_count";`)
}
