import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_hub_snapshots_popular_city_rows_items_tier" AS ENUM('new', 'standard', 'sponsored', 'recommended');
  CREATE TYPE "public"."enum_hub_snapshots_featured_tier" AS ENUM('new', 'standard', 'sponsored', 'recommended');
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_profiles_fk";
  
  DROP INDEX "search_rels_profiles_id_idx";
  ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-19T14:16:57.147Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-19T14:16:57.147Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-19T14:16:57.147Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-19T14:16:57.147Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-19T14:16:57.147Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-19T14:16:57.147Z';
  ALTER TABLE "hub_snapshots_popular_city_rows_items" ADD COLUMN "description_rich" jsonb;
  ALTER TABLE "hub_snapshots_popular_city_rows_items" ADD COLUMN "tier" "enum_hub_snapshots_popular_city_rows_items_tier";
  ALTER TABLE "hub_snapshots_featured" ADD COLUMN "description_rich" jsonb;
  ALTER TABLE "hub_snapshots_featured" ADD COLUMN "tier" "enum_hub_snapshots_featured_tier";
  ALTER TABLE "search_rels" DROP COLUMN "profiles_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "search_rels" ADD COLUMN "profiles_id" integer;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_profiles_fk" FOREIGN KEY ("profiles_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "search_rels_profiles_id_idx" ON "search_rels" USING btree ("profiles_id");
  ALTER TABLE "hub_snapshots_popular_city_rows_items" DROP COLUMN "description_rich";
  ALTER TABLE "hub_snapshots_popular_city_rows_items" DROP COLUMN "tier";
  ALTER TABLE "hub_snapshots_featured" DROP COLUMN "description_rich";
  ALTER TABLE "hub_snapshots_featured" DROP COLUMN "tier";
  DROP TYPE "public"."enum_hub_snapshots_popular_city_rows_items_tier";
  DROP TYPE "public"."enum_hub_snapshots_featured_tier";`)
}
