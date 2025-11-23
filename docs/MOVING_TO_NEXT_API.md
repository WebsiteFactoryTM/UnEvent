# MOVING_TO_NEXT_API.md

> **Goal:** Move Unevent’s read endpoints to **Next.js BFF route handlers** so we get **edge/CDN caching, instant purge-by-tag, security, and observability**—without rewriting your Payload logic.  
> **Scope (this doc):** Reads only (public data). Writes stay uncached with `Cache-Control: no-store`.

---

## TL;DR – What you’ll do

1) **Add BFF routes** under `/app/api/public/...` that call your existing helpers (now placed in `lib/payload/*`).  
2) In each BFF route, set **`Cache-Control`** and **`Surrogate-Key` tags** and use **Next tags** (`next: { tags: [] }`) for revalidation.  
3) Implement a **single Payload `afterChange` hook** that **purges CDN by tags** and calls **Next revalidation**.  
4) Point your UI (and any partners/mobile) at **the new `/api/public/...` URLs**.  
5) Verify with curl/browser devtools that hits are **served from CDN** and **purge on edit is instant**.

---

## Prerequisites

- **CDN**: Cloudflare (recommended) or Fastly, sitting in front of your Next.js app domain.  
- **Service auth** for server-to-server reads: `SVC_TOKEN` (env) used only from BFF routes to talk to Payload.  
- **Payload v3** with a way to run hooks on `afterChange` per collection.  
- **Next.js 15** (Route Handlers).

---

## Mapping: Old helpers → New BFF routes

| Old helper / Surface | New BFF route | Cache policy | Tags (examples) |
|---|---|---|---|
| `lib/api/taxonomies.ts` | `GET /api/public/taxonomies?fullList=0|1` | `s-maxage=86400, swr=86400` | `taxonomies`, `tenant:unevent` |
| `fetchListing(type, slug)` | `GET /api/public/listings/:type/:slug` | `s-maxage=300, swr=600` | `listing:slug:{slug}`, `collection:{type}`, `tenant:unevent`, `city:{citySlug}` |
| `fetchTopListings(type, limit)` | `GET /api/public/listings/:type/top?limit=12` | `s-maxage=600, swr=600` | `top:{type}`, `collection:{type}` |
| `fetchSimilarListings(...)` | `GET /api/public/listings/:type/similar?...` | `s-maxage=60, swr=120` | `similar:{type}`, `city:{id}`, `exclude:{id}` |
| Hub – popular cities | `GET /api/public/hub/cities/popular?limit=6` | `s-maxage=3600, swr=3600` | `cities:popular` |
| Hub – cities typeahead | `GET /api/public/hub/cities/typeahead?limit=50` | `s-maxage=3600, swr=3600` | `cities:typeahead` |
| Hub – featured per type | `GET /api/public/hub/featured/:type?limit=12` | `s-maxage=600, swr=600` | `featured:{type}`, `collection:{type}` |
| Hub – top by city | `GET /api/public/hub/top-by-city/:type?cityId=...&limit=9` | `s-maxage=600, swr=600` | `city:{id}`, `top:{type}` |
| Hub – snapshot per type | `GET /api/public/hub/snapshot/:type` | `s-maxage=3600, swr=3600` | `hub:{type}` |
| Home feed (public) | `GET /api/public/home` | `s-maxage=120, swr=300` | `home`, `city:{id}` |

> **Note:** These are **read-only** and safe to cache. Any authenticated dashboards or writes remain behind uncached endpoints with `Cache-Control: no-store`.

---

## 1) Example: Taxonomies (was `lib/api/taxonomies.ts`)

**Route file:** `app/api/public/taxonomies/route.ts`
```ts
// app/api/public/taxonomies/route.ts
export const dynamic = 'force-static';
export const revalidate = 86400; // 24h
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fullList = url.searchParams.get('fullList') === '1';

  const res = await fetch(`${process.env.PAYLOAD_INTERNAL_URL}/api/taxonomies?fullList=${fullList ? '1':'0'}`, {
    headers: {
      'x-tenant': 'unevent',
      'Authorization': `Bearer ${process.env.SVC_TOKEN}`
    },
    cache: 'force-cache',
    next: { tags: ['taxonomies'] }
  });

  if (!res.ok) return new Response('Upstream error', { status: res.status });

  const data = await res.json();

  // Optional: normalize/sort here so everyone gets consistent ordering
  for (const k of Object.keys(data)) {
    if (Array.isArray(data[k])) data[k].sort((a:any,b:any)=>String(a.title).localeCompare(b.title));
  }

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
      'Surrogate-Key': 'taxonomies tenant:unevent'
    }
  });
}
```

**Purge trigger (Payload hook):**
- When any taxonomy changes → purge tag `taxonomies` and revalidate tag `taxonomies`.

---

