# Release Notes: Last 13 Commits
**Starting from:** `f30136e96a76e8ed0d80a94bd9aaeb1ae0a9c00d` - feat(backend): expose card-ready listing DTOs and rich-text helpers

## 🚨 BREAKING CHANGES

### 1. **CardItem Type Change: `listingId` → `id`** ⚠️
- **Commit:** `eb1e0b6` - frontend: add HubSnapshotResponse type for transformed hub data
- **Impact:** All frontend code consuming `CardItem` type
- **Change:** `CardItem.listingId` renamed to `CardItem.id`
- **Affected Files:**
  - `apps/frontend/types/listings.ts`
  - `apps/frontend/lib/normalizers/hub.ts`
  - All components using `CardItem` type
- **Migration:** Update all references from `item.listingId` to `item.id`

### 2. **HubSnapshot API Response Structure** ⚠️
- **Commit:** `98a6c64` - backend: transform listingId to id in hub endpoint response
- **Impact:** Frontend consuming `/api/hub` endpoint
- **Change:** HubSnapshot items now return `id` instead of `listingId` in API responses
- **Before:** `{ listingId: 98, ... }`
- **After:** `{ id: 98, ... }`
- **Note:** Payload document `id` is excluded to prevent conflicts
- **Affected Endpoints:**
  - `GET /api/hub?listingType={type}`

### 3. **Profiles Removed from Global Search** ⚠️
- **Commit:** `4812c1b` - refactor(backend): remove profiles from search plugin
- **Impact:** Search functionality
- **Change:** Profiles collection no longer indexed in global search
- **Affected:** 
  - Global search no longer returns profile results
  - Search relation types updated (profiles removed)
- **Migration:** If profiles need to be searchable, they must be re-added to search plugin config

### 4. **Event Filtering - Finished Events Excluded** ⚠️
- **Commits:** 
  - `219a2c5` - feat(backend): filter finished events from all listing queries
  - `a18e010` - feat(frontend): filter finished events from all API routes
- **Impact:** All event listing queries and API responses
- **Change:** Finished events (`eventStatus: 'finished'` or `endDate < now`) are now excluded from:
  - Feed endpoint (`/api/feed`)
  - Home listings (`/api/home-listings`)
  - Hub snapshot builder
  - Profile listings API
  - Sitemap generation
  - Similar listings API
  - Client-side similar listings fetch
- **Filters Applied:**
  - `eventStatus != 'finished'`
  - `endDate >= now` (ISO string)
- **Migration:** If you need finished events, add explicit filters or query directly

### 5. **HubSnapshot Fallback Cities Format** ⚠️
- **Commit:** `71a3971` - backend: update fallback cities format in hub snapshot builder
- **Impact:** Hub snapshot builder when no cities found in DB
- **Change:** `TOP_CITIES_FALLBACK` changed from string array to object array
- **Before:** `['bucuresti', 'cluj-napoca', ...]`
- **After:** `[{ slug: 'municipiul-bucuresti-bucuresti', label: 'București' }, ...]`
- **Note:** This is internal to the scheduler, but affects snapshot data structure

## ✨ NEW FEATURES

### 1. **Automatic Event Status Management**
- **Commit:** `864ce02` - feat(backend): add automatic event status management
- **Features:**
  - Daily scheduler to update event statuses based on current date
  - Admin endpoint: `POST /api/update-event-status` (admin only)
  - Admin UI button to manually trigger status updates
  - Statuses: `finished`, `in-progress`, `upcoming`
- **Configuration:** `SCHEDULER_EVENT_STATUS_INTERVAL_HOURS` env var (default: 24h)

### 2. **Rich Text to Plain Text Utilities**
- **Commit:** `df3e14b` - feat(shared): add rich-text to plain-text utilities
- **Features:**
  - `richTextToPlainText()` - converts Lexical JSON to plain text
  - `getListingPlainDescription()` - helper for listings with fallback
  - Used for meta tags, descriptions, and card previews
- **Location:** `apps/frontend/lib/richText.ts`

### 3. **HubSnapshotResponse Type**
- **Commit:** `eb1e0b6` - frontend: add HubSnapshotResponse type for transformed hub data
- **Features:**
  - Type-safe transformation of HubSnapshot data
  - Handles `listingId` → `id` conversion
  - Ensures type consistency across frontend

## 🔧 IMPROVEMENTS & REFACTORING

### 1. **Centralized Card Normalization**
- **Commit:** `6e4beae` - feat(frontend): normalize listings to card data and support rich descriptions
- **Commit:** `dca745d` - frontend: update components to use centralized card normalization
- **Changes:**
  - Consolidated normalization logic in `apps/frontend/lib/normalizers/hub.ts`
  - Replaced local `toCard` functions with `cardItemToListingCardData`
  - Added `toListingCardData()` for full listing documents
  - Added `getTypeLabelFromRelation()` for consistent category extraction
  - Support for rich text descriptions in cards
