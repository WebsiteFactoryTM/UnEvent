# Solving the Favorites N+1 Query Problem

## Problem

When displaying multiple listings (e.g., in a grid or list), each listing card calls `useFavorites()` individually, resulting in N separate API calls to check if each item is favorited. For example, rendering 50 listings = 50 API requests.

**Example from Sentry:**
```
N+1 API Calls to: /api/favorites/checkIfIsFavorited
- locations:29
- locations:27
- services:22
- events:12
- ... (50+ more calls)
```

## Solution: Batch Endpoint

We've created a `/api/favorites/checkBatch` endpoint that accepts multiple `targetKeys` at once and returns a map of results.

### Backend Implementation

**Endpoint:** `GET /api/favorites/checkBatch?targetKeys=locations:1,events:2,services:3`

**Response:**
```json
{
  "locations:1": true,
  "events:2": false,
  "services:3": true
}
```

### Frontend Usage

#### Option 1: Direct Batch Call (Recommended for SSR/Lists)

Use this when you have all listings upfront (e.g., server components, archive pages):

```typescript
import { checkBatchFavorites } from "@/lib/api/favorites";

// In your component or data-fetching function
const listings = await getListings(); // Array of listings

// Build targetKeys
const targetKeys = listings.map(
  (listing) => `${listingType}:${listing.id}`
);

// Single batch call instead of N individual calls
const favoritesMap = await checkBatchFavorites(targetKeys, accessToken);

// Use the map when rendering
{listings.map((listing) => {
  const isFavorited = favoritesMap[`${listingType}:${listing.id}`];
  return <ListingCard {...listing} isFavorited={isFavorited} />;
})}
```

#### Option 2: Keep Using `useFavorites()` (For Individual Items)

For single listing detail pages or when you don't have all items upfront, continue using `useFavorites()`:

```typescript
import { useFavorites } from "@/hooks/useFavorites";

function ListingDetailPage({ listing }) {
  const { isFavorited, toggle } = useFavorites({
    listingType: "locatii",
    listingId: listing.id,
  });

  // ... rest of component
}
```

## When to Use Which Approach

| Scenario | Use |
|----------|-----|
| Archive/grid pages with many listings | **Batch endpoint** (`checkBatchFavorites`) |
| Single listing detail page | Individual hook (`useFavorites`) |
| Infinite scroll (known items) | **Batch endpoint** for each page |
| Real-time favorite toggling | Individual hook (`useFavorites`) |

## Migration Example

### Before (N+1 Problem)

```typescript
// ❌ This causes N API calls
function ListingsGrid({ listings }) {
  return listings.map((listing) => (
    <ListingCard
      key={listing.id}
      listing={listing}
      // useFavorites called N times = N API calls
    />
  ));
}

function ListingCard({ listing }) {
  const { isFavorited, toggle } = useFavorites({
    listingType: "locatii",
    listingId: listing.id,
  });
  // ...
}
```

### After (1 Batch Call)

```typescript
// ✅ This causes 1 API call for all listings
async function ListingsGrid({ listings }) {
  const accessToken = await getAccessToken();
  
  // Single batch call
  const targetKeys = listings.map((l) => `locations:${l.id}`);
  const favoritesMap = await checkBatchFavorites(targetKeys, accessToken);

  return listings.map((listing) => (
    <ListingCard
      key={listing.id}
      listing={listing}
      initialIsFavorited={favoritesMap[`locations:${listing.id}`]}
    />
  ));
}

function ListingCard({ listing, initialIsFavorited }) {
  // useFavorites still works, but uses initialIsFavorited from props
  // and won't make an API call thanks to caching
  const { isFavorited, toggle } = useFavorites({
    listingType: "locatii",
    listingId: listing.id,
    initialIsFavorited, // 👈 Pre-populate from batch call
  });
  // ...
}
```

## Performance Impact

- **Before:** 50 listings = 50 API calls + 50 DB queries
- **After:** 50 listings = 1 API call + 1 DB query (with `IN` clause)

**Result:** 50x reduction in API calls and database queries! 🚀

## Caching Strategy

The `useFavorites` hook already has aggressive caching (10-minute stale time). When you provide `initialIsFavorited` from the batch call:

1. Batch call happens once (SSR or first render)
2. Individual `useFavorites` calls use the batch result as initial data
3. Hook's cache prevents refetching for 10 minutes
4. User interactions (toggle) update the cache optimistically

## Implementation Checklist

- [x] Backend: Create `/api/favorites/checkBatch` endpoint
- [x] Frontend: Add `checkBatchFavorites()` function
- [ ] Update archive pages to use batch endpoint
- [ ] Update homepage grids to use batch endpoint
- [ ] Test with Sentry to verify N+1 is resolved
- [ ] Monitor performance improvements

## Testing

To verify the fix works:

1. Open DevTools Network tab
2. Navigate to an archive page (e.g., `/locatii`)
3. Check for `/api/favorites/` requests
4. **Before:** Should see many individual `checkIfIsFavorited` calls
5. **After:** Should see one `checkBatch` call

## Notes

- The batch endpoint limits to 100 items max (configurable in `checkBatchFavorites.ts`)
- For pagination, call batch endpoint for each page of results
- The individual `useFavorites` hook is still useful for detail pages and real-time updates

