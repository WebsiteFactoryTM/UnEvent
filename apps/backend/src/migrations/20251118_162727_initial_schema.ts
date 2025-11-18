import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-11-18T16:27:26.931Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-11-18T16:27:26.931Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-11-18T16:27:26.931Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-11-18T16:27:26.931Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-11-18T16:27:26.931Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-11-18T16:27:26.931Z';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-11-17T10:50:06.938Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-11-17T10:50:06.938Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-11-17T10:50:06.938Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-11-17T10:50:06.938Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-11-17T10:50:06.938Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-11-17T10:50:06.938Z';`)
}
