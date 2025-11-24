# Testing Taxonomies BFF Migration

## Prerequisites

### 1. Environment Variables

Ensure these are set in your `.env.local` (frontend) and backend environment:

**Frontend (`apps/frontend/.env.local`):**
```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000
API_URL=http://localhost:4000  # Used by BFF route

# Service token for BFF → Payload calls
SVC_TOKEN=your-payload-api-key-here

# Frontend URL (for server-side calls)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Revalidation endpoint URL (for backend to call)
NEXT_PRIV_REVALIDATE_URL=http://localhost:3000/api/revalidate
```

**Backend (`apps/backend/.env` or similar):**
```bash
# Frontend URL for revalidation
PAYLOAD_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PRIV_REVALIDATE_URL=http://localhost:3000/api/revalidate

# Service token (same as frontend)
SVC_TOKEN=your-payload-api-key-here
```

### 2. Get Service Token (SVC_TOKEN)

1. Start backend: `pnpm dev:backend`
2. Go to Payload Admin: `http://localhost:4000/admin`
3. Navigate to Users → Create/select service user (e.g., `bff@unevent.app`)
4. Generate API Key → Copy the key
5. Add to both frontend and backend `.env` files as `SVC_TOKEN`

---

## Test 1: BFF Route Direct Access

### Test the endpoint directly:

```bash
# Test basic endpoint
curl -I http://localhost:3000/api/public/taxonomies

# Test with fullList parameter
curl http://localhost:3000/api/public/taxonomies?fullList=1 | jq

# Check response headers
curl -v http://localhost:3000/api/public/taxonomies 2>&1 | grep -i "cache\|surrogate"
```

**Expected Results:**
- ✅ Status: `200 OK`
- ✅ Headers include:
  - `Cache-Control: public, s-maxage=86400, stale-while-revalidate=86400`
  - `Surrogate-Key: taxonomies tenant:unevent`
- ✅ Response body contains: `eventTypes`, `locationTypes`, `serviceTypes`, `facilities`

**If errors:**
- `500` with "SVC_TOKEN not configured" → Add `SVC_TOKEN` to env
- `500` with "PAYLOAD_INTERNAL_URL not configured" → Add `API_URL` or `NEXT_PUBLIC_API_URL`
- `401` or `403` from Payload → Check `SVC_TOKEN` is valid and user has read permissions

---

## Test 2: Cache Behavior

### 2.1 First Request (Cache MISS)

```bash
# First request - should be MISS
curl -v http://localhost:3000/api/public/taxonomies 2>&1 | grep -i "x-vercel-cache\|cf-cache-status"
```

**Expected:** `x-vercel-cache: MISS` (or no header in dev mode)

### 2.2 Second Request (Cache HIT)

```bash
# Second request immediately after - should be HIT
curl -v http://localhost:3000/api/public/taxonomies 2>&1 | grep -i "x-vercel-cache\|cf-cache-status"
```

**Expected:** `x-vercel-cache: HIT` (in production/Vercel)

**Note:** In local dev, Next.js might not show cache headers, but the route should still work.

---

## Test 3: Frontend Integration

### 3.1 Test Server Component Usage

Create a test page or check existing usage:

```tsx
// Example: apps/frontend/app/test-taxonomies/page.tsx
import { fetchTaxonomies } from '@/lib/api/taxonomies'

export default async function TestTaxonomies() {
  const taxonomies = await fetchTaxonomies({ fullList: false })
  
  return (
    <div>
      <h1>Taxonomies Test</h1>
      <pre>{JSON.stringify(taxonomies, null, 2)}</pre>
    </div>
  )
}
```

Visit: `http://localhost:3000/test-taxonomies`

**Expected:**
- ✅ Page loads without errors
- ✅ Taxonomies data displays correctly
- ✅ No console errors

### 3.2 Test React Query Hook

If using the React Query hook:

```tsx
import { useTaxonomies } from '@/lib/react-query/taxonomies.queries'

export function TestComponent() {
  const { data, isLoading } = useTaxonomies({ fullList: false })
  
  if (isLoading) return <div>Loading...</div>
  
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
```

**Expected:**
- ✅ Hook fetches data successfully
- ✅ Data is cached by React Query
- ✅ No errors in console

---

## Test 4: Cache Revalidation

### 4.1 Update a Taxonomy in Payload

