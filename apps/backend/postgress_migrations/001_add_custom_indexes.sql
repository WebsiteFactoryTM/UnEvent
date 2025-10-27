-- ========================================
--  UN:EVENT – Custom Indexes Migration (Fixed)
--  Adds optimized partial and composite indexes for current schema
-- ========================================

-- ====================
-- LOCATIONS
-- ====================
-- Basic indexes (Payload creates some automatically, but ensure they exist)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_city_created_desc
  ON public.locations (city_id, created_at DESC)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_city_rating_desc
  ON public.locations (city_id, rating DESC)
  WHERE status = 'approved';

-- Relationship table indexes for type and facilities
CREATE INDEX CONCURRENTLY IF NOT EXISTS locations_rels_type_composite_idx
  ON public.locations_rels (listing_types_id, parent_id)
  WHERE path = 'type';

CREATE INDEX CONCURRENTLY IF NOT EXISTS locations_rels_facilities_composite_idx
  ON public.locations_rels (facilities_id, parent_id)
  WHERE path = 'facilities';

-- Unique constraints for relationships
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_loc_rels_type_unique
  ON public.locations_rels (parent_id, listing_types_id)
  WHERE path = 'type';

-- ====================
-- SERVICES
-- ====================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_city_created_desc
  ON public.services (city_id, created_at DESC)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_city_rating_desc
  ON public.services (city_id, rating DESC)
  WHERE status = 'approved';

-- Relationship table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS services_rels_type_composite_idx
  ON public.services_rels (listing_types_id, parent_id)
  WHERE path = 'type';

-- Unique constraints for relationships
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_srv_rels_type_unique
  ON public.services_rels (parent_id, listing_types_id)
  WHERE path = 'type';

-- ====================
-- EVENTS
-- ====================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_city_updated_desc
  ON public.events (city_id, updated_at DESC)
  WHERE status = 'approved';

-- Event-specific indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_city_status_start_asc
  ON public.events (city_id, start_date ASC)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_city_status_start_desc
  ON public.events (city_id, start_date DESC)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_status_eventStatus
  ON public.events (status, event_status);

-- Relationship table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS events_rels_type_composite_idx
  ON public.events_rels (listing_types_id, parent_id)
  WHERE path = 'type';

-- Unique constraints for relationships
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_evt_rels_type_unique
  ON public.events_rels (parent_id, listing_types_id)
  WHERE path = 'type';

-- End of file