ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_profiles_fk";

DROP INDEX "search_rels_profiles_id_idx";
ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T08:26:19.820Z';
ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T08:26:19.820Z';
ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T08:26:19.820Z';
ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T08:26:19.820Z';
ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T08:26:19.820Z';
ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T08:26:19.820Z';
ALTER TABLE "search" ALTER COLUMN "type" SET DATA TYPE jsonb;
ALTER TABLE "search" ADD COLUMN "city_name" varchar;
ALTER TABLE "search" ADD COLUMN "image_url" varchar;
ALTER TABLE "search" ADD COLUMN "listing_collection_name" varchar;
ALTER TABLE "search_rels" DROP COLUMN "profiles_id";

ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T09:08:07.512Z';
ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T09:08:07.512Z';
ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T09:08:07.512Z';
ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T09:08:07.512Z';
ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T09:08:07.512Z';
ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T09:08:07.512Z';
ALTER TABLE "search" ADD COLUMN "slug" varchar;