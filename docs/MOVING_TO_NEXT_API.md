# MOVING_TO_NEXT_API.md

> **Goal:** Move Unevent’s read endpoints to **Next.js BFF route handlers** so we get **edge caching, instant purge-by-tag, security, and observability**—without rewriting your Payload logic.  
> **Scope:** Reads only (public data). Writes stay uncached with `Cache-Control: no-store` and go through BFF for validation/rate limiting.

---

## TL;DR – What you’ll do

1) **Add BFF routes** under `/app/api/public/...` that call your existing helpers (moved to `lib/payload/*`).  
2) In each BFF route, set **`Cache-Control`** and **cache tags** (`Surrogate-Key` and/or `Cache-Tag`) and use **Next tags** (`next: { tags: [] }`) for revalidation.  
3) Implement a **single Payload `afterChange` hook** that **revalidates Next** (and optionally purges CDN) **by tag**.  
4) Point your UI (and partners/mobile) at **the new `/api/public/...` URLs**.  
5) Verify with curl/devtools that hits are **served from edge** and **purge on edit is instant**.

---

## Prerequisites

- **Caching layer**: Start **Vercel-only** (simple). Later you can put **Cloudflare** in front for WAF + CDN tag purges.  
- **Service auth** for server-to-server reads: `SVC_TOKEN` (Payload **API Key**). See **SVC_TOKEN** section.  
- **Next.js 15** (Route Handlers) + **Payload v3** hooks.  
- **Optional**: Redis for exceptionally heavy aggregations (most reads won’t need it once edge caching is on).

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
| Hub – snapshot per type | `GET /api/public/hub?listingType=:type` | `s-maxage=900, swr=900` | `hub:snapshot:{type}`, `hub:any` |
| Home snapshot (public) | `GET /api/public/home` | `s-maxage=900, swr=900` | `home:snapshot` |
| Feed (dynamic, per query) | `GET /api/public/feed?...` | `s-maxage=60, swr=60` | `feed:any` (optional) |

> **Note:** These are **read-only** and safe to cache. Authenticated dashboards/writes remain behind uncached endpoints with `Cache-Control: no-store`.

---

## Centralized keys & tags (single source of truth)

Create **`lib/keys.ts`** and **use it everywhere** (React Query keys, Next tags, CDN/Redis tags).

```ts
// lib/keys.ts
export type ListingType = 'events' | 'venues' | 'services';

export const tag = {
  tenant: (t: string) => `tenant:${t}`,
  collection: (t: ListingType) => `collection:${t}`,
  listingSlug: (slug: string) => `listing:slug:${slug}`,
  city: (slugOrId: string) => `city:${slugOrId}`,
  taxonomies: () => 'taxonomies',
  top: (t: ListingType) => `top:${t}`,
  featured: (t: ListingType) => `featured:${t}`,
  similar: (t: ListingType) => `similar:${t}`,
  hubSnapshot: (t: ListingType | 'locations' | 'services' | 'events') => `hub:snapshot:${t}`,
  hubAny: () => 'hub:any',
  homeSnapshot: () => 'home:snapshot',
  home: () => 'home', // legacy broad tag if needed
} as const;

export const qk = {
  taxonomies: (full: boolean) => ['taxonomies', { full }] as const,
  listing: (type: ListingType, slug: string) => ['listing', type, slug] as const,
  top: (type: ListingType, limit: number) => ['top', type, { limit }] as const,
  similar: (type: ListingType, params: Record<string,string|number>) =>
    ['similar', type, normalize(params)] as const,
  hubSnapshot: (t: 'locations'|'services'|'events') => ['hub','snapshot',t] as const,
  hubPopularCities: (limit: number) => ['hub', 'cities', 'popular', { limit }] as const,
  hubCityTypeahead: (limit: number) => ['hub', 'cities', 'typeahead', { limit }] as const,
  hubFeatured: (type: ListingType, limit: number) => ['hub', 'featured', type, { limit }] as const,
  hubTopByCity: (type: ListingType, cityId: string, limit: number) =>
    ['hub', 'topByCity', type, { cityId, limit }] as const,
  homeSnapshot: () => ['home','snapshot'] as const,
  feed: (params: Record<string,string|number>) => ['feed', normalize(params)] as const,
} as const;

function normalize(obj: Record<string, any>) {
  return Object.fromEntries(Object.entries(obj).sort(([a],[b]) => a.localeCompare(b)));
}
```

