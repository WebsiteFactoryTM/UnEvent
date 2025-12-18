import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP CONSTRAINT "events_venue_address_details_venue_city_id_cities_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_venue_address_details_venue_city_id_cities_id_fk";
  
  DROP INDEX "events_venue_address_details_venue_address_details_venue_idx";
  DROP INDEX "_events_v_version_venue_address_details_version_venue_ad_idx";
  ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-18T06:07:20.626Z';
  ALTER TABLE "events" DROP COLUMN "venue_address_details_venue_address";
  ALTER TABLE "events" DROP COLUMN "venue_address_details_venue_city_id";
  ALTER TABLE "events" DROP COLUMN "venue_address_details_venue_geo";
  ALTER TABLE "_events_v" DROP COLUMN "version_venue_address_details_venue_address";
  ALTER TABLE "_events_v" DROP COLUMN "version_venue_address_details_venue_city_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_venue_address_details_venue_geo";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "events" ADD COLUMN "venue_address_details_venue_address" varchar;
  ALTER TABLE "events" ADD COLUMN "venue_address_details_venue_city_id" integer;
  ALTER TABLE "events" ADD COLUMN "venue_address_details_venue_geo" geometry(Point);
  ALTER TABLE "_events_v" ADD COLUMN "version_venue_address_details_venue_address" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_venue_address_details_venue_city_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_venue_address_details_venue_geo" geometry(Point);
  ALTER TABLE "events" ADD CONSTRAINT "events_venue_address_details_venue_city_id_cities_id_fk" FOREIGN KEY ("venue_address_details_venue_city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_venue_address_details_venue_city_id_cities_id_fk" FOREIGN KEY ("version_venue_address_details_venue_city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "events_venue_address_details_venue_address_details_venue_idx" ON "events" USING btree ("venue_address_details_venue_city_id");
  CREATE INDEX "_events_v_version_venue_address_details_version_venue_ad_idx" ON "_events_v" USING btree ("version_venue_address_details_venue_city_id");`)
}