## 2) Example: Listing detail (was `fetchListing(type, slug)`)

**Route file:** `app/api/public/listings/[type]/[slug]/route.ts`
```ts
// app/api/public/listings/[type]/[slug]/route.ts
export const dynamic = 'force-static';
export const revalidate = 300; // 5m
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

type Params = { params: { type: 'events'|'venues'|'services', slug: string } };

export async function GET(_: Request, { params }: Params) {
  const { type, slug } = params;
  const url = `${process.env.PAYLOAD_INTERNAL_URL}/api/${type}/${encodeURIComponent(slug)}`;

  const res = await fetch(url, {
    headers: {
      'x-tenant': 'unevent',
      'Authorization': `Bearer ${process.env.SVC_TOKEN}`
    },
    cache: 'force-cache',
    next: { tags: [`listing:slug:${slug}`, `collection:${type}`] }
  });

  if (!res.ok) return new Response('Not found', { status: res.status });
  const data = await res.json();

  const citySlug = data?.city?.slug ? ` city:${data.city.slug}` : '';

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      'Surrogate-Key': `listing:slug:${slug} collection:${type} tenant:unevent${citySlug}`
    }
  });
}
```

**Purge trigger:**
- On listing update (in its collection): purge `listing:slug:{slug}`, `collection:{type}`, `city:{citySlug}`.

---

## 3) Example: Top listings (was `fetchTopListings(type, limit)`)

**Route file:** `app/api/public/listings/[type]/top/route.ts`
```ts
// app/api/public/listings/[type]/top/route.ts
export const dynamic = 'force-static';
export const revalidate = 600;
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

type Params = { params: { type: 'events'|'venues'|'services' } };

export async function GET(req: Request, { params }: Params) {
  const limit = Math.min(50, Number(new URL(req.url).searchParams.get('limit') || 12));
  const url = `${process.env.PAYLOAD_INTERNAL_URL}/api/${params.type}/top?limit=${limit}`;

  const res = await fetch(url, {
    headers: {
      'x-tenant': 'unevent',
      'Authorization': `Bearer ${process.env.SVC_TOKEN}`
    },
    cache: 'force-cache',
    next: { tags: [`top:${params.type}`, `collection:${params.type}`] }
  });

  if (!res.ok) return new Response('Upstream error', { status: res.status });
  const data = await res.json();

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=600',
      'Surrogate-Key': `top:${params.type} collection:${params.type} tenant:unevent`
    }
  });
}
```

**Purge trigger:** when ranking/tier changes for any item in `:type`, purge `top:{type}`.

---

## 4) Example: Similar listings (was `fetchSimilarListings(...)`)

**Route file:** `app/api/public/listings/[type]/similar/route.ts`
```ts
// app/api/public/listings/[type]/similar/route.ts
export const dynamic = 'force-static';
export const revalidate = 60;
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

function normalize(params: URLSearchParams) {
  // allowlist + canonical order to avoid duplicate cache keys
  const allowed = ['cityId','suitableFor','excludeId','limit'];
  const obj: Record<string,string> = {};
  for (const k of allowed) if (params.get(k)) obj[k] = params.get(k)!;
  const pairs = Object.entries(obj).sort(([a],[b])=>a.localeCompare(b));
  return new URLSearchParams(pairs as any).toString();
}

type Params = { params: { type: 'events'|'venues'|'services' } };

export async function GET(req: Request, { params }: Params) {
  const q = normalize(new URL(req.url).searchParams);
  const url = `${process.env.PAYLOAD_INTERNAL_URL}/api/${params.type}/similar?${q}`;

  const res = await fetch(url, {
    headers: {
      'x-tenant': 'unevent',
      'Authorization': `Bearer ${process.env.SVC_TOKEN}`
    },
    cache: 'force-cache',
    next: { tags: [`similar:${params.type}`] }
  });

  if (!res.ok) return new Response('Upstream error', { status: res.status });
  const data = await res.json();

  // Tag refinement for better purge targeting
  const cityId = new URLSearchParams(q).get('cityId');
  const excludeId = new URLSearchParams(q).get('excludeId');
  const extraTags = `${cityId ? ` city:${cityId}` : ''}${excludeId ? ` exclude:${excludeId}` : ''}`;

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      'Surrogate-Key': `similar:${params.type} tenant:unevent${extraTags}`
    }
  });
}
```

**Purge trigger:** when a listing’s city/suitableFor changes or the excluded listing changes, purge `similar:{type}`, `city:{id}`, and `exclude:{id}` if applicable.

---

## 5) Examples: Hub endpoints (were in `lib/api/hub.ts`)