---

## Client: React Query hooks

```ts
// lib/hooks.ts
import { useQuery } from '@tanstack/react-query';
import { qk } from './keys';

const api = (path: string) => fetch(path).then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); });

export const useTaxonomies = (full=false) =>
  useQuery({ queryKey: qk.taxonomies(full), queryFn: () => api(`/api/public/taxonomies?fullList=${full?'1':'0'}`), staleTime: 86400000 });

export const useListing = (type:'events'|'venues'|'services', slug:string) =>
  useQuery({ queryKey: qk.listing(type, slug), queryFn: () => api(`/api/public/listings/${type}/${encodeURIComponent(slug)}`), staleTime: 300000 });

export const useSimilar = (type:'events'|'venues'|'services', params:Record<string,string>) => {
  const qs = new URLSearchParams(params).toString();
  return useQuery({ queryKey: qk.similar(type, params), queryFn: () => api(`/api/public/listings/${type}/similar?${qs}`), staleTime: 60000 });
};

export const useHubSnapshot = (t:'locations'|'services'|'events') =>
  useQuery({ queryKey: qk.hubSnapshot(t), queryFn: () => api(`/api/public/hub?listingType=${t}`), staleTime: 900000 });

export const useHomeSnapshot = () =>
  useQuery({ queryKey: qk.homeSnapshot(), queryFn: () => api(`/api/public/home`), staleTime: 900000 });

export const useFeed = (params:Record<string,string>) => {
  const qs = new URLSearchParams(params).toString();
  return useQuery({ queryKey: qk.feed(params), queryFn: () => api(`/api/public/feed?${qs}`), staleTime: 60000 });
};
```

---

## Server helpers

```ts
// lib/http.ts
import { headers as nextHeaders } from 'next/headers';

export function cacheHeaders(opts: { sMaxAge: number; swr: number; tags: string[]; tenant: string; extraTags?: string[]; }) {
  const allTags = Array.from(new Set([`tenant:${opts.tenant}`, ...opts.tags, ...(opts.extraTags || [])]));
  return {
    'Cache-Control': `public, s-maxage=${opts.sMaxAge}, stale-while-revalidate=${opts.swr}`,
    'Cache-Tag': allTags.join(', '),           // CDN (Cloudflare) – optional now
    'Surrogate-Key': allTags.join(' '),        // Useful for debugging / Fastly
  };
}

export function getTenant(): string {
  const h = nextHeaders(); const host = h.get('host') || '';
  const sub = host.split('.')[0];
  return sub && sub !== 'www' ? sub : 'unevent';
}
```

---

## BFF examples (reads)

### 1) Taxonomies
```ts
// app/api/public/taxonomies/route.ts
export const dynamic = 'force-static';
export const revalidate = 86400;
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fullList = url.searchParams.get('fullList') === '1';

  const res = await fetch(`${process.env.PAYLOAD_INTERNAL_URL}/api/taxonomies?fullList=${fullList?'1':'0'}`, {
    headers: {
      'x-tenant': 'unevent',
      Authorization: `users API-Key ${process.env.SVC_TOKEN}`
    },
    cache: 'force-cache',
    next: { tags: ['taxonomies'] }
  });
  if (!res.ok) return new Response('Upstream error', { status: res.status });
  const data = await res.json();
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
      'Surrogate-Key': 'taxonomies tenant:unevent'
    }
  });
}
```

### 2) Listing detail
```ts
// app/api/public/listings/[type]/[slug]/route.ts
export const dynamic = 'force-static';
export const revalidate = 300;
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

type Params = { params: { type: 'events'|'venues'|'services', slug: string } };

export async function GET(_: Request, { params }: Params) {
  const url = `${process.env.PAYLOAD_INTERNAL_URL}/api/${params.type}/${encodeURIComponent(params.slug)}`;
  const res = await fetch(url, {
    headers: { 'x-tenant': 'unevent', Authorization: `users API-Key ${process.env.SVC_TOKEN}` },
    cache: 'force-cache',
    next: { tags: [`listing:slug:${params.slug}`, `collection:${params.type}`] }
  });
  if (!res.ok) return new Response('Not found', { status: res.status });
  const data = await res.json();
  const citySlug = data?.city?.slug ? ` city:${data.city.slug}` : '';
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      'Surrogate-Key': `listing:slug:${params.slug} collection:${params.type} tenant:unevent${citySlug}`
    }
  });
}
```

