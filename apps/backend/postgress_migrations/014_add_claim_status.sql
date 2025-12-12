-- Migration to add claim_status field to listings and create claims collection
-- Mirrors Payload migration: 20251211_100529_add_claim_status.ts

BEGIN;

-- Step 1: Create enum types for claims collection
DO $$ BEGIN
  CREATE TYPE "enum_claims_listing_type" AS ENUM('locations', 'events', 'services');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "enum_claims_status" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create enum types for claim_status on listings
DO $$ BEGIN
  CREATE TYPE "enum_events_claim_status" AS ENUM('claimed', 'unclaimed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "enum__events_v_version_claim_status" AS ENUM('claimed', 'unclaimed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "enum_locations_claim_status" AS ENUM('claimed', 'unclaimed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "enum__locations_v_version_claim_status" AS ENUM('claimed', 'unclaimed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "enum_services_claim_status" AS ENUM('claimed', 'unclaimed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "enum__services_v_version_claim_status" AS ENUM('claimed', 'unclaimed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 3: Create claims table if it doesn't exist
CREATE TABLE IF NOT EXISTS "claims" (
  "id" serial PRIMARY KEY NOT NULL,
  "listing_type" "enum_claims_listing_type" NOT NULL,
  "claimant_email" varchar NOT NULL,
  "claimant_name" varchar,
  "claimant_phone" varchar,
  "claimant_profile_id" integer,
  "claim_token" varchar NOT NULL,
  "status" "enum_claims_status" DEFAULT 'pending' NOT NULL,
  "rejection_reason" varchar,
  "submitted_at" timestamp(3) with time zone,
  "reviewed_at" timestamp(3) with time zone,
  "reviewed_by_id" integer,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

-- Step 4: Create claims_rels table if it doesn't exist
CREATE TABLE IF NOT EXISTS "claims_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL,
  "locations_id" integer,
  "events_id" integer,
  "services_id" integer
);

-- Step 5: Add claim_status column to main listing tables if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'claim_status'
  ) THEN
    ALTER TABLE "events" 
    ADD COLUMN "claim_status" "enum_events_claim_status" DEFAULT 'claimed';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'locations' AND column_name = 'claim_status'
  ) THEN
    ALTER TABLE "locations" 
    ADD COLUMN "claim_status" "enum_locations_claim_status" DEFAULT 'claimed';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'claim_status'
  ) THEN
    ALTER TABLE "services" 
    ADD COLUMN "claim_status" "enum_services_claim_status" DEFAULT 'claimed';
  END IF;
END $$;

-- Step 6: Add claim_status to version tables if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = '_events_v' AND column_name = 'version_claim_status'
  ) THEN
    ALTER TABLE "_events_v" 
    ADD COLUMN "version_claim_status" "enum__events_v_version_claim_status" DEFAULT 'claimed';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = '_locations_v' AND column_name = 'version_claim_status'
  ) THEN
    ALTER TABLE "_locations_v" 
    ADD COLUMN "version_claim_status" "enum__locations_v_version_claim_status" DEFAULT 'claimed';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = '_services_v' AND column_name = 'version_claim_status'
  ) THEN
    ALTER TABLE "_services_v" 
    ADD COLUMN "version_claim_status" "enum__services_v_version_claim_status" DEFAULT 'claimed';
  END IF;
END $$;

-- Step 7: Add claims_id column to payload_locked_documents_rels if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'claims_id'
  ) THEN
    ALTER TABLE "payload_locked_documents_rels" 
    ADD COLUMN "claims_id" integer;
  END IF;
END $$;

