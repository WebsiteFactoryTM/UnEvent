-- 020_rollback_tiers_and_search.sql
-- Roll back tier enum changes (019 / 20251218_095010) and search field additions (018 / 20251218_082620).
-- NOTE: This restores the old 4-value enums and removes the new search fields,
-- but cannot recover original per-row tier values (those were already overwritten).

-- 1) Revert tier enums back to: 'new','standard','sponsored','recommended'
ALTER TABLE "events" ALTER COLUMN "tier" SET DATA TYPE text;
DROP TYPE "public"."enum_events_tier";
CREATE TYPE "public"."enum_events_tier" AS ENUM('new', 'standard', 'sponsored', 'recommended');
ALTER TABLE "events" ALTER COLUMN "tier" SET DATA TYPE "public"."enum_events_tier" USING "tier"::"public"."enum_events_tier";

ALTER TABLE "_events_v" ALTER COLUMN "version_tier" SET DATA TYPE text;
DROP TYPE "public"."enum__events_v_version_tier";
CREATE TYPE "public"."enum__events_v_version_tier" AS ENUM('new', 'standard', 'sponsored', 'recommended');
ALTER TABLE "_events_v" ALTER COLUMN "version_tier" SET DATA TYPE "public"."enum__events_v_version_tier" USING "version_tier"::"public"."enum__events_v_version_tier";

ALTER TABLE "locations" ALTER COLUMN "tier" SET DATA TYPE text;
DROP TYPE "public"."enum_locations_tier";
CREATE TYPE "public"."enum_locations_tier" AS ENUM('new', 'standard', 'sponsored', 'recommended');
ALTER TABLE "locations" ALTER COLUMN "tier" SET DATA TYPE "public"."enum_locations_tier" USING "tier"::"public"."enum_locations_tier";

ALTER TABLE "_locations_v" ALTER COLUMN "version_tier" SET DATA TYPE text;
DROP TYPE "public"."enum__locations_v_version_tier";
CREATE TYPE "public"."enum__locations_v_version_tier" AS ENUM('new', 'standard', 'sponsored', 'recommended');
ALTER TABLE "_locations_v" ALTER COLUMN "version_tier" SET DATA TYPE "public"."enum__locations_v_version_tier" USING "version_tier"::"public"."enum__locations_v_version_tier";

ALTER TABLE "services" ALTER COLUMN "tier" SET DATA TYPE text;
DROP TYPE "public"."enum_services_tier";
CREATE TYPE "public"."enum_services_tier" AS ENUM('new', 'standard', 'sponsored', 'recommended');
ALTER TABLE "services" ALTER COLUMN "tier" SET DATA TYPE "public"."enum_services_tier" USING "tier"::"public"."enum_services_tier";

ALTER TABLE "_services_v" ALTER COLUMN "version_tier" SET DATA TYPE text;
DROP TYPE "public"."enum__services_v_version_tier";
CREATE TYPE "public"."enum__services_v_version_tier" AS ENUM('new', 'standard', 'sponsored', 'recommended');
ALTER TABLE "_services_v" ALTER COLUMN "version_tier" SET DATA TYPE "public"."enum__services_v_version_tier" USING "version_tier"::"public"."enum__services_v_version_tier";

-- 2) Remove search metric fields added by 019 / 20251218_095010
ALTER TABLE "search" DROP COLUMN IF EXISTS "rating";
ALTER TABLE "search" DROP COLUMN IF EXISTS "tier";
ALTER TABLE "search" DROP COLUMN IF EXISTS "views";
ALTER TABLE "search" DROP COLUMN IF EXISTS "favorites_count";

-- 3) Roll back search collection additions from 018 / 20251218_082620
--    - Change search.type jsonb -> varchar
--    - Restore search_rels.profiles_id + FK + index
--    - Drop city_name, image_url, listing_collection_name, slug

ALTER TABLE "search" ALTER COLUMN "type" SET DATA TYPE varchar;

ALTER TABLE "search_rels" ADD COLUMN IF NOT EXISTS "profiles_id" integer;
ALTER TABLE "search_rels" DROP CONSTRAINT IF EXISTS "search_rels_profiles_fk";
ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_profiles_fk"
  FOREIGN KEY ("profiles_id")
  REFERENCES "public"."profiles"("id")
  ON DELETE CASCADE
  ON UPDATE NO ACTION;

DROP INDEX IF EXISTS "search_rels_profiles_id_idx";
CREATE INDEX "search_rels_profiles_id_idx" ON "search_rels" USING btree ("profiles_id");

ALTER TABLE "search" DROP COLUMN IF EXISTS "city_name";
ALTER TABLE "search" DROP COLUMN IF EXISTS "image_url";
ALTER TABLE "search" DROP COLUMN IF EXISTS "listing_collection_name";
ALTER TABLE "search" DROP COLUMN IF EXISTS "slug";
