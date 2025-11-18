import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('organizer', 'host', 'provider', 'client', 'admin');
  CREATE TYPE "public"."enum_users_status" AS ENUM('active', 'pending', 'suspended');
  CREATE TYPE "public"."enum_media_context" AS ENUM('listing', 'avatar', 'event', 'document', 'verification');
  CREATE TYPE "public"."enum_profiles_user_type" AS ENUM('organizer', 'host', 'provider', 'client');
  CREATE TYPE "public"."enum_profiles_verified_status" AS ENUM('none', 'pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_verifications_documents_type" AS ENUM('id', 'company', 'other');
  CREATE TYPE "public"."enum_verifications_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_favorites_kind" AS ENUM('locations', 'events', 'services');
  CREATE TYPE "public"."enum_listing_types_type" AS ENUM('events', 'locations', 'services');
  CREATE TYPE "public"."enum_cities_source" AS ENUM('seeded', 'google', 'user');
  CREATE TYPE "public"."enum_events_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
  CREATE TYPE "public"."enum_events_verified_status" AS ENUM('none', 'pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_events_tier" AS ENUM('new', 'standard', 'sponsored', 'recommended');
  CREATE TYPE "public"."enum_events_event_status" AS ENUM('upcoming', 'in-progress', 'finished');
  CREATE TYPE "public"."enum_events_pricing_type" AS ENUM('free', 'paid', 'contact');
  CREATE TYPE "public"."enum_events_pricing_currency" AS ENUM('RON', 'EUR', 'USD');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
  CREATE TYPE "public"."enum__events_v_version_verified_status" AS ENUM('none', 'pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum__events_v_version_tier" AS ENUM('new', 'standard', 'sponsored', 'recommended');
  CREATE TYPE "public"."enum__events_v_version_event_status" AS ENUM('upcoming', 'in-progress', 'finished');
  CREATE TYPE "public"."enum__events_v_version_pricing_type" AS ENUM('free', 'paid', 'contact');
  CREATE TYPE "public"."enum__events_v_version_pricing_currency" AS ENUM('RON', 'EUR', 'USD');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_locations_availability_schedule_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_locations_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
  CREATE TYPE "public"."enum_locations_verified_status" AS ENUM('none', 'pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_locations_tier" AS ENUM('new', 'standard', 'sponsored', 'recommended');
  CREATE TYPE "public"."enum_locations_pricing_type" AS ENUM('fixed', 'from', 'contact');
  CREATE TYPE "public"."enum_locations_pricing_currency" AS ENUM('RON', 'EUR', 'USD');
  CREATE TYPE "public"."enum_locations_pricing_period" AS ENUM('hour', 'day', 'event');
  CREATE TYPE "public"."enum_locations_availability_type" AS ENUM('always', 'custom', 'appointment');
  CREATE TYPE "public"."enum_locations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__locations_v_version_availability_schedule_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum__locations_v_version_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
  CREATE TYPE "public"."enum__locations_v_version_verified_status" AS ENUM('none', 'pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum__locations_v_version_tier" AS ENUM('new', 'standard', 'sponsored', 'recommended');
  CREATE TYPE "public"."enum__locations_v_version_pricing_type" AS ENUM('fixed', 'from', 'contact');
  CREATE TYPE "public"."enum__locations_v_version_pricing_currency" AS ENUM('RON', 'EUR', 'USD');
  CREATE TYPE "public"."enum__locations_v_version_pricing_period" AS ENUM('hour', 'day', 'event');
  CREATE TYPE "public"."enum__locations_v_version_availability_type" AS ENUM('always', 'custom', 'appointment');
  CREATE TYPE "public"."enum__locations_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_services_availability_schedule_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_services_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
  CREATE TYPE "public"."enum_services_verified_status" AS ENUM('none', 'pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_services_tier" AS ENUM('new', 'standard', 'sponsored', 'recommended');
  CREATE TYPE "public"."enum_services_pricing_type" AS ENUM('fixed', 'from', 'contact');
  CREATE TYPE "public"."enum_services_pricing_currency" AS ENUM('RON', 'EUR', 'USD');
  CREATE TYPE "public"."enum_services_pricing_period" AS ENUM('hour', 'day', 'event');
  CREATE TYPE "public"."enum_services_availability_type" AS ENUM('always', 'custom', 'appointment');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_availability_schedule_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum__services_v_version_moderation_status" AS ENUM('pending', 'approved', 'rejected', 'draft');
  CREATE TYPE "public"."enum__services_v_version_verified_status" AS ENUM('none', 'pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum__services_v_version_tier" AS ENUM('new', 'standard', 'sponsored', 'recommended');
  CREATE TYPE "public"."enum__services_v_version_pricing_type" AS ENUM('fixed', 'from', 'contact');
  CREATE TYPE "public"."enum__services_v_version_pricing_currency" AS ENUM('RON', 'EUR', 'USD');
  CREATE TYPE "public"."enum__services_v_version_pricing_period" AS ENUM('hour', 'day', 'event');
  CREATE TYPE "public"."enum__services_v_version_availability_type" AS ENUM('always', 'custom', 'appointment');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_metrics_daily_kind" AS ENUM('locations', 'events', 'services');
  CREATE TYPE "public"."enum_aggregates_kind" AS ENUM('locations', 'events', 'services');
  CREATE TYPE "public"."enum_listing_rank_kind" AS ENUM('locations', 'events', 'services');
  CREATE TYPE "public"."enum_reviews_criteria_ratings_criteria" AS ENUM('cleanliness', 'location', 'amenities', 'organization', 'entertainment', 'value', 'quality', 'timeliness', 'communication');
  CREATE TYPE "public"."enum_reviews_listing_type" AS ENUM('locations', 'events', 'services');
  CREATE TYPE "public"."enum_reviews_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_hub_snapshots_listing_type" AS ENUM('locations', 'services', 'events');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar,
  	"profile_id" integer,
  	"avatar_u_r_l" varchar,
  	"status" "enum_users_status" DEFAULT 'active',
  	"agree_terms_and_conditions" boolean DEFAULT false NOT NULL,
  	"agree_privacy_policy" boolean DEFAULT false NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"context" "enum_media_context" NOT NULL,
  	"uploaded_by_id" integer,
  	"temp" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "profiles_user_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_profiles_user_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"slug" varchar,
  	"name" varchar NOT NULL,
  	"avatar_id" integer,
  	"verified_status" "enum_profiles_verified_status" DEFAULT 'none',
  	"verification_id" integer,
  	"display_name" varchar,
  	"bio" varchar,
  	"phone" varchar,
  	"website" varchar,
  	"city" varchar,
  	"social_media_facebook" varchar,
  	"social_media_instagram" varchar,
  	"social_media_linkedin" varchar,
  	"social_media_youtube" varchar,
  	"social_media_tiktok" varchar,
  	"social_media_twitch" varchar,
  	"social_media_x" varchar,
  	"rating_average" numeric,
  	"rating_count" numeric,
  	"member_since" timestamp(3) with time zone,
  	"last_online" timestamp(3) with time zone,
  	"views" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "profiles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"favorites_id" integer
  );
  
  CREATE TABLE "verifications_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_verifications_documents_type",
  	"file_id" integer NOT NULL,
  	"notes" varchar
  );
  
  CREATE TABLE "verifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_verifications_status" DEFAULT 'pending',
  	"verification_data_full_name" varchar,
  	"verification_data_address" varchar,
  	"verification_data_is_company" boolean,
  	"verification_data_company_name" varchar,
  	"verification_data_cui" varchar,
  	"verification_data_company_address" varchar,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "verifications_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"profiles_id" integer,
  	"events_id" integer,
  	"locations_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "favorites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"kind" "enum_favorites_kind" NOT NULL,
  	"target_key" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "favorites_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locations_id" integer,
  	"events_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "listing_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"title" varchar NOT NULL,
  	"category" varchar NOT NULL,
  	"category_slug" varchar,
  	"type" "enum_listing_types_type" NOT NULL,
  	"sort_order" numeric DEFAULT 0 NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"usage_count" numeric DEFAULT 0,
  	"usage_count_public" numeric DEFAULT 0,
  	"usage_updated_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"country" varchar DEFAULT 'Romania',
  	"county" varchar DEFAULT 'Romania',
  	"source" "enum_cities_source" DEFAULT 'seeded',
  	"geo" geometry(Point) NOT NULL,
  	"image_id" integer,
  	"usage_count" numeric DEFAULT 0,
  	"verified" boolean DEFAULT false,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "events_youtube_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"youtube_link" varchar
  );
  
  CREATE TABLE "events_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"requirement" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"owner_id" integer,
  	"description" varchar,
  	"city_id" integer,
  	"address" varchar,
  	"geo" geometry(Point),
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"contact_website" varchar,
  	"moderation_status" "enum_events_moderation_status" DEFAULT 'pending',
  	"rejection_reason" varchar,
  	"featured_image_id" integer,
  	"verified_status" "enum_events_verified_status" DEFAULT 'none',
  	"verification_id" integer,
  	"views" numeric DEFAULT 0,
  	"favorites_count" numeric DEFAULT 0,
  	"bookings_count" numeric DEFAULT 0,
  	"rating" numeric DEFAULT 0,
  	"review_count" numeric DEFAULT 0,
  	"last_viewed_at" timestamp(3) with time zone DEFAULT '2025-11-18T19:12:04.016Z',
  	"tier" "enum_events_tier",
  	"social_links_facebook" varchar,
  	"social_links_instagram" varchar,
  	"social_links_linkedin" varchar,
  	"social_links_youtube" varchar,
  	"social_links_tiktok" varchar,
  	"social_links_twitch" varchar,
  	"social_links_x" varchar,
  	"is_favorited_by_viewer" boolean DEFAULT false,
  	"has_reviewed_by_viewer" boolean DEFAULT false,
  	"event_status" "enum_events_event_status" DEFAULT 'upcoming',
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"all_day_event" boolean DEFAULT false,
  	"capacity_total" numeric,
  	"capacity_remaining" numeric,
  	"pricing_type" "enum_events_pricing_type" DEFAULT 'free',
  	"pricing_amount" numeric,
  	"pricing_currency" "enum_events_pricing_currency" DEFAULT 'RON',
  	"registration_deadline" timestamp(3) with time zone,
  	"participants" numeric DEFAULT 0,
  	"venue_id" integer,
  	"venue_address_details_venue_address" varchar,
  	"venue_address_details_venue_city_id" integer,
  	"venue_address_details_venue_geo" geometry(Point),
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"listing_types_id" integer
  );
  
  CREATE TABLE "_events_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_version_youtube_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"youtube_link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_version_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"requirement" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_owner_id" integer,
  	"version_description" varchar,
  	"version_city_id" integer,
  	"version_address" varchar,
  	"version_geo" geometry(Point),
  	"version_contact_email" varchar,
  	"version_contact_phone" varchar,
  	"version_contact_website" varchar,
  	"version_moderation_status" "enum__events_v_version_moderation_status" DEFAULT 'pending',
  	"version_rejection_reason" varchar,
  	"version_featured_image_id" integer,
  	"version_verified_status" "enum__events_v_version_verified_status" DEFAULT 'none',
  	"version_verification_id" integer,
  	"version_views" numeric DEFAULT 0,
  	"version_favorites_count" numeric DEFAULT 0,
  	"version_bookings_count" numeric DEFAULT 0,
  	"version_rating" numeric DEFAULT 0,
  	"version_review_count" numeric DEFAULT 0,
  	"version_last_viewed_at" timestamp(3) with time zone DEFAULT '2025-11-18T19:12:04.016Z',
  	"version_tier" "enum__events_v_version_tier",
  	"version_social_links_facebook" varchar,
  	"version_social_links_instagram" varchar,
  	"version_social_links_linkedin" varchar,
  	"version_social_links_youtube" varchar,
  	"version_social_links_tiktok" varchar,
  	"version_social_links_twitch" varchar,
  	"version_social_links_x" varchar,
  	"version_is_favorited_by_viewer" boolean DEFAULT false,
  	"version_has_reviewed_by_viewer" boolean DEFAULT false,
  	"version_event_status" "enum__events_v_version_event_status" DEFAULT 'upcoming',
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_all_day_event" boolean DEFAULT false,
  	"version_capacity_total" numeric,
  	"version_capacity_remaining" numeric,
  	"version_pricing_type" "enum__events_v_version_pricing_type" DEFAULT 'free',
  	"version_pricing_amount" numeric,
  	"version_pricing_currency" "enum__events_v_version_pricing_currency" DEFAULT 'RON',
  	"version_registration_deadline" timestamp(3) with time zone,
  	"version_participants" numeric DEFAULT 0,
  	"version_venue_id" integer,
  	"version_venue_address_details_venue_address" varchar,
  	"version_venue_address_details_venue_city_id" integer,
  	"version_venue_address_details_venue_geo" geometry(Point),
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"listing_types_id" integer
  );
  
  CREATE TABLE "locations_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "locations_youtube_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"youtube_link" varchar
  );
  
  CREATE TABLE "locations_availability_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_locations_availability_schedule_day",
  	"start_time" varchar,
  	"end_time" varchar
  );
  
  CREATE TABLE "locations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"owner_id" integer,
  	"description" varchar,
  	"city_id" integer,
  	"address" varchar,
  	"geo" geometry(Point),
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"contact_website" varchar,
  	"moderation_status" "enum_locations_moderation_status" DEFAULT 'pending',
  	"rejection_reason" varchar,
  	"featured_image_id" integer,
  	"verified_status" "enum_locations_verified_status" DEFAULT 'none',
  	"verification_id" integer,
  	"views" numeric DEFAULT 0,
  	"favorites_count" numeric DEFAULT 0,
  	"bookings_count" numeric DEFAULT 0,
  	"rating" numeric DEFAULT 0,
  	"review_count" numeric DEFAULT 0,
  	"last_viewed_at" timestamp(3) with time zone DEFAULT '2025-11-18T19:12:04.016Z',
  	"tier" "enum_locations_tier",
  	"social_links_facebook" varchar,
  	"social_links_instagram" varchar,
  	"social_links_linkedin" varchar,
  	"social_links_youtube" varchar,
  	"social_links_tiktok" varchar,
  	"social_links_twitch" varchar,
  	"social_links_x" varchar,
  	"is_favorited_by_viewer" boolean DEFAULT false,
  	"has_reviewed_by_viewer" boolean DEFAULT false,
  	"capacity_indoor" numeric,
  	"capacity_outdoor" numeric,
  	"capacity_seating" numeric,
  	"capacity_parking" numeric,
  	"surface" numeric,
  	"pricing_type" "enum_locations_pricing_type" DEFAULT 'contact',
  	"pricing_amount" numeric,
  	"pricing_currency" "enum_locations_pricing_currency" DEFAULT 'RON',
  	"pricing_period" "enum_locations_pricing_period" DEFAULT 'day',
  	"availability_type" "enum_locations_availability_type" DEFAULT 'always',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_locations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "locations_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"listing_types_id" integer,
  	"facilities_id" integer
  );
  
  CREATE TABLE "_locations_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_locations_v_version_youtube_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"youtube_link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_locations_v_version_availability_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"day" "enum__locations_v_version_availability_schedule_day",
  	"start_time" varchar,
  	"end_time" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_locations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_owner_id" integer,
  	"version_description" varchar,
  	"version_city_id" integer,
  	"version_address" varchar,
  	"version_geo" geometry(Point),
  	"version_contact_email" varchar,
  	"version_contact_phone" varchar,
  	"version_contact_website" varchar,
  	"version_moderation_status" "enum__locations_v_version_moderation_status" DEFAULT 'pending',
  	"version_rejection_reason" varchar,
  	"version_featured_image_id" integer,
  	"version_verified_status" "enum__locations_v_version_verified_status" DEFAULT 'none',
  	"version_verification_id" integer,
  	"version_views" numeric DEFAULT 0,
  	"version_favorites_count" numeric DEFAULT 0,
  	"version_bookings_count" numeric DEFAULT 0,
  	"version_rating" numeric DEFAULT 0,
  	"version_review_count" numeric DEFAULT 0,
  	"version_last_viewed_at" timestamp(3) with time zone DEFAULT '2025-11-18T19:12:04.016Z',
  	"version_tier" "enum__locations_v_version_tier",
  	"version_social_links_facebook" varchar,
  	"version_social_links_instagram" varchar,
  	"version_social_links_linkedin" varchar,
  	"version_social_links_youtube" varchar,
  	"version_social_links_tiktok" varchar,
  	"version_social_links_twitch" varchar,
  	"version_social_links_x" varchar,
  	"version_is_favorited_by_viewer" boolean DEFAULT false,
  	"version_has_reviewed_by_viewer" boolean DEFAULT false,
  	"version_capacity_indoor" numeric,
  	"version_capacity_outdoor" numeric,
  	"version_capacity_seating" numeric,
  	"version_capacity_parking" numeric,
  	"version_surface" numeric,
  	"version_pricing_type" "enum__locations_v_version_pricing_type" DEFAULT 'contact',
  	"version_pricing_amount" numeric,
  	"version_pricing_currency" "enum__locations_v_version_pricing_currency" DEFAULT 'RON',
  	"version_pricing_period" "enum__locations_v_version_pricing_period" DEFAULT 'day',
  	"version_availability_type" "enum__locations_v_version_availability_type" DEFAULT 'always',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__locations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_locations_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"listing_types_id" integer,
  	"facilities_id" integer
  );
  
  CREATE TABLE "services_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "services_youtube_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"youtube_link" varchar
  );
  
  CREATE TABLE "services_availability_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_services_availability_schedule_day",
  	"start_time" varchar,
  	"end_time" varchar
  );
  
  CREATE TABLE "services_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"owner_id" integer,
  	"description" varchar,
  	"city_id" integer,
  	"address" varchar,
  	"geo" geometry(Point),
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"contact_website" varchar,
  	"moderation_status" "enum_services_moderation_status" DEFAULT 'pending',
  	"rejection_reason" varchar,
  	"featured_image_id" integer,
  	"verified_status" "enum_services_verified_status" DEFAULT 'none',
  	"verification_id" integer,
  	"views" numeric DEFAULT 0,
  	"favorites_count" numeric DEFAULT 0,
  	"bookings_count" numeric DEFAULT 0,
  	"rating" numeric DEFAULT 0,
  	"review_count" numeric DEFAULT 0,
  	"last_viewed_at" timestamp(3) with time zone DEFAULT '2025-11-18T19:12:04.016Z',
  	"tier" "enum_services_tier",
  	"social_links_facebook" varchar,
  	"social_links_instagram" varchar,
  	"social_links_linkedin" varchar,
  	"social_links_youtube" varchar,
  	"social_links_tiktok" varchar,
  	"social_links_twitch" varchar,
  	"social_links_x" varchar,
  	"is_favorited_by_viewer" boolean DEFAULT false,
  	"has_reviewed_by_viewer" boolean DEFAULT false,
  	"pricing_type" "enum_services_pricing_type" DEFAULT 'contact',
  	"pricing_amount" numeric,
  	"pricing_currency" "enum_services_pricing_currency" DEFAULT 'RON',
  	"pricing_period" "enum_services_pricing_period" DEFAULT 'day',
  	"availability_type" "enum_services_availability_type" DEFAULT 'always',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"listing_types_id" integer
  );
  
  CREATE TABLE "_services_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_youtube_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"youtube_link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_availability_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"day" "enum__services_v_version_availability_schedule_day",
  	"start_time" varchar,
  	"end_time" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_owner_id" integer,
  	"version_description" varchar,
  	"version_city_id" integer,
  	"version_address" varchar,
  	"version_geo" geometry(Point),
  	"version_contact_email" varchar,
  	"version_contact_phone" varchar,
  	"version_contact_website" varchar,
  	"version_moderation_status" "enum__services_v_version_moderation_status" DEFAULT 'pending',
  	"version_rejection_reason" varchar,
  	"version_featured_image_id" integer,
  	"version_verified_status" "enum__services_v_version_verified_status" DEFAULT 'none',
  	"version_verification_id" integer,
  	"version_views" numeric DEFAULT 0,
  	"version_favorites_count" numeric DEFAULT 0,
  	"version_bookings_count" numeric DEFAULT 0,
  	"version_rating" numeric DEFAULT 0,
  	"version_review_count" numeric DEFAULT 0,
  	"version_last_viewed_at" timestamp(3) with time zone DEFAULT '2025-11-18T19:12:04.016Z',
  	"version_tier" "enum__services_v_version_tier",
  	"version_social_links_facebook" varchar,
  	"version_social_links_instagram" varchar,
  	"version_social_links_linkedin" varchar,
  	"version_social_links_youtube" varchar,
  	"version_social_links_tiktok" varchar,
  	"version_social_links_twitch" varchar,
  	"version_social_links_x" varchar,
  	"version_is_favorited_by_viewer" boolean DEFAULT false,
  	"version_has_reviewed_by_viewer" boolean DEFAULT false,
  	"version_pricing_type" "enum__services_v_version_pricing_type" DEFAULT 'contact',
  	"version_pricing_amount" numeric,
  	"version_pricing_currency" "enum__services_v_version_pricing_currency" DEFAULT 'RON',
  	"version_pricing_period" "enum__services_v_version_pricing_period" DEFAULT 'day',
  	"version_availability_type" "enum__services_v_version_availability_type" DEFAULT 'always',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_services_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"listing_types_id" integer
  );
  
  CREATE TABLE "facilities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"title" varchar NOT NULL,
  	"category" varchar NOT NULL,
  	"category_slug" varchar,
  	"sort_order" numeric DEFAULT 0 NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "metrics_daily" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_metrics_daily_kind" NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"views" numeric DEFAULT 0,
  	"favorites" numeric DEFAULT 0,
  	"bookings" numeric DEFAULT 0
  );
  
  CREATE TABLE "metrics_daily_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locations_id" integer,
  	"events_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "aggregates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_aggregates_kind" NOT NULL,
  	"views7d" numeric DEFAULT 0,
  	"views30d" numeric DEFAULT 0,
  	"bookings7d" numeric DEFAULT 0,
  	"bookings30d" numeric DEFAULT 0,
  	"favorites" numeric DEFAULT 0,
  	"reviews_count" numeric DEFAULT 0,
  	"avg_rating" numeric DEFAULT 0,
  	"bayes_rating" numeric DEFAULT 0
  );
  
  CREATE TABLE "aggregates_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locations_id" integer,
  	"events_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "listing_rank" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_listing_rank_kind" NOT NULL,
  	"segment_key" varchar NOT NULL,
  	"score" numeric NOT NULL,
  	"calculated_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "listing_rank_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locations_id" integer,
  	"events_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "reviews_criteria_ratings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"criteria" "enum_reviews_criteria_ratings_criteria" NOT NULL,
  	"rating" numeric NOT NULL
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"listing_type" "enum_reviews_listing_type" NOT NULL,
  	"user_id" integer NOT NULL,
  	"status" "enum_reviews_status" DEFAULT 'pending',
  	"rejection_reason" varchar,
  	"comment" varchar,
  	"rating" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locations_id" integer,
  	"events_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "hub_snapshots_typeahead_cities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "hub_snapshots_top_cities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "hub_snapshots_top_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "hub_snapshots_popular_city_rows_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"listing_id" numeric NOT NULL,
  	"slug" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"city_label" varchar,
  	"image_url" varchar,
  	"verified" boolean DEFAULT false,
  	"rating_avg" numeric,
  	"rating_count" numeric,
  	"description" varchar,
  	"type" varchar,
  	"capacity" numeric,
  	"start_date" timestamp(3) with time zone
  );
  
  CREATE TABLE "hub_snapshots_popular_city_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"city_slug" varchar NOT NULL,
  	"city_label" varchar NOT NULL
  );
  
  CREATE TABLE "hub_snapshots_featured" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"listing_id" numeric NOT NULL,
  	"slug" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"city_label" varchar,
  	"image_url" varchar,
  	"verified" boolean DEFAULT false,
  	"rating_avg" numeric,
  	"rating_count" numeric,
  	"description" varchar,
  	"type" varchar,
  	"capacity" numeric,
  	"start_date" timestamp(3) with time zone
  );
  
  CREATE TABLE "hub_snapshots_popular_search_combos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"city_slug" varchar NOT NULL,
  	"city_label" varchar NOT NULL,
  	"type_slug" varchar NOT NULL,
  	"type_label" varchar NOT NULL
  );
  
  CREATE TABLE "hub_snapshots" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"listing_type" "enum_hub_snapshots_listing_type" NOT NULL,
  	"generated_at" timestamp(3) with time zone NOT NULL,
  	"algo_version" varchar DEFAULT 'v1' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"priority" numeric,
  	"description" varchar,
  	"address" varchar,
  	"type" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locations_id" integer,
  	"services_id" integer,
  	"events_id" integer,
  	"profiles_id" integer
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"profiles_id" integer,
  	"verifications_id" integer,
  	"favorites_id" integer,
  	"listing_types_id" integer,
  	"cities_id" integer,
  	"events_id" integer,
  	"locations_id" integer,
  	"services_id" integer,
  	"facilities_id" integer,
  	"metrics_daily_id" integer,
  	"aggregates_id" integer,
  	"listing_rank_id" integer,
  	"reviews_id" integer,
  	"hub_snapshots_id" integer,
  	"search_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_listings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_listings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locations_id" integer,
  	"services_id" integer,
  	"events_id" integer
  );
  
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_profiles_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "profiles_user_type" ADD CONSTRAINT "profiles_user_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "profiles" ADD CONSTRAINT "profiles_verification_id_verifications_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."verifications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "profiles_rels" ADD CONSTRAINT "profiles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profiles_rels" ADD CONSTRAINT "profiles_rels_favorites_fk" FOREIGN KEY ("favorites_id") REFERENCES "public"."favorites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "verifications_documents" ADD CONSTRAINT "verifications_documents_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "verifications_documents" ADD CONSTRAINT "verifications_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."verifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "verifications" ADD CONSTRAINT "verifications_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "verifications_rels" ADD CONSTRAINT "verifications_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."verifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "verifications_rels" ADD CONSTRAINT "verifications_rels_profiles_fk" FOREIGN KEY ("profiles_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "verifications_rels" ADD CONSTRAINT "verifications_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "verifications_rels" ADD CONSTRAINT "verifications_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "verifications_rels" ADD CONSTRAINT "verifications_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "favorites_rels" ADD CONSTRAINT "favorites_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."favorites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "favorites_rels" ADD CONSTRAINT "favorites_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "favorites_rels" ADD CONSTRAINT "favorites_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "favorites_rels" ADD CONSTRAINT "favorites_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cities" ADD CONSTRAINT "cities_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_tags" ADD CONSTRAINT "events_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_youtube_links" ADD CONSTRAINT "events_youtube_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_requirements" ADD CONSTRAINT "events_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_verification_id_verifications_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."verifications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_venue_id_locations_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_venue_address_details_venue_city_id_cities_id_fk" FOREIGN KEY ("venue_address_details_venue_city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_listing_types_fk" FOREIGN KEY ("listing_types_id") REFERENCES "public"."listing_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_tags" ADD CONSTRAINT "_events_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_youtube_links" ADD CONSTRAINT "_events_v_version_youtube_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_requirements" ADD CONSTRAINT "_events_v_version_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_owner_id_profiles_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_city_id_cities_id_fk" FOREIGN KEY ("version_city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_verification_id_verifications_id_fk" FOREIGN KEY ("version_verification_id") REFERENCES "public"."verifications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_venue_id_locations_id_fk" FOREIGN KEY ("version_venue_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_venue_address_details_venue_city_id_cities_id_fk" FOREIGN KEY ("version_venue_address_details_venue_city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_listing_types_fk" FOREIGN KEY ("listing_types_id") REFERENCES "public"."listing_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations_tags" ADD CONSTRAINT "locations_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations_youtube_links" ADD CONSTRAINT "locations_youtube_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations_availability_schedule" ADD CONSTRAINT "locations_availability_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations" ADD CONSTRAINT "locations_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "locations" ADD CONSTRAINT "locations_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "locations" ADD CONSTRAINT "locations_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "locations" ADD CONSTRAINT "locations_verification_id_verifications_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."verifications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "locations_rels" ADD CONSTRAINT "locations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations_rels" ADD CONSTRAINT "locations_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations_rels" ADD CONSTRAINT "locations_rels_listing_types_fk" FOREIGN KEY ("listing_types_id") REFERENCES "public"."listing_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations_rels" ADD CONSTRAINT "locations_rels_facilities_fk" FOREIGN KEY ("facilities_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_locations_v_version_tags" ADD CONSTRAINT "_locations_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_locations_v_version_youtube_links" ADD CONSTRAINT "_locations_v_version_youtube_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_locations_v_version_availability_schedule" ADD CONSTRAINT "_locations_v_version_availability_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_locations_v" ADD CONSTRAINT "_locations_v_parent_id_locations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_locations_v" ADD CONSTRAINT "_locations_v_version_owner_id_profiles_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_locations_v" ADD CONSTRAINT "_locations_v_version_city_id_cities_id_fk" FOREIGN KEY ("version_city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_locations_v" ADD CONSTRAINT "_locations_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_locations_v" ADD CONSTRAINT "_locations_v_version_verification_id_verifications_id_fk" FOREIGN KEY ("version_verification_id") REFERENCES "public"."verifications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_locations_v_rels" ADD CONSTRAINT "_locations_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_locations_v_rels" ADD CONSTRAINT "_locations_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_locations_v_rels" ADD CONSTRAINT "_locations_v_rels_listing_types_fk" FOREIGN KEY ("listing_types_id") REFERENCES "public"."listing_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_locations_v_rels" ADD CONSTRAINT "_locations_v_rels_facilities_fk" FOREIGN KEY ("facilities_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_tags" ADD CONSTRAINT "services_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_youtube_links" ADD CONSTRAINT "services_youtube_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_availability_schedule" ADD CONSTRAINT "services_availability_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_features" ADD CONSTRAINT "services_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_verification_id_verifications_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."verifications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_listing_types_fk" FOREIGN KEY ("listing_types_id") REFERENCES "public"."listing_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_tags" ADD CONSTRAINT "_services_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_youtube_links" ADD CONSTRAINT "_services_v_version_youtube_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_availability_schedule" ADD CONSTRAINT "_services_v_version_availability_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_features" ADD CONSTRAINT "_services_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_owner_id_profiles_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_city_id_cities_id_fk" FOREIGN KEY ("version_city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_verification_id_verifications_id_fk" FOREIGN KEY ("version_verification_id") REFERENCES "public"."verifications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_listing_types_fk" FOREIGN KEY ("listing_types_id") REFERENCES "public"."listing_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "metrics_daily_rels" ADD CONSTRAINT "metrics_daily_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."metrics_daily"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "metrics_daily_rels" ADD CONSTRAINT "metrics_daily_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "metrics_daily_rels" ADD CONSTRAINT "metrics_daily_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "metrics_daily_rels" ADD CONSTRAINT "metrics_daily_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "aggregates_rels" ADD CONSTRAINT "aggregates_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."aggregates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "aggregates_rels" ADD CONSTRAINT "aggregates_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "aggregates_rels" ADD CONSTRAINT "aggregates_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "aggregates_rels" ADD CONSTRAINT "aggregates_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listing_rank_rels" ADD CONSTRAINT "listing_rank_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."listing_rank"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listing_rank_rels" ADD CONSTRAINT "listing_rank_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listing_rank_rels" ADD CONSTRAINT "listing_rank_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listing_rank_rels" ADD CONSTRAINT "listing_rank_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_criteria_ratings" ADD CONSTRAINT "reviews_criteria_ratings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hub_snapshots_typeahead_cities" ADD CONSTRAINT "hub_snapshots_typeahead_cities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hub_snapshots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hub_snapshots_top_cities" ADD CONSTRAINT "hub_snapshots_top_cities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hub_snapshots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hub_snapshots_top_types" ADD CONSTRAINT "hub_snapshots_top_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hub_snapshots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hub_snapshots_popular_city_rows_items" ADD CONSTRAINT "hub_snapshots_popular_city_rows_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hub_snapshots_popular_city_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hub_snapshots_popular_city_rows" ADD CONSTRAINT "hub_snapshots_popular_city_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hub_snapshots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hub_snapshots_featured" ADD CONSTRAINT "hub_snapshots_featured_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hub_snapshots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hub_snapshots_popular_search_combos" ADD CONSTRAINT "hub_snapshots_popular_search_combos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hub_snapshots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_profiles_fk" FOREIGN KEY ("profiles_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_profiles_fk" FOREIGN KEY ("profiles_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_verifications_fk" FOREIGN KEY ("verifications_id") REFERENCES "public"."verifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_favorites_fk" FOREIGN KEY ("favorites_id") REFERENCES "public"."favorites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_listing_types_fk" FOREIGN KEY ("listing_types_id") REFERENCES "public"."listing_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cities_fk" FOREIGN KEY ("cities_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_facilities_fk" FOREIGN KEY ("facilities_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_metrics_daily_fk" FOREIGN KEY ("metrics_daily_id") REFERENCES "public"."metrics_daily"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_aggregates_fk" FOREIGN KEY ("aggregates_id") REFERENCES "public"."aggregates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_listing_rank_fk" FOREIGN KEY ("listing_rank_id") REFERENCES "public"."listing_rank"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hub_snapshots_fk" FOREIGN KEY ("hub_snapshots_id") REFERENCES "public"."hub_snapshots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_listings_rels" ADD CONSTRAINT "home_listings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home_listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_listings_rels" ADD CONSTRAINT "home_listings_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_listings_rels" ADD CONSTRAINT "home_listings_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_listings_rels" ADD CONSTRAINT "home_listings_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_profile_idx" ON "users" USING btree ("profile_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_uploaded_by_idx" ON "media" USING btree ("uploaded_by_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "profiles_user_type_order_idx" ON "profiles_user_type" USING btree ("order");
  CREATE INDEX "profiles_user_type_parent_idx" ON "profiles_user_type" USING btree ("parent_id");
  CREATE INDEX "profiles_user_idx" ON "profiles" USING btree ("user_id");
  CREATE UNIQUE INDEX "profiles_slug_idx" ON "profiles" USING btree ("slug");
  CREATE INDEX "profiles_avatar_idx" ON "profiles" USING btree ("avatar_id");
  CREATE INDEX "profiles_verified_status_idx" ON "profiles" USING btree ("verified_status");
  CREATE INDEX "profiles_verification_idx" ON "profiles" USING btree ("verification_id");
  CREATE INDEX "profiles_updated_at_idx" ON "profiles" USING btree ("updated_at");
  CREATE INDEX "profiles_created_at_idx" ON "profiles" USING btree ("created_at");
  CREATE INDEX "profiles_rels_order_idx" ON "profiles_rels" USING btree ("order");
  CREATE INDEX "profiles_rels_parent_idx" ON "profiles_rels" USING btree ("parent_id");
  CREATE INDEX "profiles_rels_path_idx" ON "profiles_rels" USING btree ("path");
  CREATE INDEX "profiles_rels_favorites_id_idx" ON "profiles_rels" USING btree ("favorites_id");
  CREATE INDEX "verifications_documents_order_idx" ON "verifications_documents" USING btree ("_order");
  CREATE INDEX "verifications_documents_parent_id_idx" ON "verifications_documents" USING btree ("_parent_id");
  CREATE INDEX "verifications_documents_file_idx" ON "verifications_documents" USING btree ("file_id");
  CREATE INDEX "verifications_status_idx" ON "verifications" USING btree ("status");
  CREATE INDEX "verifications_reviewed_by_idx" ON "verifications" USING btree ("reviewed_by_id");
  CREATE INDEX "verifications_updated_at_idx" ON "verifications" USING btree ("updated_at");
  CREATE INDEX "verifications_created_at_idx" ON "verifications" USING btree ("created_at");
  CREATE INDEX "verifications_rels_order_idx" ON "verifications_rels" USING btree ("order");
  CREATE INDEX "verifications_rels_parent_idx" ON "verifications_rels" USING btree ("parent_id");
  CREATE INDEX "verifications_rels_path_idx" ON "verifications_rels" USING btree ("path");
  CREATE INDEX "verifications_rels_profiles_id_idx" ON "verifications_rels" USING btree ("profiles_id");
  CREATE INDEX "verifications_rels_events_id_idx" ON "verifications_rels" USING btree ("events_id");
  CREATE INDEX "verifications_rels_locations_id_idx" ON "verifications_rels" USING btree ("locations_id");
  CREATE INDEX "verifications_rels_services_id_idx" ON "verifications_rels" USING btree ("services_id");
  CREATE INDEX "favorites_user_idx" ON "favorites" USING btree ("user_id");
  CREATE INDEX "favorites_kind_idx" ON "favorites" USING btree ("kind");
  CREATE INDEX "favorites_target_key_idx" ON "favorites" USING btree ("target_key");
  CREATE INDEX "favorites_updated_at_idx" ON "favorites" USING btree ("updated_at");
  CREATE INDEX "favorites_created_at_idx" ON "favorites" USING btree ("created_at");
  CREATE UNIQUE INDEX "user_targetKey_idx" ON "favorites" USING btree ("user_id","target_key");
  CREATE INDEX "kind_idx" ON "favorites" USING btree ("kind");
  CREATE INDEX "favorites_rels_order_idx" ON "favorites_rels" USING btree ("order");
  CREATE INDEX "favorites_rels_parent_idx" ON "favorites_rels" USING btree ("parent_id");
  CREATE INDEX "favorites_rels_path_idx" ON "favorites_rels" USING btree ("path");
  CREATE INDEX "favorites_rels_locations_id_idx" ON "favorites_rels" USING btree ("locations_id");
  CREATE INDEX "favorites_rels_events_id_idx" ON "favorites_rels" USING btree ("events_id");
  CREATE INDEX "favorites_rels_services_id_idx" ON "favorites_rels" USING btree ("services_id");
  CREATE INDEX "listing_types_slug_idx" ON "listing_types" USING btree ("slug");
  CREATE INDEX "listing_types_usage_count_idx" ON "listing_types" USING btree ("usage_count");
  CREATE INDEX "listing_types_usage_count_public_idx" ON "listing_types" USING btree ("usage_count_public");
  CREATE INDEX "listing_types_updated_at_idx" ON "listing_types" USING btree ("updated_at");
  CREATE INDEX "listing_types_created_at_idx" ON "listing_types" USING btree ("created_at");
  CREATE INDEX "cities_name_idx" ON "cities" USING btree ("name");
  CREATE UNIQUE INDEX "cities_slug_idx" ON "cities" USING btree ("slug");
  CREATE INDEX "cities_county_idx" ON "cities" USING btree ("county");
  CREATE INDEX "cities_image_idx" ON "cities" USING btree ("image_id");
  CREATE INDEX "cities_updated_at_idx" ON "cities" USING btree ("updated_at");
  CREATE INDEX "cities_created_at_idx" ON "cities" USING btree ("created_at");
  CREATE INDEX "events_tags_order_idx" ON "events_tags" USING btree ("_order");
  CREATE INDEX "events_tags_parent_id_idx" ON "events_tags" USING btree ("_parent_id");
  CREATE INDEX "events_youtube_links_order_idx" ON "events_youtube_links" USING btree ("_order");
  CREATE INDEX "events_youtube_links_parent_id_idx" ON "events_youtube_links" USING btree ("_parent_id");
  CREATE INDEX "events_requirements_order_idx" ON "events_requirements" USING btree ("_order");
  CREATE INDEX "events_requirements_parent_id_idx" ON "events_requirements" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_owner_idx" ON "events" USING btree ("owner_id");
  CREATE INDEX "events_city_idx" ON "events" USING btree ("city_id");
  CREATE INDEX "events_geo_idx" ON "events" USING btree ("geo");
  CREATE INDEX "events_moderation_status_idx" ON "events" USING btree ("moderation_status");
  CREATE INDEX "events_featured_image_idx" ON "events" USING btree ("featured_image_id");
  CREATE INDEX "events_verified_status_idx" ON "events" USING btree ("verified_status");
  CREATE INDEX "events_verification_idx" ON "events" USING btree ("verification_id");
  CREATE INDEX "events_rating_idx" ON "events" USING btree ("rating");
  CREATE INDEX "events_tier_idx" ON "events" USING btree ("tier");
  CREATE INDEX "events_event_status_idx" ON "events" USING btree ("event_status");
  CREATE INDEX "events_start_date_idx" ON "events" USING btree ("start_date");
  CREATE INDEX "events_end_date_idx" ON "events" USING btree ("end_date");
  CREATE INDEX "events_pricing_pricing_amount_idx" ON "events" USING btree ("pricing_amount");
  CREATE INDEX "events_venue_idx" ON "events" USING btree ("venue_id");
  CREATE INDEX "events_venue_address_details_venue_address_details_venue_idx" ON "events" USING btree ("venue_address_details_venue_city_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_media_id_idx" ON "events_rels" USING btree ("media_id");
  CREATE INDEX "events_rels_listing_types_id_idx" ON "events_rels" USING btree ("listing_types_id");
  CREATE INDEX "events_rels_type_composite_idx" ON "events_rels" USING btree ("listing_types_id","parent_id") WHERE path = 'type';
  CREATE INDEX "_events_v_version_tags_order_idx" ON "_events_v_version_tags" USING btree ("_order");
  CREATE INDEX "_events_v_version_tags_parent_id_idx" ON "_events_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_events_v_version_youtube_links_order_idx" ON "_events_v_version_youtube_links" USING btree ("_order");
  CREATE INDEX "_events_v_version_youtube_links_parent_id_idx" ON "_events_v_version_youtube_links" USING btree ("_parent_id");
  CREATE INDEX "_events_v_version_requirements_order_idx" ON "_events_v_version_requirements" USING btree ("_order");
  CREATE INDEX "_events_v_version_requirements_parent_id_idx" ON "_events_v_version_requirements" USING btree ("_parent_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_owner_idx" ON "_events_v" USING btree ("version_owner_id");
  CREATE INDEX "_events_v_version_version_city_idx" ON "_events_v" USING btree ("version_city_id");
  CREATE INDEX "_events_v_version_version_geo_idx" ON "_events_v" USING btree ("version_geo");
  CREATE INDEX "_events_v_version_version_moderation_status_idx" ON "_events_v" USING btree ("version_moderation_status");
  CREATE INDEX "_events_v_version_version_featured_image_idx" ON "_events_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_events_v_version_version_verified_status_idx" ON "_events_v" USING btree ("version_verified_status");
  CREATE INDEX "_events_v_version_version_verification_idx" ON "_events_v" USING btree ("version_verification_id");
  CREATE INDEX "_events_v_version_version_rating_idx" ON "_events_v" USING btree ("version_rating");
  CREATE INDEX "_events_v_version_version_tier_idx" ON "_events_v" USING btree ("version_tier");
  CREATE INDEX "_events_v_version_version_event_status_idx" ON "_events_v" USING btree ("version_event_status");
  CREATE INDEX "_events_v_version_version_start_date_idx" ON "_events_v" USING btree ("version_start_date");
  CREATE INDEX "_events_v_version_version_end_date_idx" ON "_events_v" USING btree ("version_end_date");
  CREATE INDEX "_events_v_version_pricing_version_pricing_amount_idx" ON "_events_v" USING btree ("version_pricing_amount");
  CREATE INDEX "_events_v_version_version_venue_idx" ON "_events_v" USING btree ("version_venue_id");
  CREATE INDEX "_events_v_version_venue_address_details_version_venue_ad_idx" ON "_events_v" USING btree ("version_venue_address_details_venue_city_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_rels_order_idx" ON "_events_v_rels" USING btree ("order");
  CREATE INDEX "_events_v_rels_parent_idx" ON "_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_events_v_rels_path_idx" ON "_events_v_rels" USING btree ("path");
  CREATE INDEX "_events_v_rels_media_id_idx" ON "_events_v_rels" USING btree ("media_id");
  CREATE INDEX "_events_v_rels_listing_types_id_idx" ON "_events_v_rels" USING btree ("listing_types_id");
  CREATE INDEX "locations_tags_order_idx" ON "locations_tags" USING btree ("_order");
  CREATE INDEX "locations_tags_parent_id_idx" ON "locations_tags" USING btree ("_parent_id");
  CREATE INDEX "locations_youtube_links_order_idx" ON "locations_youtube_links" USING btree ("_order");
  CREATE INDEX "locations_youtube_links_parent_id_idx" ON "locations_youtube_links" USING btree ("_parent_id");
  CREATE INDEX "locations_availability_schedule_order_idx" ON "locations_availability_schedule" USING btree ("_order");
  CREATE INDEX "locations_availability_schedule_parent_id_idx" ON "locations_availability_schedule" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "locations_slug_idx" ON "locations" USING btree ("slug");
  CREATE INDEX "locations_owner_idx" ON "locations" USING btree ("owner_id");
  CREATE INDEX "locations_city_idx" ON "locations" USING btree ("city_id");
  CREATE INDEX "locations_geo_idx" ON "locations" USING btree ("geo");
  CREATE INDEX "locations_moderation_status_idx" ON "locations" USING btree ("moderation_status");
  CREATE INDEX "locations_featured_image_idx" ON "locations" USING btree ("featured_image_id");
  CREATE INDEX "locations_verified_status_idx" ON "locations" USING btree ("verified_status");
  CREATE INDEX "locations_verification_idx" ON "locations" USING btree ("verification_id");
  CREATE INDEX "locations_rating_idx" ON "locations" USING btree ("rating");
  CREATE INDEX "locations_tier_idx" ON "locations" USING btree ("tier");
  CREATE INDEX "locations_capacity_capacity_indoor_idx" ON "locations" USING btree ("capacity_indoor");
  CREATE INDEX "locations_pricing_pricing_amount_idx" ON "locations" USING btree ("pricing_amount");
  CREATE INDEX "locations_updated_at_idx" ON "locations" USING btree ("updated_at");
  CREATE INDEX "locations_created_at_idx" ON "locations" USING btree ("created_at");
  CREATE INDEX "locations__status_idx" ON "locations" USING btree ("_status");
  CREATE INDEX "locations_rels_order_idx" ON "locations_rels" USING btree ("order");
  CREATE INDEX "locations_rels_parent_idx" ON "locations_rels" USING btree ("parent_id");
  CREATE INDEX "locations_rels_path_idx" ON "locations_rels" USING btree ("path");
  CREATE INDEX "locations_rels_media_id_idx" ON "locations_rels" USING btree ("media_id");
  CREATE INDEX "locations_rels_listing_types_id_idx" ON "locations_rels" USING btree ("listing_types_id");
  CREATE INDEX "locations_rels_facilities_id_idx" ON "locations_rels" USING btree ("facilities_id");
  CREATE INDEX "locations_rels_suitableFor_composite_idx" ON "locations_rels" USING btree ("listing_types_id","parent_id") WHERE path = 'suitableFor';
  CREATE INDEX "locations_rels_type_composite_idx" ON "locations_rels" USING btree ("listing_types_id","parent_id") WHERE path = 'type';
  CREATE INDEX "locations_rels_facilities_composite_idx" ON "locations_rels" USING btree ("facilities_id","parent_id") WHERE path = 'facilities';
  CREATE INDEX "_locations_v_version_tags_order_idx" ON "_locations_v_version_tags" USING btree ("_order");
  CREATE INDEX "_locations_v_version_tags_parent_id_idx" ON "_locations_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_locations_v_version_youtube_links_order_idx" ON "_locations_v_version_youtube_links" USING btree ("_order");
  CREATE INDEX "_locations_v_version_youtube_links_parent_id_idx" ON "_locations_v_version_youtube_links" USING btree ("_parent_id");
  CREATE INDEX "_locations_v_version_availability_schedule_order_idx" ON "_locations_v_version_availability_schedule" USING btree ("_order");
  CREATE INDEX "_locations_v_version_availability_schedule_parent_id_idx" ON "_locations_v_version_availability_schedule" USING btree ("_parent_id");
  CREATE INDEX "_locations_v_parent_idx" ON "_locations_v" USING btree ("parent_id");
  CREATE INDEX "_locations_v_version_version_slug_idx" ON "_locations_v" USING btree ("version_slug");
  CREATE INDEX "_locations_v_version_version_owner_idx" ON "_locations_v" USING btree ("version_owner_id");
  CREATE INDEX "_locations_v_version_version_city_idx" ON "_locations_v" USING btree ("version_city_id");
  CREATE INDEX "_locations_v_version_version_geo_idx" ON "_locations_v" USING btree ("version_geo");
  CREATE INDEX "_locations_v_version_version_moderation_status_idx" ON "_locations_v" USING btree ("version_moderation_status");
  CREATE INDEX "_locations_v_version_version_featured_image_idx" ON "_locations_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_locations_v_version_version_verified_status_idx" ON "_locations_v" USING btree ("version_verified_status");
  CREATE INDEX "_locations_v_version_version_verification_idx" ON "_locations_v" USING btree ("version_verification_id");
  CREATE INDEX "_locations_v_version_version_rating_idx" ON "_locations_v" USING btree ("version_rating");
  CREATE INDEX "_locations_v_version_version_tier_idx" ON "_locations_v" USING btree ("version_tier");
  CREATE INDEX "_locations_v_version_capacity_version_capacity_indoor_idx" ON "_locations_v" USING btree ("version_capacity_indoor");
  CREATE INDEX "_locations_v_version_pricing_version_pricing_amount_idx" ON "_locations_v" USING btree ("version_pricing_amount");
  CREATE INDEX "_locations_v_version_version_updated_at_idx" ON "_locations_v" USING btree ("version_updated_at");
  CREATE INDEX "_locations_v_version_version_created_at_idx" ON "_locations_v" USING btree ("version_created_at");
  CREATE INDEX "_locations_v_version_version__status_idx" ON "_locations_v" USING btree ("version__status");
  CREATE INDEX "_locations_v_created_at_idx" ON "_locations_v" USING btree ("created_at");
  CREATE INDEX "_locations_v_updated_at_idx" ON "_locations_v" USING btree ("updated_at");
  CREATE INDEX "_locations_v_latest_idx" ON "_locations_v" USING btree ("latest");
  CREATE INDEX "_locations_v_rels_order_idx" ON "_locations_v_rels" USING btree ("order");
  CREATE INDEX "_locations_v_rels_parent_idx" ON "_locations_v_rels" USING btree ("parent_id");
  CREATE INDEX "_locations_v_rels_path_idx" ON "_locations_v_rels" USING btree ("path");
  CREATE INDEX "_locations_v_rels_media_id_idx" ON "_locations_v_rels" USING btree ("media_id");
  CREATE INDEX "_locations_v_rels_listing_types_id_idx" ON "_locations_v_rels" USING btree ("listing_types_id");
  CREATE INDEX "_locations_v_rels_facilities_id_idx" ON "_locations_v_rels" USING btree ("facilities_id");
  CREATE INDEX "services_tags_order_idx" ON "services_tags" USING btree ("_order");
  CREATE INDEX "services_tags_parent_id_idx" ON "services_tags" USING btree ("_parent_id");
  CREATE INDEX "services_youtube_links_order_idx" ON "services_youtube_links" USING btree ("_order");
  CREATE INDEX "services_youtube_links_parent_id_idx" ON "services_youtube_links" USING btree ("_parent_id");
  CREATE INDEX "services_availability_schedule_order_idx" ON "services_availability_schedule" USING btree ("_order");
  CREATE INDEX "services_availability_schedule_parent_id_idx" ON "services_availability_schedule" USING btree ("_parent_id");
  CREATE INDEX "services_features_order_idx" ON "services_features" USING btree ("_order");
  CREATE INDEX "services_features_parent_id_idx" ON "services_features" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_owner_idx" ON "services" USING btree ("owner_id");
  CREATE INDEX "services_city_idx" ON "services" USING btree ("city_id");
  CREATE INDEX "services_geo_idx" ON "services" USING btree ("geo");
  CREATE INDEX "services_moderation_status_idx" ON "services" USING btree ("moderation_status");
  CREATE INDEX "services_featured_image_idx" ON "services" USING btree ("featured_image_id");
  CREATE INDEX "services_verified_status_idx" ON "services" USING btree ("verified_status");
  CREATE INDEX "services_verification_idx" ON "services" USING btree ("verification_id");
  CREATE INDEX "services_rating_idx" ON "services" USING btree ("rating");
  CREATE INDEX "services_tier_idx" ON "services" USING btree ("tier");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE INDEX "services_rels_order_idx" ON "services_rels" USING btree ("order");
  CREATE INDEX "services_rels_parent_idx" ON "services_rels" USING btree ("parent_id");
  CREATE INDEX "services_rels_path_idx" ON "services_rels" USING btree ("path");
  CREATE INDEX "services_rels_media_id_idx" ON "services_rels" USING btree ("media_id");
  CREATE INDEX "services_rels_listing_types_id_idx" ON "services_rels" USING btree ("listing_types_id");
  CREATE INDEX "services_rels_suitableFor_composite_idx" ON "services_rels" USING btree ("listing_types_id","parent_id") WHERE path = 'suitableFor';
  CREATE INDEX "services_rels_type_composite_idx" ON "services_rels" USING btree ("listing_types_id","parent_id") WHERE path = 'type';
  CREATE INDEX "_services_v_version_tags_order_idx" ON "_services_v_version_tags" USING btree ("_order");
  CREATE INDEX "_services_v_version_tags_parent_id_idx" ON "_services_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_youtube_links_order_idx" ON "_services_v_version_youtube_links" USING btree ("_order");
  CREATE INDEX "_services_v_version_youtube_links_parent_id_idx" ON "_services_v_version_youtube_links" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_availability_schedule_order_idx" ON "_services_v_version_availability_schedule" USING btree ("_order");
  CREATE INDEX "_services_v_version_availability_schedule_parent_id_idx" ON "_services_v_version_availability_schedule" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_features_order_idx" ON "_services_v_version_features" USING btree ("_order");
  CREATE INDEX "_services_v_version_features_parent_id_idx" ON "_services_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_owner_idx" ON "_services_v" USING btree ("version_owner_id");
  CREATE INDEX "_services_v_version_version_city_idx" ON "_services_v" USING btree ("version_city_id");
  CREATE INDEX "_services_v_version_version_geo_idx" ON "_services_v" USING btree ("version_geo");
  CREATE INDEX "_services_v_version_version_moderation_status_idx" ON "_services_v" USING btree ("version_moderation_status");
  CREATE INDEX "_services_v_version_version_featured_image_idx" ON "_services_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_services_v_version_version_verified_status_idx" ON "_services_v" USING btree ("version_verified_status");
  CREATE INDEX "_services_v_version_version_verification_idx" ON "_services_v" USING btree ("version_verification_id");
  CREATE INDEX "_services_v_version_version_rating_idx" ON "_services_v" USING btree ("version_rating");
  CREATE INDEX "_services_v_version_version_tier_idx" ON "_services_v" USING btree ("version_tier");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE INDEX "_services_v_rels_order_idx" ON "_services_v_rels" USING btree ("order");
  CREATE INDEX "_services_v_rels_parent_idx" ON "_services_v_rels" USING btree ("parent_id");
  CREATE INDEX "_services_v_rels_path_idx" ON "_services_v_rels" USING btree ("path");
  CREATE INDEX "_services_v_rels_media_id_idx" ON "_services_v_rels" USING btree ("media_id");
  CREATE INDEX "_services_v_rels_listing_types_id_idx" ON "_services_v_rels" USING btree ("listing_types_id");
  CREATE UNIQUE INDEX "facilities_slug_idx" ON "facilities" USING btree ("slug");
  CREATE INDEX "facilities_updated_at_idx" ON "facilities" USING btree ("updated_at");
  CREATE INDEX "facilities_created_at_idx" ON "facilities" USING btree ("created_at");
  CREATE INDEX "metrics_daily_kind_idx" ON "metrics_daily" USING btree ("kind");
  CREATE INDEX "metrics_daily_date_idx" ON "metrics_daily" USING btree ("date");
  CREATE INDEX "metrics_daily_rels_order_idx" ON "metrics_daily_rels" USING btree ("order");
  CREATE INDEX "metrics_daily_rels_parent_idx" ON "metrics_daily_rels" USING btree ("parent_id");
  CREATE INDEX "metrics_daily_rels_path_idx" ON "metrics_daily_rels" USING btree ("path");
  CREATE INDEX "metrics_daily_rels_locations_id_idx" ON "metrics_daily_rels" USING btree ("locations_id");
  CREATE INDEX "metrics_daily_rels_events_id_idx" ON "metrics_daily_rels" USING btree ("events_id");
  CREATE INDEX "metrics_daily_rels_services_id_idx" ON "metrics_daily_rels" USING btree ("services_id");
  CREATE INDEX "aggregates_kind_idx" ON "aggregates" USING btree ("kind");
  CREATE INDEX "aggregates_rels_order_idx" ON "aggregates_rels" USING btree ("order");
  CREATE INDEX "aggregates_rels_parent_idx" ON "aggregates_rels" USING btree ("parent_id");
  CREATE INDEX "aggregates_rels_path_idx" ON "aggregates_rels" USING btree ("path");
  CREATE INDEX "aggregates_rels_locations_id_idx" ON "aggregates_rels" USING btree ("locations_id");
  CREATE INDEX "aggregates_rels_events_id_idx" ON "aggregates_rels" USING btree ("events_id");
  CREATE INDEX "aggregates_rels_services_id_idx" ON "aggregates_rels" USING btree ("services_id");
  CREATE INDEX "listing_rank_kind_idx" ON "listing_rank" USING btree ("kind");
  CREATE INDEX "listing_rank_segment_key_idx" ON "listing_rank" USING btree ("segment_key");
  CREATE INDEX "listing_rank_score_idx" ON "listing_rank" USING btree ("score");
  CREATE INDEX "segmentKey_kind_score_idx" ON "listing_rank" USING btree ("segment_key","kind","score");
  CREATE INDEX "listing_rank_rels_order_idx" ON "listing_rank_rels" USING btree ("order");
  CREATE INDEX "listing_rank_rels_parent_idx" ON "listing_rank_rels" USING btree ("parent_id");
  CREATE INDEX "listing_rank_rels_path_idx" ON "listing_rank_rels" USING btree ("path");
  CREATE INDEX "listing_rank_rels_locations_id_idx" ON "listing_rank_rels" USING btree ("locations_id");
  CREATE INDEX "listing_rank_rels_events_id_idx" ON "listing_rank_rels" USING btree ("events_id");
  CREATE INDEX "listing_rank_rels_services_id_idx" ON "listing_rank_rels" USING btree ("services_id");
  CREATE INDEX "reviews_criteria_ratings_order_idx" ON "reviews_criteria_ratings" USING btree ("_order");
  CREATE INDEX "reviews_criteria_ratings_parent_id_idx" ON "reviews_criteria_ratings" USING btree ("_parent_id");
  CREATE INDEX "reviews_user_idx" ON "reviews" USING btree ("user_id");
  CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status");
  CREATE INDEX "reviews_rating_idx" ON "reviews" USING btree ("rating");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "reviews_rels_order_idx" ON "reviews_rels" USING btree ("order");
  CREATE INDEX "reviews_rels_parent_idx" ON "reviews_rels" USING btree ("parent_id");
  CREATE INDEX "reviews_rels_path_idx" ON "reviews_rels" USING btree ("path");
  CREATE INDEX "reviews_rels_locations_id_idx" ON "reviews_rels" USING btree ("locations_id");
  CREATE INDEX "reviews_rels_events_id_idx" ON "reviews_rels" USING btree ("events_id");
  CREATE INDEX "reviews_rels_services_id_idx" ON "reviews_rels" USING btree ("services_id");
  CREATE INDEX "hub_snapshots_typeahead_cities_order_idx" ON "hub_snapshots_typeahead_cities" USING btree ("_order");
  CREATE INDEX "hub_snapshots_typeahead_cities_parent_id_idx" ON "hub_snapshots_typeahead_cities" USING btree ("_parent_id");
  CREATE INDEX "hub_snapshots_top_cities_order_idx" ON "hub_snapshots_top_cities" USING btree ("_order");
  CREATE INDEX "hub_snapshots_top_cities_parent_id_idx" ON "hub_snapshots_top_cities" USING btree ("_parent_id");
  CREATE INDEX "hub_snapshots_top_types_order_idx" ON "hub_snapshots_top_types" USING btree ("_order");
  CREATE INDEX "hub_snapshots_top_types_parent_id_idx" ON "hub_snapshots_top_types" USING btree ("_parent_id");
  CREATE INDEX "hub_snapshots_popular_city_rows_items_order_idx" ON "hub_snapshots_popular_city_rows_items" USING btree ("_order");
  CREATE INDEX "hub_snapshots_popular_city_rows_items_parent_id_idx" ON "hub_snapshots_popular_city_rows_items" USING btree ("_parent_id");
  CREATE INDEX "hub_snapshots_popular_city_rows_order_idx" ON "hub_snapshots_popular_city_rows" USING btree ("_order");
  CREATE INDEX "hub_snapshots_popular_city_rows_parent_id_idx" ON "hub_snapshots_popular_city_rows" USING btree ("_parent_id");
  CREATE INDEX "hub_snapshots_featured_order_idx" ON "hub_snapshots_featured" USING btree ("_order");
  CREATE INDEX "hub_snapshots_featured_parent_id_idx" ON "hub_snapshots_featured" USING btree ("_parent_id");
  CREATE INDEX "hub_snapshots_popular_search_combos_order_idx" ON "hub_snapshots_popular_search_combos" USING btree ("_order");
  CREATE INDEX "hub_snapshots_popular_search_combos_parent_id_idx" ON "hub_snapshots_popular_search_combos" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "hub_snapshots_listing_type_idx" ON "hub_snapshots" USING btree ("listing_type");
  CREATE INDEX "hub_snapshots_updated_at_idx" ON "hub_snapshots" USING btree ("updated_at");
  CREATE INDEX "hub_snapshots_created_at_idx" ON "hub_snapshots" USING btree ("created_at");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_locations_id_idx" ON "search_rels" USING btree ("locations_id");
  CREATE INDEX "search_rels_services_id_idx" ON "search_rels" USING btree ("services_id");
  CREATE INDEX "search_rels_events_id_idx" ON "search_rels" USING btree ("events_id");
  CREATE INDEX "search_rels_profiles_id_idx" ON "search_rels" USING btree ("profiles_id");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("profiles_id");
  CREATE INDEX "payload_locked_documents_rels_verifications_id_idx" ON "payload_locked_documents_rels" USING btree ("verifications_id");
  CREATE INDEX "payload_locked_documents_rels_favorites_id_idx" ON "payload_locked_documents_rels" USING btree ("favorites_id");
  CREATE INDEX "payload_locked_documents_rels_listing_types_id_idx" ON "payload_locked_documents_rels" USING btree ("listing_types_id");
  CREATE INDEX "payload_locked_documents_rels_cities_id_idx" ON "payload_locked_documents_rels" USING btree ("cities_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_locations_id_idx" ON "payload_locked_documents_rels" USING btree ("locations_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_facilities_id_idx" ON "payload_locked_documents_rels" USING btree ("facilities_id");
  CREATE INDEX "payload_locked_documents_rels_metrics_daily_id_idx" ON "payload_locked_documents_rels" USING btree ("metrics_daily_id");
  CREATE INDEX "payload_locked_documents_rels_aggregates_id_idx" ON "payload_locked_documents_rels" USING btree ("aggregates_id");
  CREATE INDEX "payload_locked_documents_rels_listing_rank_id_idx" ON "payload_locked_documents_rels" USING btree ("listing_rank_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_hub_snapshots_id_idx" ON "payload_locked_documents_rels" USING btree ("hub_snapshots_id");
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_listings_rels_order_idx" ON "home_listings_rels" USING btree ("order");
  CREATE INDEX "home_listings_rels_parent_idx" ON "home_listings_rels" USING btree ("parent_id");
  CREATE INDEX "home_listings_rels_path_idx" ON "home_listings_rels" USING btree ("path");
  CREATE INDEX "home_listings_rels_locations_id_idx" ON "home_listings_rels" USING btree ("locations_id");
  CREATE INDEX "home_listings_rels_services_id_idx" ON "home_listings_rels" USING btree ("services_id");
  CREATE INDEX "home_listings_rels_events_id_idx" ON "home_listings_rels" USING btree ("events_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "profiles_user_type" CASCADE;
  DROP TABLE "profiles" CASCADE;
  DROP TABLE "profiles_rels" CASCADE;
  DROP TABLE "verifications_documents" CASCADE;
  DROP TABLE "verifications" CASCADE;
  DROP TABLE "verifications_rels" CASCADE;
  DROP TABLE "favorites" CASCADE;
  DROP TABLE "favorites_rels" CASCADE;
  DROP TABLE "listing_types" CASCADE;
  DROP TABLE "cities" CASCADE;
  DROP TABLE "events_tags" CASCADE;
  DROP TABLE "events_youtube_links" CASCADE;
  DROP TABLE "events_requirements" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "_events_v_version_tags" CASCADE;
  DROP TABLE "_events_v_version_youtube_links" CASCADE;
  DROP TABLE "_events_v_version_requirements" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_rels" CASCADE;
  DROP TABLE "locations_tags" CASCADE;
  DROP TABLE "locations_youtube_links" CASCADE;
  DROP TABLE "locations_availability_schedule" CASCADE;
  DROP TABLE "locations" CASCADE;
  DROP TABLE "locations_rels" CASCADE;
  DROP TABLE "_locations_v_version_tags" CASCADE;
  DROP TABLE "_locations_v_version_youtube_links" CASCADE;
  DROP TABLE "_locations_v_version_availability_schedule" CASCADE;
  DROP TABLE "_locations_v" CASCADE;
  DROP TABLE "_locations_v_rels" CASCADE;
  DROP TABLE "services_tags" CASCADE;
  DROP TABLE "services_youtube_links" CASCADE;
  DROP TABLE "services_availability_schedule" CASCADE;
  DROP TABLE "services_features" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_rels" CASCADE;
  DROP TABLE "_services_v_version_tags" CASCADE;
  DROP TABLE "_services_v_version_youtube_links" CASCADE;
  DROP TABLE "_services_v_version_availability_schedule" CASCADE;
  DROP TABLE "_services_v_version_features" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_rels" CASCADE;
  DROP TABLE "facilities" CASCADE;
  DROP TABLE "metrics_daily" CASCADE;
  DROP TABLE "metrics_daily_rels" CASCADE;
  DROP TABLE "aggregates" CASCADE;
  DROP TABLE "aggregates_rels" CASCADE;
  DROP TABLE "listing_rank" CASCADE;
  DROP TABLE "listing_rank_rels" CASCADE;
  DROP TABLE "reviews_criteria_ratings" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "reviews_rels" CASCADE;
  DROP TABLE "hub_snapshots_typeahead_cities" CASCADE;
  DROP TABLE "hub_snapshots_top_cities" CASCADE;
  DROP TABLE "hub_snapshots_top_types" CASCADE;
  DROP TABLE "hub_snapshots_popular_city_rows_items" CASCADE;
  DROP TABLE "hub_snapshots_popular_city_rows" CASCADE;
  DROP TABLE "hub_snapshots_featured" CASCADE;
  DROP TABLE "hub_snapshots_popular_search_combos" CASCADE;
  DROP TABLE "hub_snapshots" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_listings" CASCADE;
  DROP TABLE "home_listings_rels" CASCADE;
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_status";
  DROP TYPE "public"."enum_media_context";
  DROP TYPE "public"."enum_profiles_user_type";
  DROP TYPE "public"."enum_profiles_verified_status";
  DROP TYPE "public"."enum_verifications_documents_type";
  DROP TYPE "public"."enum_verifications_status";
  DROP TYPE "public"."enum_favorites_kind";
  DROP TYPE "public"."enum_listing_types_type";
  DROP TYPE "public"."enum_cities_source";
  DROP TYPE "public"."enum_events_moderation_status";
  DROP TYPE "public"."enum_events_verified_status";
  DROP TYPE "public"."enum_events_tier";
  DROP TYPE "public"."enum_events_event_status";
  DROP TYPE "public"."enum_events_pricing_type";
  DROP TYPE "public"."enum_events_pricing_currency";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_moderation_status";
  DROP TYPE "public"."enum__events_v_version_verified_status";
  DROP TYPE "public"."enum__events_v_version_tier";
  DROP TYPE "public"."enum__events_v_version_event_status";
  DROP TYPE "public"."enum__events_v_version_pricing_type";
  DROP TYPE "public"."enum__events_v_version_pricing_currency";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum_locations_availability_schedule_day";
  DROP TYPE "public"."enum_locations_moderation_status";
  DROP TYPE "public"."enum_locations_verified_status";
  DROP TYPE "public"."enum_locations_tier";
  DROP TYPE "public"."enum_locations_pricing_type";
  DROP TYPE "public"."enum_locations_pricing_currency";
  DROP TYPE "public"."enum_locations_pricing_period";
  DROP TYPE "public"."enum_locations_availability_type";
  DROP TYPE "public"."enum_locations_status";
  DROP TYPE "public"."enum__locations_v_version_availability_schedule_day";
  DROP TYPE "public"."enum__locations_v_version_moderation_status";
  DROP TYPE "public"."enum__locations_v_version_verified_status";
  DROP TYPE "public"."enum__locations_v_version_tier";
  DROP TYPE "public"."enum__locations_v_version_pricing_type";
  DROP TYPE "public"."enum__locations_v_version_pricing_currency";
  DROP TYPE "public"."enum__locations_v_version_pricing_period";
  DROP TYPE "public"."enum__locations_v_version_availability_type";
  DROP TYPE "public"."enum__locations_v_version_status";
  DROP TYPE "public"."enum_services_availability_schedule_day";
  DROP TYPE "public"."enum_services_moderation_status";
  DROP TYPE "public"."enum_services_verified_status";
  DROP TYPE "public"."enum_services_tier";
  DROP TYPE "public"."enum_services_pricing_type";
  DROP TYPE "public"."enum_services_pricing_currency";
  DROP TYPE "public"."enum_services_pricing_period";
  DROP TYPE "public"."enum_services_availability_type";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_availability_schedule_day";
  DROP TYPE "public"."enum__services_v_version_moderation_status";
  DROP TYPE "public"."enum__services_v_version_verified_status";
  DROP TYPE "public"."enum__services_v_version_tier";
  DROP TYPE "public"."enum__services_v_version_pricing_type";
  DROP TYPE "public"."enum__services_v_version_pricing_currency";
  DROP TYPE "public"."enum__services_v_version_pricing_period";
  DROP TYPE "public"."enum__services_v_version_availability_type";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum_metrics_daily_kind";
  DROP TYPE "public"."enum_aggregates_kind";
  DROP TYPE "public"."enum_listing_rank_kind";
  DROP TYPE "public"."enum_reviews_criteria_ratings_criteria";
  DROP TYPE "public"."enum_reviews_listing_type";
  DROP TYPE "public"."enum_reviews_status";
  DROP TYPE "public"."enum_hub_snapshots_listing_type";`)
}
