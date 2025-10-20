-- ========================================
--  UN:EVENT – Custom Indexes Migration (Updated)
--  Adds optimized partial and composite indexes for PayloadCMS Postgres setup
-- ========================================

-- ====================
-- LOCATIONS
-- ====================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_city_created_createdat
  ON public.locations (city_id, created_at DESC)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_city_price_asc
  ON public.locations (city_id, pricing_amount ASC)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_city_rating_desc
  ON public.locations (city_id, rating DESC)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_featured
  ON public.locations (featured)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS locations_rels_suitableFor_composite_idx
  ON public.locations_rels (listing_types_id, parent_id)
  WHERE path = 'suitableFor';

CREATE INDEX CONCURRENTLY IF NOT EXISTS locations_rels_type_composite_idx
  ON public.locations_rels (listing_types_id, parent_id)
  WHERE path = 'type';

CREATE INDEX CONCURRENTLY IF NOT EXISTS locations_rels_facilities_composite_idx
  ON public.locations_rels (facilities_id, parent_id)
  WHERE path = 'facilities';

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_loc_rels_suitableFor_unique
  ON public.locations_rels (parent_id, listing_types_id)
  WHERE path = 'suitableFor';

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_loc_rels_type_unique
  ON public.locations_rels (parent_id, listing_types_id)
  WHERE path = 'type';

-- ====================
-- SERVICES
-- ====================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_city_created_createdat
  ON public.services (city_id, created_at DESC)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_city_price_asc
  ON public.services (city_id, pricing_amount ASC)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_city_rating_desc
  ON public.services (city_id, rating DESC)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_pricing_type
  ON public.services ((pricing ->> 'type'))
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_featured
  ON public.services (featured)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS services_rels_suitableFor_composite_idx
  ON public.services_rels (listing_types_id, parent_id)
  WHERE path = 'suitableFor';

CREATE INDEX CONCURRENTLY IF NOT EXISTS services_rels_type_composite_idx
  ON public.services_rels (listing_types_id, parent_id)
  WHERE path = 'type';

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_srv_rels_suitableFor_unique
  ON public.services_rels (parent_id, listing_types_id)
  WHERE path = 'suitableFor';

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_srv_rels_type_unique
  ON public.services_rels (parent_id, listing_types_id)
  WHERE path = 'type';

-- ====================
-- EVENTS
-- ====================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_city_updated_updatedat
  ON public.events (city_id, updated_at DESC)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS events_rels_type_composite_idx
  ON public.events_rels (listing_types_id, parent_id)
  WHERE path = 'type';

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_evt_rels_type_unique
  ON public.events_rels (parent_id, listing_types_id)
  WHERE path = 'type';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_city_status_start_asc
  ON public.events (city_id, startDate ASC)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_city_status_start_desc
  ON public.events (city_id, startDate DESC)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_status_eventStatus
  ON public.events (status, eventStatus);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_pricing_type
  ON public.events ((pricing ->> 'type'))
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_featured
  ON public.events (featured)
  WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_sponsored
  ON public.events (sponsored)
  WHERE status = 'approved';

-- End of file