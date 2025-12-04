import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T13:59:53.258Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T13:59:53.258Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T13:59:53.258Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T13:59:53.258Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T13:59:53.258Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T13:59:53.258Z';
  ALTER TABLE "events" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_events_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "locations" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_locations_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "services" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_services_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  CREATE INDEX "events_deleted_at_idx" ON "events" USING btree ("deleted_at");
  CREATE INDEX "_events_v_version_version_deleted_at_idx" ON "_events_v" USING btree ("version_deleted_at");
  CREATE INDEX "locations_deleted_at_idx" ON "locations" USING btree ("deleted_at");
  CREATE INDEX "_locations_v_version_version_deleted_at_idx" ON "_locations_v" USING btree ("version_deleted_at");
  CREATE INDEX "services_deleted_at_idx" ON "services" USING btree ("deleted_at");
  CREATE INDEX "_services_v_version_version_deleted_at_idx" ON "_services_v" USING btree ("version_deleted_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "events_deleted_at_idx";
  DROP INDEX "_events_v_version_version_deleted_at_idx";
  DROP INDEX "locations_deleted_at_idx";
  DROP INDEX "_locations_v_version_version_deleted_at_idx";
  DROP INDEX "services_deleted_at_idx";
  DROP INDEX "_services_v_version_version_deleted_at_idx";
  ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T12:57:48.292Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T12:57:48.292Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T12:57:48.292Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T12:57:48.292Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-04T12:57:48.292Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-04T12:57:48.292Z';
  ALTER TABLE "events" DROP COLUMN "deleted_at";
  ALTER TABLE "_events_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "locations" DROP COLUMN "deleted_at";
  ALTER TABLE "_locations_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "services" DROP COLUMN "deleted_at";
  ALTER TABLE "_services_v" DROP COLUMN "version_deleted_at";`)
}
