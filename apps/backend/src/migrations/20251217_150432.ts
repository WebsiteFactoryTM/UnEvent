import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search_rels" DROP CONSTRAINT IF EXISTS "search_rels_profiles_fk";
  
  DROP INDEX IF EXISTS "search_rels_profiles_id_idx";
  ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T15:04:32.636Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T15:04:32.636Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T15:04:32.636Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T15:04:32.636Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T15:04:32.636Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T15:04:32.636Z';
  
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'search' AND column_name = 'city_name'
    ) THEN
      ALTER TABLE "search" ADD COLUMN "city_name" varchar;
    END IF;
  END $$;
  
  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'search_rels' AND column_name = 'profiles_id'
    ) THEN
      ALTER TABLE "search_rels" DROP COLUMN "profiles_id";
    END IF;
  END $$;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-17T11:30:56.293Z';
  ALTER TABLE "search_rels" ADD COLUMN "profiles_id" integer;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_profiles_fk" FOREIGN KEY ("profiles_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "search_rels_profiles_id_idx" ON "search_rels" USING btree ("profiles_id");
  ALTER TABLE "search" DROP COLUMN "city_name";`)
}