### 3) Top listings
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
    headers: { 'x-tenant':'unevent', Authorization:`users API-Key ${process.env.SVC_TOKEN}` },
    cache: 'force-cache',
    next: { tags: [`top:${params.type}`, `collection:${params.type}`] }
  });
  if (!res.ok) return new Response('Upstream error', { status: res.status });
  return Response.json(await res.json(), {
    headers: {
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=600',
      'Surrogate-Key': `top:${params.type} collection:${params.type} tenant:unevent`
    }
  });
}
```

### 4) Similar listings
```ts
// app/api/public/listings/[type]/similar/route.ts
export const dynamic = 'force-static';
export const revalidate = 60;
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

function normalize(params: URLSearchParams) {
  const allowed = ['cityId','suitableFor','excludeId','limit'];
  const obj: Record<string,string> = {};
  for (const k of allowed) if (params.get(k)) obj[k] = params.get(k)!;
  return new URLSearchParams(Object.entries(obj).sort(([a],[b])=>a.localeCompare(b))).toString();
}

type Params = { params: { type: 'events'|'venues'|'services' } };

export async function GET(req: Request, { params }: Params) {
  const q = normalize(new URL(req.url).searchParams);
  const url = `${process.env.PAYLOAD_INTERNAL_URL}/api/${params.type}/similar?${q}`;
  const res = await fetch(url, {
    headers: { 'x-tenant':'unevent', Authorization:`users API-Key ${process.env.SVC_TOKEN}` },
    cache: 'force-cache',
    next: { tags: [`similar:${params.type}`] }
  });
  if (!res.ok) return new Response('Upstream error', { status: res.status });
  const cityId = new URLSearchParams(q).get('cityId');
  const excludeId = new URLSearchParams(q).get('excludeId');
  const extraTags = `${cityId ? ` city:${cityId}` : ''}${excludeId ? ` exclude:${excludeId}` : ''}`;
  return Response.json(await res.json(), {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      'Surrogate-Key': `similar:${params.type} tenant:unevent${extraTags}`
    }
  });
}
```

### 5) Hub snapshot (from minified collection)
```ts
// app/api/public/hub/route.ts
import crypto from 'node:crypto';
import { tag } from '@/lib/keys';

export const dynamic = 'force-static';
export const revalidate = 900;
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

const etagFor = (s: string) => `"${crypto.createHash('sha1').update(s).digest('hex')}"`;

export async function GET(req: Request) {
  const listingType = (new URL(req.url).searchParams.get('listingType') ?? 'locations') as 'locations'|'services'|'events';
  const upstream = `${process.env.PAYLOAD_INTERNAL_URL}/api/hub?listingType=${listingType}`;
  const r = await fetch(upstream, {
    headers: { 'x-tenant':'unevent', Authorization:`users API-Key ${process.env.SVC_TOKEN}`, 'x-internal-secret': process.env.INTERNAL_SECRET! },
    cache: 'force-cache',
    next: { tags: [tag.hubSnapshot(listingType), tag.hubAny()] },
  });
  if (!r.ok) return new Response('Upstream error', { status: r.status });
  const body = await r.text();
  const etag = etagFor(body);
  if (req.headers.get('if-none-match') === etag) return new Response(null, { status: 304 });
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=900',
      'Surrogate-Key': `${tag.hubSnapshot(listingType)} ${tag.hubAny()} tenant:unevent`,
      ETag: etag,
    }
  });
}
```

### 6) Home snapshot (from minified collection)
```ts
// app/api/public/home/route.ts
import crypto from 'node:crypto';
import { tag } from '@/lib/keys';

export const dynamic = 'force-static';
export const revalidate = 900;
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

const etagFor = (s: string) => `"${crypto.createHash('sha1').update(s).digest('hex')}"`;

