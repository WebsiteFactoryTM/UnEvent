# Sitemap Implementation Documentation

**Status:** ✅ Implemented  
**Date:** January 2025  
**Auto-regeneration:** ✅ Enabled

---

## Overview

UnEvent now has a comprehensive sitemap system with automatic regeneration when listings are created, updated, or published. The sitemap is segmented for better performance and SEO.

---

## Sitemap Structure

### 1. Main Sitemap Index
**URL:** `https://unevent.ro/sitemap.xml`

Lists all segmented sitemaps. Updated dynamically.

**Implementation:** `apps/frontend/app/sitemap.xml/route.ts`

---

### 2. Segmented Sitemaps

#### A. Static Pages Sitemap
**URL:** `https://unevent.ro/sitemap-static.xml`

**Includes:**
- Homepage (/)
- Main listing type pages (/locatii, /servicii, /evenimente)
- Static pages (/despre, /contact, /politica-de-confidentialitate, etc.)

**Revalidation:** Every 1 hour

**Implementation:** `apps/frontend/app/sitemap-static.xml/route.ts`

---

#### B. Cities Sitemap
**URL:** `https://unevent.ro/sitemap-cities.xml`

**Includes:**
- All city hub pages for each listing type
- Format: `/{listingType}/oras/{city}`
- Example: `/locatii/oras/bucuresti`

**Data Source:** Fetches featured cities from PayloadCMS

**Revalidation:** Every 6 hours

**Implementation:** `apps/frontend/app/sitemap-cities.xml/route.ts`

---

#### C. Categories Sitemap
**URL:** `https://unevent.ro/sitemap-categories.xml`

**Includes:**
- All city + category combination pages (HUB pages)
- Format: `/{listingType}/oras/{city}/{category}`
- Example: `/locatii/oras/bucuresti/nunta`

**Data Source:** Fetches featured cities + active listing types from PayloadCMS

**Revalidation:** Every 6 hours

**Implementation:** `apps/frontend/app/sitemap-categories.xml/route.ts`

---

#### D. Listings Sitemaps (3 separate files)

**Locations:**  
**URL:** `https://unevent.ro/sitemap-listings-locatii.xml`

**Services:**  
**URL:** `https://unevent.ro/sitemap-listings-servicii.xml`

**Events:**  
**URL:** `https://unevent.ro/sitemap-listings-evenimente.xml`

**Includes:**
- All approved and published listing detail pages
- Format: `/{listingType}/{slug}`
- Example: `/locatii/salon-nora-bucuresti`

**Query Filter:**
```
where[moderationStatus][equals]=approved
where[_status][equals]=published
```

**Revalidation:** Every 1 hour

**Auto-regeneration:** ✅ Triggered when listings are created/updated

**Implementation:**
- `apps/frontend/app/sitemap-listings-locatii.xml/route.ts`
- `apps/frontend/app/sitemap-listings-servicii.xml/route.ts`
- `apps/frontend/app/sitemap-listings-evenimente.xml/route.ts`

---

## Auto-Regeneration System

### How It Works

When a listing is created, updated, or published in PayloadCMS, the sitemap automatically regenerates.

### Flow

1. **User creates/updates a listing** in PayloadCMS admin
2. **PayloadCMS hook triggers** (`afterChange` hook)
3. **Hook calls frontend API** at `/api/revalidate-sitemap`
4. **Frontend revalidates** the appropriate sitemap(s)
5. **Optional:** Pings Google about sitemap update

### Implementation Components

#### 1. Frontend API Route
**File:** `apps/frontend/app/api/revalidate-sitemap/route.ts`

**Endpoint:** `POST /api/revalidate-sitemap`

**Authentication:** Bearer token (REVALIDATE_SECRET or SVC_TOKEN)

**Request Body:**
```json
{
  "type": "locations" // or "services", "events", "all"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sitemap(s) revalidated for type: locations",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

#### 2. PayloadCMS Hook
**File:** `apps/backend/src/collections/Listings/_hooks/afterChange/regenerateSitemap.ts`

**Trigger Conditions:**
- Operation: `create` or `update`
- Status: `_status === 'published'`
- Moderation: `moderationStatus === 'approved'`

**Added to Collections:**
- ✅ Locations (`apps/backend/src/collections/Listings/Locations/index.ts`)
- ✅ Services (`apps/backend/src/collections/Listings/Services/index.tsx`)
- ✅ Events (`apps/backend/src/collections/Listings/Events/index.tsx`)

---

## Environment Variables

### Required

**Frontend:**
- `NEXT_PUBLIC_FRONTEND_URL` - Your site URL (e.g., `https://unevent.ro`)

**Backend:**
- `PAYLOAD_PUBLIC_FRONTEND_URL` - Frontend URL for hooks
- `REVALIDATE_SECRET` or `SVC_TOKEN` - Secret for authenticating revalidation requests

### Optional

**Backend:**
- `PING_GOOGLE_ON_SITEMAP_UPDATE=true` - Automatically ping Google when sitemap updates (recommended for production)

---

## Testing

### 1. Test Sitemap Access

Visit each sitemap URL in your browser:

```
https://unevent.ro/sitemap.xml
https://unevent.ro/sitemap-static.xml
https://unevent.ro/sitemap-cities.xml
https://unevent.ro/sitemap-categories.xml
https://unevent.ro/sitemap-listings-locatii.xml
https://unevent.ro/sitemap-listings-servicii.xml
https://unevent.ro/sitemap-listings-evenimente.xml
```

**Expected:** Valid XML with URLs

### 2. Test Auto-Regeneration