-- Step 8: Add foreign key constraints if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'claims_claimant_profile_id_profiles_id_fk'
  ) THEN
    ALTER TABLE "claims" 
    ADD CONSTRAINT "claims_claimant_profile_id_profiles_id_fk" 
    FOREIGN KEY ("claimant_profile_id") 
    REFERENCES "public"."profiles"("id") 
    ON DELETE set null 
    ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'claims_reviewed_by_id_users_id_fk'
  ) THEN
    ALTER TABLE "claims" 
    ADD CONSTRAINT "claims_reviewed_by_id_users_id_fk" 
    FOREIGN KEY ("reviewed_by_id") 
    REFERENCES "public"."users"("id") 
    ON DELETE set null 
    ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'claims_rels_parent_fk'
  ) THEN
    ALTER TABLE "claims_rels" 
    ADD CONSTRAINT "claims_rels_parent_fk" 
    FOREIGN KEY ("parent_id") 
    REFERENCES "public"."claims"("id") 
    ON DELETE cascade 
    ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'claims_rels_locations_fk'
  ) THEN
    ALTER TABLE "claims_rels" 
    ADD CONSTRAINT "claims_rels_locations_fk" 
    FOREIGN KEY ("locations_id") 
    REFERENCES "public"."locations"("id") 
    ON DELETE cascade 
    ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'claims_rels_events_fk'
  ) THEN
    ALTER TABLE "claims_rels" 
    ADD CONSTRAINT "claims_rels_events_fk" 
    FOREIGN KEY ("events_id") 
    REFERENCES "public"."events"("id") 
    ON DELETE cascade 
    ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'claims_rels_services_fk'
  ) THEN
    ALTER TABLE "claims_rels" 
    ADD CONSTRAINT "claims_rels_services_fk" 
    FOREIGN KEY ("services_id") 
    REFERENCES "public"."services"("id") 
    ON DELETE cascade 
    ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'payload_locked_documents_rels_claims_fk'
  ) THEN
    ALTER TABLE "payload_locked_documents_rels" 
    ADD CONSTRAINT "payload_locked_documents_rels_claims_fk" 
    FOREIGN KEY ("claims_id") 
    REFERENCES "public"."claims"("id") 
    ON DELETE cascade 
    ON UPDATE no action;
  END IF;
END $$;

COMMIT;

-- Step 9: Create indexes (outside transaction for CONCURRENTLY support)
-- Note: These use IF NOT EXISTS which requires PostgreSQL 9.5+
-- For older versions, wrap in DO blocks with exception handling

-- Claims table indexes
CREATE UNIQUE INDEX IF NOT EXISTS "claims_claim_token_idx" ON "claims" USING btree ("claim_token");
CREATE INDEX IF NOT EXISTS "claims_listing_type_idx" ON "claims" USING btree ("listing_type");
CREATE INDEX IF NOT EXISTS "claims_claimant_profile_idx" ON "claims" USING btree ("claimant_profile_id");
CREATE INDEX IF NOT EXISTS "claims_status_idx" ON "claims" USING btree ("status");
CREATE INDEX IF NOT EXISTS "claims_reviewed_by_idx" ON "claims" USING btree ("reviewed_by_id");
CREATE INDEX IF NOT EXISTS "claims_updated_at_idx" ON "claims" USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "claims_created_at_idx" ON "claims" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "listingType_status_idx" ON "claims" USING btree ("listing_type", "status");

-- Claims rels table indexes
CREATE INDEX IF NOT EXISTS "claims_rels_order_idx" ON "claims_rels" USING btree ("order");
CREATE INDEX IF NOT EXISTS "claims_rels_parent_idx" ON "claims_rels" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "claims_rels_path_idx" ON "claims_rels" USING btree ("path");
CREATE INDEX IF NOT EXISTS "claims_rels_locations_id_idx" ON "claims_rels" USING btree ("locations_id");
CREATE INDEX IF NOT EXISTS "claims_rels_events_id_idx" ON "claims_rels" USING btree ("events_id");
CREATE INDEX IF NOT EXISTS "claims_rels_services_id_idx" ON "claims_rels" USING btree ("services_id");

-- Listing claim_status indexes
CREATE INDEX IF NOT EXISTS "events_claim_status_idx" ON "events" USING btree ("claim_status");
CREATE INDEX IF NOT EXISTS "_events_v_version_version_claim_status_idx" ON "_events_v" USING btree ("version_claim_status");
CREATE INDEX IF NOT EXISTS "locations_claim_status_idx" ON "locations" USING btree ("claim_status");
CREATE INDEX IF NOT EXISTS "_locations_v_version_version_claim_status_idx" ON "_locations_v" USING btree ("version_claim_status");
CREATE INDEX IF NOT EXISTS "services_claim_status_idx" ON "services" USING btree ("claim_status");
CREATE INDEX IF NOT EXISTS "_services_v_version_version_claim_status_idx" ON "_services_v" USING btree ("version_claim_status");

-- Payload locked documents rels index
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_claims_id_idx" ON "payload_locked_documents_rels" USING btree ("claims_id");

-- Step 10: Update all existing listings to have claim_status = 'claimed'
UPDATE "events" SET "claim_status" = 'claimed' WHERE "claim_status" IS NULL;
UPDATE "locations" SET "claim_status" = 'claimed' WHERE "claim_status" IS NULL;
UPDATE "services" SET "claim_status" = 'claimed' WHERE "claim_status" IS NULL;
