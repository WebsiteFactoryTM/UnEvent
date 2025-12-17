import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-15T07:42:47.232Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-15T07:42:47.232Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-15T07:42:47.232Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-15T07:42:47.232Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-15T07:42:47.232Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-15T07:42:47.232Z';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-15T07:39:29.594Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-15T07:39:29.594Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-15T07:39:29.594Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-15T07:39:29.594Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-15T07:39:29.594Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-15T07:39:29.594Z';`)
}