- **Affected Components:**
  - `ListingCard` - now shows description snippets
  - `HomeCarousel` - fixed React key prop (composite key)
  - `ListingRecommendations` - uses centralized normalization
  - `Archive` - updated to use `id` instead of `listingId`
  - `ProfileListingsTabs` - uses `toListingCardData`

### 2. **Event Filtering Documentation**
- **Commit:** `7e4ca0f` - docs: add comprehensive event filtering implementation summary
- **Content:** Complete documentation of event filtering changes, testing recommendations, and performance notes

## 📋 TESTING CHECKLIST

### Critical Tests Required:

1. **Hub Snapshot API**
   - [ ] Verify `/api/hub?listingType=events` returns `id` instead of `listingId`
   - [ ] Check that Payload document `id` is not included in response
   - [ ] Verify featured and popularCityRows items have correct `id` field

2. **Event Filtering**
   - [ ] Verify finished events are excluded from feed endpoint
   - [ ] Verify finished events are excluded from home page carousels
   - [ ] Verify finished events are excluded from hub snapshots
   - [ ] Verify finished events are excluded from profile listings
   - [ ] Verify finished events are excluded from similar listings
   - [ ] Verify finished events are excluded from sitemap
   - [ ] Test event status scheduler (if `ENABLE_JOBS=true`)

3. **CardItem Type Changes**
   - [ ] Verify all listing cards render correctly with `id` field
   - [ ] Check archive pages (locations, services, events)
   - [ ] Check home page carousels
   - [ ] Check profile listings tabs
   - [ ] Check listing recommendations

4. **Search Functionality**
   - [ ] Verify profiles are NOT returned in global search
   - [ ] Verify locations, services, events still searchable

5. **Rich Text Descriptions**
   - [ ] Verify listing cards show description snippets
   - [ ] Verify meta tags use plain text from rich text
   - [ ] Verify description rendering on listing detail pages

6. **Fallback Cities**
   - [ ] Test hub snapshot when no cities in DB
   - [ ] Verify fallback cities have correct slug/label format

## 🔄 MIGRATION GUIDE

### For Frontend Code:

1. **Update CardItem references:**
   ```typescript
   // Before
   const listingId = item.listingId;
   
   // After
   const id = item.id;
   ```

2. **Update HubSnapshot consumption:**
   ```typescript
   // Before
   import { HubSnapshot } from "@/types/payload-types";
   const snapshot: HubSnapshot = await fetchHubSnapshot(type);
   const id = snapshot.featured[0].listingId;
   
   // After
   import { HubSnapshotResponse } from "@/lib/normalizers/hub";
   const snapshot: HubSnapshotResponse = await fetchHubSnapshot(type);
   const id = snapshot.featured[0].id;
   ```

3. **If you need finished events:**
   ```typescript
   // Add explicit filters
   const where = {
     eventStatus: { equals: 'finished' }, // or remove filter
     // ... other filters
   };
   ```

### For Backend Code:

1. **If you need profiles in search:**
   - Re-add `profiles` to `searchPlugin` collections in `payload.config.ts`

2. **If you need finished events:**
   - Remove `eventStatus` and `endDate` filters from queries
   - Or query with explicit `eventStatus: { equals: 'finished' }`

## 📊 COMMIT SUMMARY

1. `6e4beae` - feat(frontend): normalize listings to card data and support rich descriptions
2. `df3e14b` - feat(shared): add rich-text to plain-text utilities
3. `219a2c5` - feat(backend): filter finished events from all listing queries
4. `864ce02` - feat(backend): add automatic event status management
5. `4812c1b` - refactor(backend): remove profiles from search plugin
6. `7e4ca0f` - docs: add comprehensive event filtering implementation summary
7. `a18e010` - feat(frontend): filter finished events from all API routes
8. `98a6c64` - backend: transform listingId to id in hub endpoint response
9. `71a3971` - backend: update fallback cities format in hub snapshot builder
10. `eb1e0b6` - frontend: add HubSnapshotResponse type for transformed hub data
11. `dca745d` - frontend: update components to use centralized card normalization

## ⚠️ DEPLOYMENT NOTES

1. **Database:** No migrations required (changes are in application logic)
2. **Environment Variables:** 
   - `ENABLE_JOBS=true` - Required for event status scheduler
   - `SCHEDULER_EVENT_STATUS_INTERVAL_HOURS` - Optional (default: 24)
3. **Cache Invalidation:** 
   - Hub snapshots may need regeneration
   - ISR cache for listing pages may need clearing
4. **Search Index:** Profiles will be removed from search index on next rebuild

## 🐛 KNOWN ISSUES

None identified at this time.

---

**Generated:** 2025-12-19
**Base Commit:** f30136e96a76e8ed0d80a94bd9aaeb1ae0a9c00d
**Head Commit:** dca745d516060ecacca0e9fde0cce70aff6302c5

