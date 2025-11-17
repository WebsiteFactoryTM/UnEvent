-- Feed Algorithm Performance Indexes
-- These indexes optimize the /api/feed endpoint queries

-- 1. Feed collections: Only create indexes if tables exist (created after Payload init)
--    Pattern: WHERE segmentKey = X AND kind = Y ORDER BY score DESC
DO $$
BEGIN
    -- Check if listing-rank table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listing-rank') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'listing_rank_segment_kind_score_desc_idx') THEN
            EXECUTE 'CREATE INDEX CONCURRENTLY "listing_rank_segment_kind_score_desc_idx" ON "listing-rank" ("segment_key", "kind", "score" DESC)';
        END IF;
    END IF;

    -- Check if metrics-daily table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metrics-daily') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'metrics_daily_kind_idx') THEN
            EXECUTE 'CREATE INDEX CONCURRENTLY "metrics_daily_kind_idx" ON "metrics-daily" ("kind")';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'metrics_daily_date_idx') THEN
            EXECUTE 'CREATE INDEX CONCURRENTLY "metrics_daily_date_idx" ON "metrics-daily" ("date")';
        END IF;
    END IF;

    -- Check if aggregates table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'aggregates') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'aggregates_kind_idx') THEN
            EXECUTE 'CREATE INDEX CONCURRENTLY "aggregates_kind_idx" ON "aggregates" ("kind")';
        END IF;
    END IF;
END $$;

-- 2. Listing collections: Ensure critical indexes exist for feed queries
--    (city, type, status, tier, rating) - Payload creates some automatically
CREATE INDEX CONCURRENTLY IF NOT EXISTS "locations_city_idx" ON "locations" ("city_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "locations_status_idx" ON "locations" ("moderationStatus");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "locations_tier_idx" ON "locations" ("tier");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "locations_rating_idx" ON "locations" ("rating");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "events_city_idx" ON "events" ("city_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "events_status_idx" ON "events" ("moderationStatus");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "events_tier_idx" ON "events" ("tier");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "events_rating_idx" ON "events" ("rating");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "services_city_idx" ON "services" ("city_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "services_status_idx" ON "services" ("moderationStatus");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "services_tier_idx" ON "services" ("tier");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "services_rating_idx" ON "services" ("rating");

-- 3. Composite indexes for common feed query patterns (city + status + tier)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "locations_feed_query_idx"
  ON "locations" ("city_id", "moderationStatus", "tier");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "events_feed_query_idx"
  ON "events" ("city_id", "moderationStatus", "tier");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "services_feed_query_idx"
  ON "services" ("city_id", "moderationStatus", "tier");

-- Note: This migration is safe to run multiple times and before/after Payload table creation

