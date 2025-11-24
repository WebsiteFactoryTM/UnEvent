# IMPROVEMENTS.md

A prioritized, **non-breaking-first** improvement plan for Unevent (Payload v3 + Next.js 15). Each item has **Why / How / Done-when**. Start from the top and work down.

---

## ✅ Priority 0 — Quick wins (non‑breaking, 1–2 hours each, big impact)

- [x] **Remove per-user `Authorization` from public reads**
  - **Why:** Avoids cache fragmentation & leakage; enables edge caching.
  - **How:** Public BFF routes use service API key only: `Authorization: users API-Key ${SVC_TOKEN}`.
  - **Done when:** All `/api/public/*` routes work without end-user auth.

- [x] **Adopt centralized tags & query keys**
  - **Why:** One source of truth for invalidation & React Query keys.
  - **How:** Add `lib/keys.ts` (tags + qk) and use in BFF/React Query/Payload hooks.
  - **Done when:** No hardcoded strings for tags/keys remain.

- [x] **Normalize query params in BFF routes**
  - **Why:** Stable cache keys → high hit rates.
  - **How:** Whitelist + sort params before calling Payload (see examples in `MOVING_TO_NEXT_API.md`).
  - **Done when:** Different param orders hit the same cache entry.

- [ ] **Set proper cache headers + tags on all BFF reads**
  - **Why:** Enables edge cache & surgical purges.
  - **How:** `Cache-Control: public, s-maxage=..., stale-while-revalidate=...` and `Surrogate-Key`/`Cache-Tag` with `tenant:*` + resource tags.
  - **Done when:** `x-vercel-cache` shows `HIT` on second call for all public reads.

- [ ] **Wire Payload `afterChange` → Next revalidate (by tag)**
  - **Why:** Near-instant freshness.
  - **How:** `app/api/internal/revalidate` endpoint + `revalidateTag()` + hook calls with computed tags.
  - **Done when:** Editing a doc triggers cache refresh on next request.

- [ ] **Add ETag + 304 for Hub/Home snapshots**
  - **Why:** Saves bandwidth; faster revalidation.
  - **How:** Hash JSON body in BFF; compare `If-None-Match`; return `304` when unchanged.
  - **Done when:** Repeat requests for unchanged snapshots return `304`.

- [ ] **Disable cookies on public pages & avoid `Vary`**
  - **Why:** Prevents cache fragmentation.
  - **How:** No `Set-Cookie` on public HTML/API; don’t vary on `Authorization`/`Cookie` for public endpoints.
  - **Done when:** Devtools shows no cookies for public GETs.

- [ ] **Add timeouts & retries for idempotent GETs**
  - **Why:** Prevents tail-latency from cascading.
  - **How:** Use AbortController (2s upstream timeout, 1 retry on 5xx).
  - **Done when:** Logs show failed requests terminate within SLA.

- [ ] **Add basic rate limiting on `/api/public/*`**
  - **Why:** Protects origin on cache MISS storms.
  - **How:** Use Upstash Rate Limit (or equivalent) in edge middleware or route handler.
  - **Done when:** Abuse tests show 429s while normal users unaffected.

- [ ] **Propagate a Correlation ID across layers**
  - **Why:** Tracing a single request across BFF → Payload → DB.
  - **How:** Generate `x-correlation-id` in middleware if missing; log it everywhere.
  - **Done when:** You can grep logs by one ID and see full path.

- [ ] **Security headers (CSP, etc.)**
  - **Why:** Prevent XSS/mime sniff; boost security posture.
  - **How:** Add to `next.config.js` headers() (see snippet below).
  - **Done when:** Observatory/CSP evaluator show green results.

- [ ] **SEO hygiene (no code changes to data)**
  - **Why:** Better ranking; more clicks.
  - **How:** Canonicals, `hreflang` (ro/en), schema.org `Event`/`LocalBusiness`, XML sitemaps per type/city.
  - **Done when:** Lighthouse/Serp preview OK; sitemaps indexed.

- [ ] **Version public API**
  - **Why:** Safe evolution.
  - **How:** Serve under `/api/public/v1/...` and keep shape stable.
  - **Done when:** All clients call `v1` routes.

- [ ] **Images: AVIF/WebP + width-constrained `srcset`**
  - **Why:** Faster pages; lower egress.
  - **How:** Use Next Image or image CDN; ensure responsive sizes.
  - **Done when:** Largest images <200KB; CLS stable.

- [ ] **Create synthetic checks from Bucharest & East‑EU**
  - **Why:** Measures real p95 TTFB at edge.
  - **How:** Checkly/BetterStack/StatusCake monitors hitting hot pages & APIs.
  - **Done when:** Dashboards show p95 and alert on breach.

---

## 🧰 Snippets for Priority 0

**Fetch with timeout + retry (server):**
```ts
// lib/fetcher.ts
export async function fetchJSON(url: string, init: RequestInit = {}, { timeoutMs = 2000, retries = 1 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: ctrl.signal });
      if (!res.ok && attempt < retries && res.status >= 500) continue;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  }
  throw new Error('fetch failed after retries');
}
```

**Edge/route rate limit (Upstash example):**
```ts
// app/api/public/_middleware.ts (or specific routes)
// Requires: @upstash/ratelimit and Redis instance
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(120, '1 m') });

export async function middleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
  const { success, reset } = await ratelimit.limit(`rl:${ip}`);
  if (!success) return new NextResponse('Too Many Requests', { status: 429, headers: { 'Retry-After': String(reset) } });
  return NextResponse.next();
}

export const config = { matcher: ['/api/public/:path*'] };
```

