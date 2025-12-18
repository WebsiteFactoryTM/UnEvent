import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_profiles_fk";
  
  DROP INDEX "search_rels_profiles_id_idx";
  ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T12:01:09.917Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T12:01:09.917Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T12:01:09.917Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T12:01:09.917Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T12:01:09.917Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T12:01:09.917Z';
  ALTER TABLE "search" ALTER COLUMN "type" SET DATA TYPE jsonb;
  ALTER TABLE "search" ADD COLUMN "city_name" varchar;
  ALTER TABLE "search" ADD COLUMN "image_url" varchar;
  ALTER TABLE "search" ADD COLUMN "listing_collection_name" varchar;
  ALTER TABLE "search" ADD COLUMN "slug" varchar;
  ALTER TABLE "search" ADD COLUMN "rating" numeric;
  ALTER TABLE "search" ADD COLUMN "tier" varchar;
  ALTER TABLE "search" ADD COLUMN "views" numeric;
  ALTER TABLE "search" ADD COLUMN "favorites_count" numeric;
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
