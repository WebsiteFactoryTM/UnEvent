import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T12:57:48.292Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T12:57:48.292Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T12:57:48.292Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T12:57:48.292Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T12:57:48.292Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T12:57:48.292Z';
  ALTER TABLE "aggregates" ADD COLUMN "views" numeric DEFAULT 0;
  ALTER TABLE "aggregates" ADD COLUMN "impressions7d" numeric DEFAULT 0;
  ALTER TABLE "aggregates" ADD COLUMN "impressions30d" numeric DEFAULT 0;
  ALTER TABLE "aggregates" ADD COLUMN "impressions" numeric DEFAULT 0;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T12:18:15.180Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T12:18:15.180Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T12:18:15.180Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T12:18:15.180Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T12:18:15.180Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T12:18:15.180Z';
  ALTER TABLE "aggregates" DROP COLUMN "views";
  ALTER TABLE "aggregates" DROP COLUMN "impressions7d";
  ALTER TABLE "aggregates" DROP COLUMN "impressions30d";
  ALTER TABLE "aggregates" DROP COLUMN "impressions";`)
}
