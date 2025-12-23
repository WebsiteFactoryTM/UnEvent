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
  ALTER TABLE "search" ALTER COLUMN "type" SET DATA TYPE jsonb;
  ALTER TABLE "search" ADD COLUMN "city_name" varchar;
  ALTER TABLE "search" ADD COLUMN "image_url" varchar;
  ALTER TABLE "search" ADD COLUMN "listing_collection_name" varchar;
  ALTER TABLE "search" ADD COLUMN "slug" varchar;
  ALTER TABLE "search" ADD COLUMN "rating" numeric;
  ALTER TABLE "search" ADD COLUMN "tier" varchar;
  ALTER TABLE "search" ADD COLUMN "views" numeric;
  ALTER TABLE "search" ADD COLUMN "favorites_count" numeric;
  ALTER TABLE "search" ADD COLUMN "type_text" varchar;
  ALTER TABLE "search" ADD COLUMN "suitable_for_text" varchar;`)
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