export async function GET(req: Request) {
  const upstream = `${process.env.PAYLOAD_INTERNAL_URL}/api/home`;
  const r = await fetch(upstream, {
    headers: { 'x-tenant':'unevent', Authorization:`users API-Key ${process.env.SVC_TOKEN}`, 'x-internal-secret': process.env.INTERNAL_SECRET! },
    cache: 'force-cache',
    next: { tags: [tag.homeSnapshot()] },
  });
  if (!r.ok) return new Response('Upstream error', { status: r.status });
  const body = await r.text();
  const etag = etagFor(body);
  if (req.headers.get('if-none-match') === etag) return new Response(null, { status: 304 });
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=900',
      'Surrogate-Key': `tenant:unevent ${tag.homeSnapshot()}`,
      ETag: etag,
    }
  });
}
```

### 7) Feed (dynamic) — short TTL only
```ts
// app/api/public/feed/route.ts
export const dynamic = 'force-static';
export const revalidate = 60;
export const fetchCache = 'force-cache';
export const preferredRegion = 'auto';

function normalize(params: URLSearchParams) {
  const allowed = ['entity','city','type','suitableFor','page','limit','ratingMin','facilities','facilitiesMode','priceMin','priceMax','capacityMin','capacityMax','lat','lng','radius','startDate','endDate'];
  const obj: Record<string,string> = {};
  for (const k of allowed) { const v = params.get(k); if (v) obj[k] = v; }
  return new URLSearchParams(Object.entries(obj).sort(([a],[b])=>a.localeCompare(b))).toString();
}

export async function GET(req: Request) {
  const q = normalize(new URL(req.url).searchParams);
  const upstream = `${process.env.PAYLOAD_INTERNAL_URL}/api/feed?${q}`;
  const r = await fetch(upstream, {
    headers: { 'x-tenant':'unevent', Authorization:`users API-Key ${process.env.SVC_TOKEN}`, 'x-internal-secret': process.env.INTERNAL_SECRET! },
    cache: 'force-cache',
    next: { tags: ['feed:any'] }, // optional broad purge
  });
  if (!r.ok) return new Response('Upstream error', { status: r.status });
  return new Response(await r.text(), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
      'Surrogate-Key': 'tenant:unevent feed:any',
    }
  });
}
```

---

## Next internal revalidate endpoint

```ts
// app/api/internal/revalidate/route.ts
import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.INTERNAL_TOKEN}`) return new Response('Unauthorized', { status: 401 });
  const { tags } = await req.json();
  if (!Array.isArray(tags)) return new Response('Bad Request', { status: 400 });
  for (const t of tags) revalidateTag(t);
  return Response.json({ ok: true, count: tags.length });
}
```

---

## Payload → centralized invalidation

```ts
// payload/hooks/afterChange.ts
import { tag } from '../../lib/keys';

async function notifyNext(tags: string[]) {
  await fetch(process.env.NEXT_PRIV_REVALIDATE_URL!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.INTERNAL_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags }),
  });
}

export default async function afterChange({ collection, doc, req }: any) {
  const tenant = req?.tenant || 'unevent';
  const tags = new Set<string>([tag.tenant(tenant)]);

  if (collection === 'taxonomies') tags.add(tag.taxonomies());

  if (['events','venues','services'].includes(collection)) {
    tags.add(tag.collection(collection as any));
    if (doc?.slug) tags.add(tag.listingSlug(doc.slug));
    if (doc?.city?.slug) tags.add(tag.city(doc.city.slug));
    tags.add(tag.similar(collection as any));
    tags.add(tag.top(collection as any));
    tags.add(tag.featured(collection as any));
  }

  if (collection === 'cities') {
    tags.add('cities:popular');
    tags.add('cities:typeahead');
    if (doc?.slug) tags.add(tag.city(doc.slug));
  }

  // Home aggregates content; conservative refresh
  tags.add(tag.home());

  const list = Array.from(tags);

  // 1) Revalidate Next (Vercel edge/data cache)
  await notifyNext(list);

  // 2) Optional: purge CDN (Cloudflare) by tag
  if (process.env.CF_API_TOKEN) {
    await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/purge_cache`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: list }),
    });
  }

  // 3) Optional: also evict Redis keys if you use Redis (see lib/redisCache.ts)
}
```

### Snapshot regeneration hooks (Hub/Home)

```ts
// payload/hooks/afterChangeSnapshots.ts
import { tag } from '../../lib/keys';

const revalidate = (tags: string[]) =>
  fetch(process.env.NEXT_PRIV_REVALIDATE_URL!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.INTERNAL_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags }),
  });

