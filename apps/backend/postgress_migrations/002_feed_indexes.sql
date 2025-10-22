-- Feed Algorithm Performance Indexes
-- These indexes optimize the /api/feed endpoint queries

-- 1. listing_rank: Composite index for fast ranked queries (critical!)
--    Pattern: WHERE segmentKey = X AND kind = Y ORDER BY score DESC
CREATE INDEX IF NOT EXISTS "listing_rank_segment_kind_score_desc_idx"
  ON "listing-rank" ("segment_key", "kind", "score" DESC);

-- 2. Individual indexes for feed collections (if not auto-created by Payload)
CREATE INDEX IF NOT EXISTS "metrics_daily_kind_idx" ON "metrics-daily" ("kind");
CREATE INDEX IF NOT EXISTS "metrics_daily_date_idx" ON "metrics-daily" ("date");

CREATE INDEX IF NOT EXISTS "aggregates_kind_idx" ON "aggregates" ("kind");

-- 3. Listing collections: Optimize feed endpoint filters
--    (city, type, status, tier, rating, pricing.amount, capacity.indoor)

-- These might already exist from Payload auto-indexing, but we ensure they're there:
CREATE INDEX IF NOT EXISTS "locations_city_idx" ON "locations" ("city_id");
CREATE INDEX IF NOT EXISTS "locations_status_idx" ON "locations" ("status");
CREATE INDEX IF NOT EXISTS "locations_tier_idx" ON "locations" ("tier");
CREATE INDEX IF NOT EXISTS "locations_rating_idx" ON "locations" ("rating");

CREATE INDEX IF NOT EXISTS "events_city_idx" ON "events" ("city_id");
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events" ("status");
CREATE INDEX IF NOT EXISTS "events_tier_idx" ON "events" ("tier");
CREATE INDEX IF NOT EXISTS "events_rating_idx" ON "events" ("rating");

CREATE INDEX IF NOT EXISTS "services_city_idx" ON "services" ("city_id");
CREATE INDEX IF NOT EXISTS "services_status_idx" ON "services" ("status");
CREATE INDEX IF NOT EXISTS "services_tier_idx" ON "services" ("tier");
CREATE INDEX IF NOT EXISTS "services_rating_idx" ON "services" ("rating");

-- 4. Composite index for common feed query pattern (city + status + tier)
CREATE INDEX IF NOT EXISTS "locations_feed_query_idx"
  ON "locations" ("city_id", "status", "tier");

CREATE INDEX IF NOT EXISTS "events_feed_query_idx"
  ON "events" ("city_id", "status", "tier");

CREATE INDEX IF NOT EXISTS "services_feed_query_idx"
  ON "services" ("city_id", "status", "tier");

-- Note: Payload creates some indexes automatically via field-level { index: true }
-- This migration ensures critical composite indexes exist for optimal query performance