### Popular cities
`app/api/public/hub/cities/popular/route.ts`
```ts
export const dynamic = 'force-static';
export const revalidate = 3600;
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

export async function GET() {
  const res = await fetch(`${process.env.PAYLOAD_INTERNAL_URL}/api/hub/cities/popular`, {
    headers: { 'x-tenant':'unevent', 'Authorization':`Bearer ${process.env.SVC_TOKEN}` },
    cache: 'force-cache',
    next: { tags: ['cities:popular'] }
  });
  if (!res.ok) return new Response('Upstream error', { status: res.status });
  const data = await res.json();
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600',
      'Surrogate-Key': 'cities:popular tenant:unevent'
    }
  });
}
```

### Cities typeahead
`app/api/public/hub/cities/typeahead/route.ts`
```ts
export const dynamic = 'force-static';
export const revalidate = 3600;
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

export async function GET() {
  const res = await fetch(`${process.env.PAYLOAD_INTERNAL_URL}/api/hub/cities/typeahead`, {
    headers: { 'x-tenant':'unevent', 'Authorization':`Bearer ${process.env.SVC_TOKEN}` },
    cache: 'force-cache',
    next: { tags: ['cities:typeahead'] }
  });
  if (!res.ok) return new Response('Upstream error', { status: res.status });
  const data = await res.json();
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600',
      'Surrogate-Key': 'cities:typeahead tenant:unevent'
    }
  });
}
```

### Featured per type
`app/api/public/hub/featured/[type]/route.ts`
```ts
export const dynamic = 'force-static';
export const revalidate = 600;
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

type Params = { params: { type: 'events'|'venues'|'services' } };

export async function GET(req: Request, { params }: Params) {
  const limit = Math.min(50, Number(new URL(req.url).searchParams.get('limit') || 12));
  const res = await fetch(`${process.env.PAYLOAD_INTERNAL_URL}/api/hub/featured/${params.type}?limit=${limit}`, {
    headers: { 'x-tenant':'unevent', 'Authorization':`Bearer ${process.env.SVC_TOKEN}` },
    cache: 'force-cache',
    next: { tags: [`featured:${params.type}`, `collection:${params.type}`] }
  });
  if (!res.ok) return new Response('Upstream error', { status: res.status });
  const data = await res.json();
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=600',
      'Surrogate-Key': `featured:${params.type} collection:${params.type} tenant:unevent`
    }
  });
}
```

### Top by city
`app/api/public/hub/top-by-city/[type]/route.ts`
```ts
export const dynamic = 'force-static';
export const revalidate = 600;
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

type Params = { params: { type: 'events'|'venues'|'services' } };

export async function GET(req: Request, { params }: Params) {
  const url = new URL(req.url);
  const cityId = url.searchParams.get('cityId');
  const limit = Math.min(50, Number(url.searchParams.get('limit') || 9));
  if (!cityId) return new Response('cityId required', { status: 400 });

  const res = await fetch(`${process.env.PAYLOAD_INTERNAL_URL}/api/hub/top-by-city/${params.type}?cityId=${cityId}&limit=${limit}`, {
    headers: { 'x-tenant':'unevent', 'Authorization':`Bearer ${process.env.SVC_TOKEN}` },
    cache: 'force-cache',
    next: { tags: [`city:${cityId}`, `top:${params.type}`] }
  });
  if (!res.ok) return new Response('Upstream error', { status: res.status });
  const data = await res.json();
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=600',
      'Surrogate-Key': `city:${cityId} top:${params.type} tenant:unevent`
    }
  });
}
```

### Snapshot per type
`app/api/public/hub/snapshot/[type]/route.ts`
```ts
export const dynamic = 'force-static';
export const revalidate = 3600;
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

type Params = { params: { type: 'events'|'venues'|'services' } };

export async function GET(_: Request, { params }: Params) {
  const res = await fetch(`${process.env.PAYLOAD_INTERNAL_URL}/api/hub/snapshot/${params.type}`, {
    headers: { 'x-tenant':'unevent', 'Authorization':`Bearer ${process.env.SVC_TOKEN}` },
    cache: 'force-cache',
    next: { tags: [`hub:${params.type}`] }
  });
  if (!res.ok) return new Response('Upstream error', { status: res.status });
  const data = await res.json();
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600',
      'Surrogate-Key': `hub:${params.type} tenant:unevent`
    }
  });
}
```

---

## 6) Example: Home feed (was in `lib/api/home.ts`)

**Route file:** `app/api/public/home/route.ts`
```ts
export const dynamic = 'force-static';
export const revalidate = 120; // 2m
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

export async function GET(req: Request) {
  // If you geo-target, forward explicit city id/slug (not cookies) to avoid cache fragmentation.
  const city = new URL(req.url).searchParams.get('city');
  const upstream = `${process.env.PAYLOAD_INTERNAL_URL}/api/home${city ? `?city=${encodeURIComponent(city)}`:''}`;

  const res = await fetch(upstream, {
    headers: {
      'x-tenant':'unevent',
      'Authorization': `Bearer ${process.env.SVC_TOKEN}` // service token only
    },
    cache: 'force-cache',
    next: { tags: ['home'].concat(city ? [`city:${city}`] : []) }
  });

  if (!res.ok) return new Response('Upstream error', { status: res.status });
  const data = await res.json();

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      'Surrogate-Key': `home tenant:unevent${city ? ` city:${city}` : ''}`
    }
  });
}
```