export const afterChangeSnapshots = {
  hubSnapshots: async ({ doc }: any) => {
    const t = (doc.listingType ?? 'locations') as 'locations'|'services'|'events';
    await revalidate([tag.hubSnapshot(t), tag.hubAny()]);
  },
  homeListings: async () => {
    await revalidate([tag.homeSnapshot()]);
  }
};
```

---

## SVC_TOKEN – what it is & how to create

**`SVC_TOKEN`** = Payload **API Key** for a service user that your **BFF** uses to call Payload (never exposed to browsers).

1) Enable API keys on your auth collection:
```ts
// collections/Users.ts (or your auth collection slug)
export const Users = {
  slug: 'users',
  auth: { useAPIKey: true },
  fields: [/* ... */]
};
```
2) In Payload Admin → Users → create/select a **service user** (e.g. `bff@unevent.app`) → **Generate API key** → copy it.  
3) Store it as `SVC_TOKEN` in your deployment secrets.  
4) Use it in server-only requests:
```ts
headers: {
  'x-tenant': 'unevent',
  Authorization: `users API-Key ${process.env.SVC_TOKEN}` // 'users' = your auth collection slug
}
```
> Give the service user **read-only** permissions for public collections.

---

## `x-tenant` – why and how

- **Why:** future-proof **data isolation** and **cache partitioning** (multi-brand/white-label later).  
- **BFF:** derive tenant from host/path and add `x-tenant` to upstream requests.  
- **Payload:** trust `x-tenant` only from internal calls (check IP/secret) and enforce it in access rules.

Resolver:
```ts
export function resolveTenant(host?: string, path?: string) {
  const h = (host ?? '').split(':')[0];
  const sub = h.split('.').length > 2 ? h.split('.')[0] : null; // brandA.unevent.app
  if (sub && sub !== 'www') return sub;
  const m = /^\/t\/([^/]+)/.exec(path ?? '');
  if (m) return m[1];
  return 'unevent';
}
```

Payload enforcement (sketch):
```ts
// set req.tenant for internal calls only (check IP/secret)
payload.express.use((req, _res, next) => {
  const ok = req.headers['x-internal-secret'] === process.env.INTERNAL_SECRET;
  req.tenant = ok ? (req.headers['x-tenant'] as string) ?? 'unevent' : 'unevent';
  next();
});

// in collections access:
access: {
  read: ({ req }) => ({ tenant: { equals: req.tenant || 'unevent' } }),
  update: ({ req }) => ({ tenant: { equals: req.tenant || 'unevent' } }),
}
```

---

## Observability & guardrails

- Log per-route latency + cache status (`x-vercel-cache` or `cf-cache-status`) + tags used.  
- Alert on 5xx and on p95 latency spikes for `/api/public/*`.  
- Rate limit public BFF routes.  
- **No cookies** on public pages; avoid `Vary: *` — keep the cache key clean (path+query).

---

## Test checklist

- `curl -I https://yourdomain.com/api/public/taxonomies` → see `Cache-Control` and `Surrogate-Key`. First hit **MISS**, second **HIT**.  
- Edit a taxonomy → observe **HIT → MISS → HIT** cycle after revalidate.  
- Try `listings/:type/:slug` and `similar` with different param orders—same cache key (HIT).  
- Ensure **no per-user `Authorization`** is required for public reads.

---

## Cutover plan (safe & fast)

1) Implement the routes above + revalidate hook(s).  
2) Ship behind a flag and shadow UI traffic to new BFF (log-only).  
3) Flip reads in UI to `/api/public/...` for: **taxonomies → listing detail → top → similar → hub → home → feed**.  
4) (Optional) Restrict Payload reads to VPC/IP allowlist.  
5) Remove redundant Redis uses once edge hit-rates are healthy.

---

## Rollback

If anything misbehaves, switch UI back to old helpers (feature flag). BFF only **wraps** existing calls, so rollback is trivial.

---

## FAQs

- **Reads only?** Yes. Edge/CDN caching is read-only. Writes go through BFF with `Cache-Control: no-store`, validation, and rate limits.  
- **Draft previews?** Add `?draft=1` to BFF read routes → bypass cache and require auth. Set `Cache-Control: no-store` for draft branch.  
- **Do I still need Redis?** Often not. Keep it only for compute-heavy aggregates or thundering-herd shielding.

---

**Ready.** Start with `taxonomies`, `listings/:type/:slug`, and `listings/:type/similar`. Once tags/revalidation are verified, migrate the rest.