1. Create a new listing in PayloadCMS
2. Set it to "Published" and "Approved"
3. Check backend logs for:
   ```
   [Sitemap Regeneration] Triggering sitemap update for locations (create)
   [Sitemap Regeneration] Success: Sitemap(s) revalidated for type: locations
   ```
4. Wait 1 hour or manually revalidate
5. Check the appropriate sitemap - new listing should appear

### 3. Manual Regeneration (for testing)

```bash
curl -X POST https://unevent.ro/api/revalidate-sitemap \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"all"}'
```

---

## Troubleshooting

### Sitemap returns 404
- Check that routes are deployed
- Verify `apps/frontend/app/sitemap.xml/route.ts` exists
- Check build logs for errors

### Sitemap is empty
- Check PayloadCMS API is accessible
- Verify `API_URL` environment variable
- Check filters (moderationStatus, _status)
- Check PayloadCMS logs for query errors

### Auto-regeneration not working
- Verify `REVALIDATE_SECRET` is set on both frontend and backend
- Check backend logs when creating listings
- Verify hook is imported and added to `afterChange` array
- Check network connectivity between backend and frontend

### New listings not appearing in sitemap
- Wait for revalidation period (1 hour for listings sitemap)
- Or manually trigger revalidation
- Verify listing is "published" and "approved"
- Check sitemap URL directly in browser

---

## Google Search Console Setup

### 1. Submit Sitemaps

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Navigate to "Sitemaps" section
4. Submit each sitemap URL:
   - `https://unevent.ro/sitemap.xml`
   - `https://unevent.ro/sitemap-cities.xml`
   - `https://unevent.ro/sitemap-categories.xml`
   - `https://unevent.ro/sitemap-listings-locatii.xml`
   - `https://unevent.ro/sitemap-listings-servicii.xml`
   - `https://unevent.ro/sitemap-listings-evenimente.xml`

### 2. Monitor Status

- Check "Coverage" report for indexation status
- Monitor for errors
- Track which pages are indexed

### 3. Request Indexing

For important new pages, request immediate indexing:
1. Go to URL Inspection tool
2. Enter the URL
3. Click "Request Indexing"

---

## Performance Considerations

### Caching

- **Static pages:** 1 hour cache
- **Cities:** 6 hours cache
- **Categories:** 6 hours cache
- **Listings:** 1 hour cache

### Limits

- Listings per sitemap: 5,000 (current query limit)
- If you exceed 5,000 listings per type, implement pagination:
  - Create multiple sitemap files (e.g., `sitemap-listings-locatii-1.xml`, `sitemap-listings-locatii-2.xml`)
  - Update main sitemap index to reference all pages

### Optimization

- Sitemaps are generated on-demand (not pre-built)
- Uses Next.js caching for performance
- CDN caching via `s-maxage` headers

---

## Future Enhancements

### Planned Improvements

1. **Profile Pages Sitemap**
   - Add sitemap for public user profiles
   - URL: `/sitemap-profiles.xml`

2. **Image Sitemap**
   - Include images in separate sitemap
   - URL: `/sitemap-images.xml`
   - Helps with Google Image Search

3. **Video Sitemap** (if YouTube embeds)
   - Include video content
   - URL: `/sitemap-videos.xml`

4. **Pagination for Large Sitemaps**
   - Split listings into multiple files if > 5,000 per type
   - Implement `sitemap-listings-locatii-1.xml`, etc.

5. **Lastmod Tracking**
   - Use actual `updatedAt` timestamp from listings
   - Currently uses current timestamp

6. **Priority Calculation**
   - Dynamic priority based on rating, views, featured status
   - Currently uses fixed priorities

---

## Maintenance

### Regular Checks

**Weekly:**
- Verify all sitemaps are accessible
- Check Google Search Console for errors
- Monitor indexation coverage

**Monthly:**
- Review sitemap sizes (URLs per file)
- Check for any 404s in sitemap URLs
- Validate XML structure

**Quarterly:**
- Review and update priorities if needed
- Optimize changefreq values based on actual update patterns
- Consider adding new sitemap categories

### Updates Required When:

- Adding new listing types → Create new sitemap file
- Changing URL structure → Update all sitemap routes
- Adding new static pages → Update `sitemap-static.xml`
- Restructuring city pages → Update `sitemap-cities.xml`

---

## Related Files

### Frontend
- `apps/frontend/app/sitemap.xml/route.ts`
- `apps/frontend/app/sitemap-static.xml/route.ts`
- `apps/frontend/app/sitemap-cities.xml/route.ts`
- `apps/frontend/app/sitemap-categories.xml/route.ts`
- `apps/frontend/app/sitemap-listings-locatii.xml/route.ts`
- `apps/frontend/app/sitemap-listings-servicii.xml/route.ts`
- `apps/frontend/app/sitemap-listings-evenimente.xml/route.ts`
- `apps/frontend/app/api/revalidate-sitemap/route.ts`
- `apps/frontend/public/robots.txt`

### Backend
- `apps/backend/src/collections/Listings/_hooks/afterChange/regenerateSitemap.ts`
- `apps/backend/src/collections/Listings/Locations/index.ts`
- `apps/backend/src/collections/Listings/Services/index.tsx`
- `apps/backend/src/collections/Listings/Events/index.tsx`

---

## Support

For issues or questions:
1. Check backend logs for hook execution
2. Check frontend logs for API calls
3. Verify environment variables are set
4. Test manual revalidation API call
5. Check Google Search Console for indexation issues

---

**Last Updated:** January 2025  
**Status:** Production Ready ✅  
**Auto-Regeneration:** Active ✅