**Correlation ID (middleware + logger):**
```ts
// middleware.ts
import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

export function middleware(req: Request) {
  const cid = (req.headers.get('x-correlation-id') || uuid()).toString();
  const res = NextResponse.next();
  res.headers.set('x-correlation-id', cid);
  return res;
}
export const config = { matcher: ['/api/:path*'] };
```

**Security headers (next.config.js):**
```js
// next.config.js
const securityHeaders = [
  { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; connect-src 'self' https:;" },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=()' },
];
module.exports = {
  async headers() { return [{ source: '/(.*)', headers: securityHeaders }]; },
};
```

---

## 🚀 Priority 1 — 1–3 days (non‑breaking, still high ROI)

- [ ] **PgBouncer (transaction pooling)**
  - **Why:** Prevents connection storms.
  - **How:** Put PgBouncer in front of Postgres; app connects to PgBouncer. Use transaction mode.
  - **Done when:** Postgres `numbackends` stable; no “too many connections”.

- [ ] **Hot-path indexes (covering)**
  - **Why:** Cut p95 DB latency.
  - **How (SQL):**
    ```sql
    -- detail by slug
    CREATE UNIQUE INDEX CONCURRENTLY idx_listing_tenant_slug ON listings (tenant, slug);

    -- feed common filters
    CREATE INDEX CONCURRENTLY idx_feed_city_type_published
      ON listings (tenant, city_id, type, published_at DESC)
      INCLUDE (price_min, price_max, rating);

    -- published-only partial index
    CREATE INDEX CONCURRENTLY idx_published_true
      ON listings (tenant, published)
      WHERE published = true;
    ```
  - **Done when:** p95 for detail/feed queries ≤120ms.

- [ ] **Autovacuum tuning**
  - **Why:** Prevent table/index bloat → stable performance.
  - **How:** Lower `autovacuum_vacuum_scale_factor` (0.1 → 0.02) on hot tables; monitor `n_dead_tup`.
  - **Done when:** Bloat < 20%, steady vacuum activity.

- [ ] **Snapshot jobs (Hub/Home) scheduled**
  - **Why:** Zero expensive compute on read.
  - **How:** Move “new* lists” into generator; regenerate on content change and nightly.
  - **Done when:** Hub/Home BFF only fetches a single small doc.

- [ ] **Meilisearch basic rollout**
  - **Why:** Fast, typo-tolerant search.
  - **How:** Index writer in Payload `afterChange`; set `filterableAttributes` & `sortableAttributes`; ship typeahead & faceted search.
  - **Done when:** Search p95 < 100ms; typeahead < 50ms.

- [ ] **Feature flags & guarded rollouts**
  - **Why:** Safer deploys.
  - **How:** `next/config` or a small toggle service; default off, per-tenant enable.
  - **Done when:** Risky features rollout progressively.

- [ ] **Observability dashboards + alerts**
  - **Why:** See issues before users do.
  - **How:** Edge hit %, origin p95, route 5xx, slow queries, snapshot job times; alert on breaches.
  - **Done when:** On-call can diagnose within minutes.

---

## 🧭 Priority 2 — 1–2 weeks (low/medium risk)

- [ ] **Read replica for reporting/backfills**
  - **Why:** Offload heavy reads from primary.
  - **How:** Stream replication; point long reports to replica.
  - **Done when:** Primary CPU dips during backfills.

- [ ] **Circuit breakers & fallbacks**
  - **Why:** Keep pages up under partial failure.
  - **How:** Timebox optional widgets; hide gracefully on errors.
  - **Done when:** Synthetic failures don’t break pages.

- [ ] **API schema contracts (Zod)**
  - **Why:** Prevent drift and client breakage.
  - **How:** Validate all BFF inputs/outputs; return stable error codes.
  - **Done when:** Type-safe API across app & BFF.

- [ ] **i18n & money correctness**
  - **Why:** Trust in pricing.
  - **How:** Store minor units; bucketization fields (`price_bucket`, `capacity_bucket`) for filters.
  - **Done when:** Filters are instant; formatting correct for ro/en and RON/EUR.

- [ ] **SEO structured data**
  - **Why:** Rich snippets.
  - **How:** Add `Event`/`LocalBusiness` JSON-LD to detail pages.
  - **Done when:** Rich results detected in Search Console.

---

## 🧱 Priority 3 — Larger or breaking (plan & schedule)

- [ ] **Cloudflare in front of Vercel**
  - **Why:** WAF/DDoS, CDN tag purges at edge, origin masking.
  - **How:** Orange-cloud app host; Cache Rules for `/api/public/*` respect origin; purge by `Cache-Tag`.
  - **Risk:** Test double-caching carefully.

- [ ] **Bookings service (separate DB)**
  - **Why:** Strong consistency for inventory.
  - **How:** Bounded context; `SELECT ... FOR UPDATE` or atomic counters; webhooks/events to Unevent.
  - **Risk:** New data model + flows.

- [ ] **Full multi-tenant rollout**
  - **Why:** White-label / multiple brands.
  - **How:** Enforce `x-tenant` end-to-end; DNS mapping; tenant-aware cache & search.
  - **Risk:** Data partitioning; access rules.

- [ ] **Real-time features (chat/availability)**
  - **Why:** UX.
  - **How:** Third-party (Pusher/Ably) or WebSockets service; cache bypass for live data.
  - **Risk:** Complexity + cost.

---

## Notes & references

- All code snippets align with `MOVING_TO_NEXT_API.md` BFF routes, tags, and revalidation flow.  
- Keep **Redis optional**; use short TTLs for dynamic feed; rely on tags for snapshots & details.  
- Rehearse **DB restore** and **blue/green rollback** quarterly.

