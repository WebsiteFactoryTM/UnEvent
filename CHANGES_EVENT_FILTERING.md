# Event Filtering Implementation Summary

## Overview
Implemented comprehensive filtering to exclude finished events from all frontend and backend queries, and added automatic event status management.

## Changes Made

### 1. Backend API Endpoints

#### `/apps/backend/src/endpoints/feedEndpoint.ts`
- **Line 331**: Added filter to exclude events with `eventStatus = 'finished'`
- **Impact**: Feed API now only shows upcoming and in-progress events

#### `/apps/backend/src/endpoints/homeListings.ts`
- **Lines 144-177**: Updated `getExtraListings()` function to filter events
- Added filters for `eventStatus != 'finished'` and `endDate >= now`
- **Impact**: Home page listings now exclude finished events

#### `/apps/backend/src/schedulers/buildHubSnapshot.ts`
- **Lines 67-73**: Added event filtering for featured nationwide listings
- **Lines 84-105**: Added event filtering for city-specific rows
- **Impact**: Hub snapshots (cached data for hub pages) exclude finished events

### 2. Frontend API Routes

#### `/apps/frontend/app/api/public/profiles/[slug]/listings/route.ts`
- **Lines 82-84**: Added URL parameters to filter events in profile listings
- Filters: `eventStatus != 'finished'` and `endDate >= now`
- **Impact**: User profile pages only show active events

#### `/apps/frontend/app/(sitemaps)/sitemap-listings-evenimente.xml/route.ts`
- **Lines 10-14**: Updated sitemap generation to exclude finished events
- **Impact**: Search engines only index active events

#### `/apps/frontend/app/api/public/listings/[type]/similar/route.ts`
- **Lines 57-61**: Added event filtering for similar listings
- **Impact**: Similar/recommended events exclude finished ones

#### `/apps/frontend/lib/api/listings.ts`
- **Lines 308-313**: Added `eventStatus` filter to similar listings fetch
- **Impact**: Client-side similar listings requests filter properly

### 3. Automatic Event Status Management

#### New Scheduler: `/apps/backend/src/schedulers/updateEventStatus.ts`
- Runs daily at 3:00 AM (configurable)
- Batch updates event statuses in the database
- Processes events in batches of 100 to avoid DB overload
- **Impact**: Database stays synchronized with actual event states

#### New Admin Endpoint: `/apps/backend/src/endpoints/updateEventStatusEndpoint.ts`
- Manual trigger for updating event statuses
- Protected endpoint (admin only)
- Accessible via admin panel button
- **Impact**: Allows admins to manually sync event statuses on demand

#### `/apps/backend/src/payload.config.ts`
- **Line 46**: Imported endpoint handler
- **Line 51**: Imported scheduler registration function
- **Line 163-167**: Registered endpoint at `/api/update-event-status`
- **Line 444**: Registered scheduler to run when jobs are enabled
- **Impact**: Scheduler runs automatically in production, endpoint available for manual triggers

#### `/apps/backend/src/components/AdminActions/index.tsx`
- **Lines 35-42**: Added "Update Event Statuses" button to admin panel
- **Impact**: Admins can manually trigger status updates from the UI

## Filter Logic

### For All Event Queries:
1. `eventStatus != 'finished'` - Excludes manually finished events
2. `endDate >= now` - Excludes events that have already ended

### Event Status States:
- **upcoming**: Event hasn't started yet (startDate > now)
- **in-progress**: Event is currently happening (startDate <= now < endDate)
- **finished**: Event has ended (endDate < now)

## Configuration

### Scheduler Configuration
- Environment variable: `SCHEDULER_EVENT_STATUS_INTERVAL_HOURS`
- Default: 24 hours (once daily)
- Configurable per environment (production/staging/dev)

### Scheduler Control
- Enabled via: `ENABLE_JOBS=true` or Settings global
- Primary node only: `SCHEDULER_IS_PRIMARY=true`

## Testing Recommendations

1. **Verify Filtering**:
   - Check feed API: `/api/feed?entity=events`
   - Check home page: `/api/home`
   - Check hub: `/api/hub?listingType=events`
   - Check profile listings: `/api/public/profiles/[slug]/listings`
   - Check sitemap: `/sitemap-listings-evenimente.xml`

2. **Verify Status Updates**:
   - Create test events with past endDates
   - Click "Update Event Statuses" button in admin panel
   - Verify they show as "finished" status
   - Verify they don't appear in queries
   - Check scheduler runs daily in logs at 3:00 AM

3. **Performance**:
   - Monitor query performance with new filters
   - Check scheduler execution time in logs
   - Verify batch processing doesn't timeout

## Migration Notes

- **No database migration needed**: Uses existing fields
- **Backward compatible**: Existing events work without changes
- **Scheduler syncs DB**: Ensures long-term consistency (max 24h lag)
- **No manual intervention needed**: Fully automated

## Files Changed

### Backend
1. `apps/backend/src/endpoints/feedEndpoint.ts`
2. `apps/backend/src/endpoints/homeListings.ts`
3. `apps/backend/src/schedulers/buildHubSnapshot.ts`
4. `apps/backend/src/schedulers/updateEventStatus.ts` (new)
5. `apps/backend/src/endpoints/updateEventStatusEndpoint.ts` (new)
6. `apps/backend/src/collections/Listings/Events/index.tsx`
7. `apps/backend/src/payload.config.ts`
8. `apps/backend/src/components/AdminActions/index.tsx`

### Frontend
1. `apps/frontend/app/api/public/profiles/[slug]/listings/route.ts`
2. `apps/frontend/app/(sitemaps)/sitemap-listings-evenimente.xml/route.ts`
3. `apps/frontend/app/api/public/listings/[type]/similar/route.ts`
4. `apps/frontend/lib/api/listings.ts`

Total: 12 files modified, 2 files created

## Performance Notes

**Why no `afterRead` hook?**
- Query filters (`eventStatus != 'finished'`) already exclude finished events
- Index-based filtering is much faster than runtime date comparisons
- Scheduler syncs DB daily (max 24h lag is acceptable)
- Avoids creating Date objects on every single event read
- No performance overhead on high-traffic endpoints

**Benefits of this approach:**
- ✅ Zero runtime overhead on reads
- ✅ Fast indexed database queries
- ✅ Simple and maintainable
- ✅ Eventual consistency (max 24h lag)

## Next Steps

1. Deploy to staging environment
2. Test all event-related endpoints
3. Monitor scheduler logs for 24 hours
4. Verify finished events are properly filtered
5. Deploy to production
