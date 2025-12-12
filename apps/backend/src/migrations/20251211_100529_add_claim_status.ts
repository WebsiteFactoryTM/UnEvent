import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_claims_listing_type" AS ENUM('locations', 'events', 'services');
  CREATE TYPE "public"."enum_claims_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_events_claim_status" AS ENUM('claimed', 'unclaimed');
  CREATE TYPE "public"."enum__events_v_version_claim_status" AS ENUM('claimed', 'unclaimed');
  CREATE TYPE "public"."enum_locations_claim_status" AS ENUM('claimed', 'unclaimed');
  CREATE TYPE "public"."enum__locations_v_version_claim_status" AS ENUM('claimed', 'unclaimed');
  CREATE TYPE "public"."enum_services_claim_status" AS ENUM('claimed', 'unclaimed');
  CREATE TYPE "public"."enum__services_v_version_claim_status" AS ENUM('claimed', 'unclaimed');
  CREATE TABLE "claims" (
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
  
  CREATE TABLE "claims_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locations_id" integer,
  	"events_id" integer,
  	"services_id" integer
  );
  
  ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-11T10:05:29.198Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-11T10:05:29.198Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-11T10:05:29.198Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-11T10:05:29.198Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-11T10:05:29.198Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-11T10:05:29.198Z';
  ALTER TABLE "events" ADD COLUMN "claim_status" "enum_events_claim_status" DEFAULT 'claimed';
  ALTER TABLE "_events_v" ADD COLUMN "version_claim_status" "enum__events_v_version_claim_status" DEFAULT 'claimed';
  ALTER TABLE "locations" ADD COLUMN "claim_status" "enum_locations_claim_status" DEFAULT 'claimed';
  ALTER TABLE "_locations_v" ADD COLUMN "version_claim_status" "enum__locations_v_version_claim_status" DEFAULT 'claimed';
  ALTER TABLE "services" ADD COLUMN "claim_status" "enum_services_claim_status" DEFAULT 'claimed';
  ALTER TABLE "_services_v" ADD COLUMN "version_claim_status" "enum__services_v_version_claim_status" DEFAULT 'claimed';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "claims_id" integer;
  ALTER TABLE "claims" ADD CONSTRAINT "claims_claimant_profile_id_profiles_id_fk" FOREIGN KEY ("claimant_profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claims" ADD CONSTRAINT "claims_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claims_rels" ADD CONSTRAINT "claims_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "claims_rels" ADD CONSTRAINT "claims_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "claims_rels" ADD CONSTRAINT "claims_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "claims_rels" ADD CONSTRAINT "claims_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "claims_listing_type_idx" ON "claims" USING btree ("listing_type");
  CREATE INDEX "claims_claimant_profile_idx" ON "claims" USING btree ("claimant_profile_id");
  CREATE UNIQUE INDEX "claims_claim_token_idx" ON "claims" USING btree ("claim_token");
  CREATE INDEX "claims_status_idx" ON "claims" USING btree ("status");
  CREATE INDEX "claims_reviewed_by_idx" ON "claims" USING btree ("reviewed_by_id");
  CREATE INDEX "claims_updated_at_idx" ON "claims" USING btree ("updated_at");
  CREATE INDEX "claims_created_at_idx" ON "claims" USING btree ("created_at");
  CREATE UNIQUE INDEX "claimToken_idx" ON "claims" USING btree ("claim_token");
  CREATE INDEX "claimantProfile_idx" ON "claims" USING btree ("claimant_profile_id");
  CREATE INDEX "status_idx" ON "claims" USING btree ("status");
  CREATE INDEX "listingType_idx" ON "claims" USING btree ("listing_type");
  CREATE INDEX "listingType_status_idx" ON "claims" USING btree ("listing_type","status");
  CREATE INDEX "claims_rels_order_idx" ON "claims_rels" USING btree ("order");
  CREATE INDEX "claims_rels_parent_idx" ON "claims_rels" USING btree ("parent_id");
  CREATE INDEX "claims_rels_path_idx" ON "claims_rels" USING btree ("path");
  CREATE INDEX "claims_rels_locations_id_idx" ON "claims_rels" USING btree ("locations_id");
  CREATE INDEX "claims_rels_events_id_idx" ON "claims_rels" USING btree ("events_id");
  CREATE INDEX "claims_rels_services_id_idx" ON "claims_rels" USING btree ("services_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_claims_fk" FOREIGN KEY ("claims_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_claim_status_idx" ON "events" USING btree ("claim_status");
  CREATE INDEX "_events_v_version_version_claim_status_idx" ON "_events_v" USING btree ("version_claim_status");
  CREATE INDEX "locations_claim_status_idx" ON "locations" USING btree ("claim_status");
  CREATE INDEX "_locations_v_version_version_claim_status_idx" ON "_locations_v" USING btree ("version_claim_status");
  CREATE INDEX "services_claim_status_idx" ON "services" USING btree ("claim_status");
  CREATE INDEX "_services_v_version_version_claim_status_idx" ON "_services_v" USING btree ("version_claim_status");
  CREATE INDEX "payload_locked_documents_rels_claims_id_idx" ON "payload_locked_documents_rels" USING btree ("claims_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "claims" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "claims_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "claims" CASCADE;
  DROP TABLE "claims_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_claims_fk";
  
  DROP INDEX "events_claim_status_idx";
  DROP INDEX "_events_v_version_version_claim_status_idx";
  DROP INDEX "locations_claim_status_idx";
  DROP INDEX "_locations_v_version_version_claim_status_idx";
  DROP INDEX "services_claim_status_idx";
  DROP INDEX "_services_v_version_version_claim_status_idx";
  DROP INDEX "payload_locked_documents_rels_claims_id_idx";
  ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-05T07:52:02.092Z';
  ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-05T07:52:02.092Z';
  ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-05T07:52:02.092Z';
  ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-05T07:52:02.092Z';
  ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-05T07:52:02.092Z';
  ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-05T07:52:02.092Z';
  ALTER TABLE "events" DROP COLUMN "claim_status";
  ALTER TABLE "_events_v" DROP COLUMN "version_claim_status";
  ALTER TABLE "locations" DROP COLUMN "claim_status";
  ALTER TABLE "_locations_v" DROP COLUMN "version_claim_status";
  ALTER TABLE "services" DROP COLUMN "claim_status";
  ALTER TABLE "_services_v" DROP COLUMN "version_claim_status";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "claims_id";
  DROP TYPE "public"."enum_claims_listing_type";
  DROP TYPE "public"."enum_claims_status";
  DROP TYPE "public"."enum_events_claim_status";
  DROP TYPE "public"."enum__events_v_version_claim_status";
  DROP TYPE "public"."enum_locations_claim_status";
  DROP TYPE "public"."enum__locations_v_version_claim_status";
  DROP TYPE "public"."enum_services_claim_status";
  DROP TYPE "public"."enum__services_v_version_claim_status";`)
}