**Important:** Remove per-user `Authorization` on public reads; keep personalization as a light client-side enhancement (after first paint).

---

## 7) Single purge/revalidation hook (Payload side)

If **Payload runs in the same Next.js process**, you can call `revalidateTag` directly. If it runs separately, expose a **private revalidate endpoint** in Next, and call CDN purge via HTTPS.

**Shared util (Node):** `lib/cdn.ts`
```ts
export async function purgeByTags(tags: string[]) {
  const endpoint = process.env.CF_PURGE_ENDPOINT!; // e.g., Cloudflare API endpoint
  const zoneId = process.env.CF_ZONE_ID!;
  const token  = process.env.CF_API_TOKEN!;

  const r = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags })
  });
  if (!r.ok) console.error('CDN purge failed', await r.text());
}
```

**Payload `afterChange` hook (simplified):** `payload/hooks/afterChange.ts`
```ts
// If co-located with Next: import { revalidateTag } from 'next/cache';
async function revalidate(tags: string[]) {
  // If Next is separate, POST to a private revalidate endpoint instead
  await fetch(process.env.NEXT_PRIV_REVALIDATE_URL!, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.INTERNAL_TOKEN}`, 'Content-Type':'application/json' },
    body: JSON.stringify({ tags })
  });
}

export default async function afterChange({ collection, doc }: any) {
  const tags = new Set<string>(['tenant:unevent']);

  if (collection === 'taxonomies') tags.add('taxonomies');

  if (['events','venues','services'].includes(collection)) {
    tags.add(`collection:${collection}`);
    if (doc?.slug) tags.add(`listing:slug:${doc.slug}`);
    if (doc?.city?.slug) tags.add(`city:${doc.city.slug}`);
    // Similar/top/featured rely on collection or city changes, so their tags get added too:
    tags.add(`similar:${collection}`);
    tags.add(`top:${collection}`);
    tags.add(`featured:${collection}`);
  }

  if (collection === 'cities') {
    tags.add('cities:popular');
    tags.add('cities:typeahead');
    if (doc?.slug) tags.add(`city:${doc.slug}`);
  }

  // Home aggregates many things; conservative revalidation:
  tags.add('home');

  const list = Array.from(tags);
  await purgeByTags(list);
  await revalidate(list);
}
```

---

## 8) Observability & guardrails

- **Log per-route latency** and cache status (`cf-cache-status` header from Cloudflare).  
- **Alert** on 5xx and p95 latency spikes for `/api/public/*`.  
- **Rate limit** the public BFF routes (IP-based) to protect origin on cache misses.  
- **No cookies** on public pages; avoid `Vary: *` headers—keep the cache key clean (path+query).

---

## 9) Test checklist

- `curl -I https://yourdomain.com/api/public/taxonomies` → see `Cache-Control` and `Surrogate-Key` headers.  
- First call: Cloudflare header shows **MISS**; second call: **HIT**.  
- Edit a taxonomy in Payload → observe **immediate** HIT → MISS → refreshed HIT after purge+revalidate.  
- Try `listings/:type/:slug` and `similar` with different query parameter orders—confirm same cache key (HIT).  
- Ensure **no `Authorization`** header is required for public reads.

---

## 10) Cutover plan (safe & fast)

1) **Implement** the routes above + the purge hook.  
2) **Ship behind a flag** and duplicate traffic from UI to new BFF in logs (shadow).  
3) **Flip reads** in UI to `/api/public/...` for: taxonomies → listing detail → top → similar → hub → home (in that order).  
4) **Restrict Payload** reads to your VPC/IP allowlist (optional, recommended).  
5) Remove redundant Redis entries once CDN hit-rates are healthy.

---

## Rollback

If anything misbehaves, switch UI back to old helpers (feature flag). Since BFF only **wraps** your existing calls, rollback is trivial.

---

## FAQs

- **Is this only for reads?** Yes—edge/CDN caching is read-only. Writes go through BFF too but with `Cache-Control: no-store`, validation, and rate limits.  
- **Will this break draft previews?** Add `?draft=1` to your BFF read routes to **bypass cache** and require auth; set `Cache-Control: no-store` for that branch.  
- **Do I still need Redis?** Often not for public reads once CDN is in place. Keep it only for truly compute-heavy aggregates.

---

**Done.** Start with `taxonomies`, `listings/:type/:slug`, and `listings/:type/similar`. Verify purging works, then migrate the rest.
