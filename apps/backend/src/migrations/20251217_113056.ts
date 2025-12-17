import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "profiles" ADD COLUMN "bio_rich" jsonb;
  ALTER TABLE "events" ADD COLUMN "description_rich" jsonb;
  ALTER TABLE "_events_v" ADD COLUMN "version_description_rich" jsonb;
  ALTER TABLE "locations" ADD COLUMN "description_rich" jsonb;
  ALTER TABLE "_locations_v" ADD COLUMN "version_description_rich" jsonb;
  ALTER TABLE "services" ADD COLUMN "description_rich" jsonb;
  ALTER TABLE "_services_v" ADD COLUMN "version_description_rich" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-16T12:04:12.229Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-16T12:04:12.229Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-16T12:04:12.229Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-16T12:04:12.229Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-16T12:04:12.229Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-16T12:04:12.229Z';
  ALTER TABLE "profiles" DROP COLUMN "bio_rich";
  ALTER TABLE "events" DROP COLUMN "description_rich";
  ALTER TABLE "_events_v" DROP COLUMN "version_description_rich";
  ALTER TABLE "locations" DROP COLUMN "description_rich";
  ALTER TABLE "_locations_v" DROP COLUMN "version_description_rich";
  ALTER TABLE "services" DROP COLUMN "description_rich";
  ALTER TABLE "_services_v" DROP COLUMN "version_description_rich";`)
}