1. Start backend: `pnpm dev:backend`
2. Go to Payload Admin: `http://localhost:4000/admin`
3. Navigate to **Listing Types** or **Facilities**
4. Edit any taxonomy item (change title, add description, etc.)
5. Save

### 4.2 Verify Revalidation Triggered

**Check Backend Logs:**
```bash
# Look for revalidation log message
# Should see: "Revalidated X tag(s): taxonomies, tenant:unevent, ..."
```

**Check Frontend Logs:**
```bash
# In Next.js dev server logs, you might see cache revalidation
```

### 4.3 Verify Cache Cleared

```bash
# Request the endpoint again
curl -v http://localhost:3000/api/public/taxonomies 2>&1 | grep -i "cache"

# Should see MISS again (cache was cleared)
```

**Expected:**
- ✅ Backend logs show revalidation success
- ✅ Next request shows fresh data (updated taxonomy appears)
- ✅ Cache headers indicate fresh fetch

---

## Test 5: Revalidate Endpoint

### Test the revalidate endpoint directly:

```bash
# Test POST to revalidate endpoint
curl -X POST http://localhost:3000/api/revalidate \
  -H "Authorization: Bearer YOUR_SVC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["taxonomies", "tenant:unevent"]}'
```

**Expected:**
- ✅ Status: `200 OK`
- ✅ Response: `{"ok": true, "count": 2}`

**If errors:**
- `401 Unauthorized` → Check `SVC_TOKEN` matches Authorization header
- `400 Bad Request` → Ensure body is `{"tags": ["string", ...]}`

---

## Test 6: Error Scenarios

### 6.1 Missing SVC_TOKEN

```bash
# Temporarily remove SVC_TOKEN from env
# Request should fail gracefully
curl http://localhost:3000/api/public/taxonomies
```

**Expected:** `500` with error message

### 6.2 Invalid SVC_TOKEN

```bash
# Set invalid token
export SVC_TOKEN=invalid-token
# Restart frontend
# Request should fail
curl http://localhost:3000/api/public/taxonomies
```

**Expected:** `500` or `401` from Payload

### 6.3 Backend Down

```bash
# Stop backend server
# Request should fail gracefully
curl http://localhost:3000/api/public/taxonomies
```

**Expected:** `500` with "Upstream error"

---

## Test 7: Performance Check

### Compare response times:

```bash
# Direct Payload call (old way)
time curl http://localhost:4000/api/taxonomies

# BFF route (new way)
time curl http://localhost:3000/api/public/taxonomies
```

**Expected:**
- ✅ BFF route should be similar or faster (after first request, due to caching)
- ✅ Subsequent requests should be much faster (cached)

---

## Verification Checklist

- [ ] BFF route returns taxonomies data correctly
- [ ] Cache headers are present (`Cache-Control`, `Surrogate-Key`)
- [ ] First request = MISS, second request = HIT (in production)
- [ ] Frontend `fetchTaxonomies()` works without errors
- [ ] React Query hooks work (if used)
- [ ] Updating taxonomy in Payload triggers revalidation
- [ ] Revalidation endpoint accepts POST with tags
- [ ] Cache is cleared after revalidation
- [ ] Error scenarios handled gracefully
- [ ] No console errors in browser
- [ ] No errors in server logs

---

## Troubleshooting

### Issue: "Cannot find module '@unevent/shared'"

**Solution:**
```bash
# Reinstall dependencies
pnpm install

# Verify path mappings in tsconfig.json
# Should have: "@unevent/shared": ["../../packages/shared/keys.ts"]
```

### Issue: Revalidation not working

**Check:**
1. `NEXT_PRIV_REVALIDATE_URL` is set correctly in backend
2. `SVC_TOKEN` matches in both frontend and backend
3. Backend can reach frontend URL (check network/firewall)
4. Check backend logs for revalidation errors

### Issue: Cache not working

**Check:**
1. Route has `export const dynamic = "force-static"` and `export const revalidate = 86400`
2. Fetch has `cache: "force-cache"` and `next: { tags: [...] }`
3. In production, Vercel edge caching should work automatically

### Issue: 401 Unauthorized from Payload

**Check:**
1. `SVC_TOKEN` is valid Payload API key
2. Service user has read permissions
3. Authorization header format: `users API-Key ${SVC_TOKEN}` (note: `users` is the collection slug)

---

## Next Steps

Once taxonomies migration is verified:
1. Monitor cache hit rates in production
2. Check revalidation logs for any issues
3. Proceed with migrating other endpoints (listings, hub, home)

