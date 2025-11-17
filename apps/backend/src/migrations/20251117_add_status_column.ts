import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Step 1: Create new enum types for moderation_status
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_locations_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    
    DO $$ BEGIN
      CREATE TYPE "enum_events_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    
    DO $$ BEGIN
      CREATE TYPE "enum_services_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Step 2: If the old enum is being used, migrate data and update column types
  // This handles the case where status was renamed to moderationStatus
  await db.execute(sql`
    -- Locations
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'locations' 
        AND column_name = 'moderation_status'
        AND udt_name = 'enum_locations_status'
      ) THEN
        ALTER TABLE "locations" 
        ALTER COLUMN "moderation_status" TYPE varchar USING "moderation_status"::varchar;
        
        ALTER TABLE "locations" 
        ALTER COLUMN "moderation_status" TYPE "enum_locations_moderation_status" 
        USING "moderation_status"::"enum_locations_moderation_status";
      END IF;
    END $$;
    
    -- Events
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'moderation_status'
        AND udt_name = 'enum_events_status'
      ) THEN
        ALTER TABLE "events" 
        ALTER COLUMN "moderation_status" TYPE varchar USING "moderation_status"::varchar;
        
        ALTER TABLE "events" 
        ALTER COLUMN "moderation_status" TYPE "enum_events_moderation_status" 
        USING "moderation_status"::"enum_events_moderation_status";
      END IF;
    END $$;
    
    -- Services
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'moderation_status'
        AND udt_name = 'enum_services_status'
      ) THEN
        ALTER TABLE "services" 
        ALTER COLUMN "moderation_status" TYPE varchar USING "moderation_status"::varchar;
        
        ALTER TABLE "services" 
        ALTER COLUMN "moderation_status" TYPE "enum_services_moderation_status" 
        USING "moderation_status"::"enum_services_moderation_status";
      END IF;
    END $$;
  `)

  // Step 3: Add _status column for Payload's draft system
  await db.execute(sql`
    ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "_status" varchar DEFAULT 'published';
    ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "_status" varchar DEFAULT 'published';
    ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "_status" varchar DEFAULT 'published';
    
    -- Add _status to version tables (note: version tables use "version_" prefix)
    ALTER TABLE "_locations_v" ADD COLUMN IF NOT EXISTS "version__status" varchar;
    ALTER TABLE "_events_v" ADD COLUMN IF NOT EXISTS "version__status" varchar;
    ALTER TABLE "_services_v" ADD COLUMN IF NOT EXISTS "version__status" varchar;
  `)

  // Step 4: Drop old enum types if they exist and are no longer used
  await db.execute(sql`
    DROP TYPE IF EXISTS "enum_locations_status" CASCADE;
    DROP TYPE IF EXISTS "enum_events_status" CASCADE;
    DROP TYPE IF EXISTS "enum_services_status" CASCADE;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Remove _status column
  await db.execute(sql`
    ALTER TABLE "locations" DROP COLUMN IF EXISTS "_status";
    ALTER TABLE "events" DROP COLUMN IF EXISTS "_status";
    ALTER TABLE "services" DROP COLUMN IF EXISTS "_status";
    
    ALTER TABLE "_locations_v" DROP COLUMN IF EXISTS "version__status";
    ALTER TABLE "_events_v" DROP COLUMN IF EXISTS "version__status";
    ALTER TABLE "_services_v" DROP COLUMN IF EXISTS "version__status";
  `)
}
