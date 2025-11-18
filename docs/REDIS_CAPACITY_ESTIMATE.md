# Redis Storage Capacity Estimate (Upstash Free Tier)

## Overview

Upstash's free tier provides:
- **Max Data Size**: 256 MB
- **Max Monthly Bandwidth**: 10 GB
- **Free forever** for hobbyists

**Connection**: Upstash uses REST API credentials:
- `UPSTASH_REDIS_REST_URL` - REST API endpoint
- `UPSTASH_REDIS_REST_TOKEN` - Authentication token

This document analyzes how UnEvent's Redis usage fits within these limits.

---

## Redis Usage in UnEvent

### 1. Backend: Hot Path Counters (Primary Use)

**Purpose**: Temporary storage of view/favorite/booking counters before flushing to PostgreSQL

**Key Format**: `feed:counters:{kind}:{listingId}:{metric}:{date}`
- Example: `feed:counters:locations:123:views:2025-01-15`

**Data Structure**:
- Small integer values (counters)
- ~50-100 bytes per key (including key name + value)

**TTL**: 7 days (auto-expires)

**Flush Frequency**: Every 10 minutes (counters flushed to PostgreSQL)

**Storage Calculation**:
- **Per counter**: ~75 bytes average
- **Active listings**: Assume 10,000 listings
- **Metrics per listing**: 3 (views, favorites, bookings)
- **Days tracked**: 7 days (rolling window)
- **Worst case**: 10,000 listings × 3 metrics × 7 days = 210,000 keys
- **Storage**: 210,000 × 75 bytes = **~15.75 MB**

**Reality Check**:
- Not all listings get views/favorites/bookings daily
- Counters are flushed every 10 minutes, so most keys are deleted quickly
- **Realistic storage**: ~5-10 MB for active counters

---

### 2. Frontend: API Response Caching

**Purpose**: Cache API responses to reduce database load

**Cache Keys**:
- `home:listings` - Homepage listings (TTL: 60 seconds)
- `cities:list:{url}` - City search results (TTL: 1 day)
- `taxonomies:list` - Listing types/facilities (TTL: 1 day)
- `listings:{entity}:{filters}` - Filtered listing results (TTL: 60 seconds)

**Data Structure**:
- JSON strings containing arrays of listings/cities
- Size varies significantly based on data

#### Storage Breakdown:

**Home Listings Cache** (`home:listings`):
- ~20-50 listings with full data
- Estimated size: ~50-150 KB per cache entry
- TTL: 60 seconds (very short, minimal storage impact)

**Cities Cache** (`cities:list:*`):
- Search results: 20-100 cities per query
- Each city: ~200-400 bytes (name, slug, geo, etc.)
- Estimated size: ~10-40 KB per cache entry
- TTL: 1 day
- **Storage**: ~50-200 KB (assuming 5-10 different search queries cached)

**Taxonomies Cache** (`taxonomies:list`):
- Listing types + facilities
- Estimated size: ~20-50 KB
- TTL: 1 day
- **Storage**: ~50 KB

**Listings Cache** (`listings:*`):
- Filtered search results: 24-100 listings per query
- Each listing: ~1-3 KB (full card data)
- Estimated size: ~50-300 KB per cache entry
- TTL: 60 seconds (very short)
- **Storage**: ~100-500 KB (assuming 2-5 concurrent queries)

**Total Frontend Cache Storage**: ~250 KB - 1 MB

---

### 3. Cache Invalidation Keys

**Purpose**: Track when to invalidate caches

**Keys**:
- `taxonomies` - Deleted when listing types change
- `facilities` - Deleted when facilities change
- Seed lock: Temporary lock during seeding

**Storage**: Negligible (~1-5 KB)

---

## Total Storage Estimate

| Category | Storage | Notes |
|----------|---------|-------|
| **Backend Counters** | 5-10 MB | Hot path counters (7-day TTL, flushed every 10 min) |
| **Frontend API Cache** | 0.25-1 MB | Short-lived response caches |
| **Cache Invalidation** | <0.01 MB | Negligible |
| **Redis Overhead** | ~10-20% | Redis internal structures |
| **Total** | **~6-13 MB** | Well within 256 MB limit ✅ |

---

## Monthly Bandwidth Estimate (10 GB Limit)

### Bandwidth Calculation:

**Reads** (GET operations):
- Home listings: ~100 requests/hour × 24h × 30d = 72,000 reads
- City searches: ~50 requests/hour × 24h × 30d = 36,000 reads
- Listing searches: ~200 requests/hour × 24h × 30d = 144,000 reads
- Counter reads (flushing): ~6 reads/hour × 24h × 30d = 4,320 reads
- **Total reads**: ~256,000 reads/month

**Writes** (SET operations):
- Counter increments: ~1,000/hour × 24h × 30d = 720,000 writes
- Cache writes: ~350/hour × 24h × 30d = 252,000 writes
- **Total writes**: ~972,000 writes/month

**Data Transfer**:
- Average read: ~50 KB (cached responses)
- Average write: ~0.1 KB (counters) or ~100 KB (cache)
- **Read bandwidth**: 256,000 × 50 KB = ~12.8 GB ❌
- **Write bandwidth**: 720,000 × 0.1 KB + 252,000 × 100 KB = ~25.2 GB ❌
- **Total**: ~38 GB/month ❌

**Wait, let's recalculate more realistically:**

### Realistic Bandwidth Estimate:

**Small Site (Testing/MVP)**:
- 1,000 page views/day
- 50% cache hit rate (50% served from Redis)
- Average cached response: 50 KB
- **Read bandwidth**: 1,000 × 0.5 × 50 KB × 30 = ~750 MB/month ✅
- **Write bandwidth**: ~500 MB/month (counters + cache writes)
- **Total**: ~1.25 GB/month ✅

**Medium Site (Growing)**:
- 10,000 page views/day
- 60% cache hit rate
- **Read bandwidth**: 10,000 × 0.6 × 50 KB × 30 = ~9 GB/month ⚠️
- **Write bandwidth**: ~1 GB/month
- **Total**: ~10 GB/month ⚠️ (at the limit)

**Large Site**:
- 50,000+ page views/day
- **Total**: ~50 GB/month ❌ (exceeds limit)

---

## Recommendations

### ✅ Free Tier is Sufficient For:

1. **Testing & Development**
   - Storage: ~6-13 MB (well within 256 MB)
   - Bandwidth: ~1-2 GB/month (well within 10 GB)

2. **Small Production Site (MVP)**
   - Up to ~5,000 page views/day
   - Storage: ~10-20 MB
   - Bandwidth: ~5-7 GB/month

3. **Medium Production Site (Early Growth)**
   - Up to ~10,000 page views/day
   - Storage: ~15-30 MB
   - Bandwidth: ~8-10 GB/month (at limit)

### ⚠️ When to Upgrade:

**Upgrade to Upstash Pay-as-you-go** when:
- Exceeding 10 GB/month bandwidth
- Approaching 200+ MB storage
- Need higher performance/availability

**Upgrade Pricing** (check current Upstash pricing):
- Pay only for what you use
- ~$0.20 per GB bandwidth
- ~$0.20 per GB storage/month

---

## Optimization Strategies

### To Stay Within Free Tier:

1. **Reduce Cache TTLs** (if bandwidth is concern):
   - Home listings: Already 60 seconds ✅
   - Listing searches: Already 60 seconds ✅
   - Cities: Could reduce from 1 day to 1 hour if needed

2. **Optimize Cache Size**:
   - Cache only essential fields (not full objects)
   - Use pagination (limit results cached)
   - Compress JSON responses (gzip)

3. **Counter Optimization**:
   - Flush counters more frequently (every 5 minutes instead of 10)
   - This reduces Redis storage but increases PostgreSQL writes slightly

4. **Monitor Usage**:
   - Set up Upstash dashboard alerts at 80% bandwidth
   - Track storage usage monthly

---

## Real-World Scenarios

### Scenario 1: Testing Site
- **Listings**: 500
- **Daily Views**: 100
- **Storage**: ~5 MB ✅
- **Bandwidth**: ~500 MB/month ✅
- **Verdict**: Perfect for free tier

### Scenario 2: Small Production (MVP)
- **Listings**: 5,000
- **Daily Views**: 2,000
- **Storage**: ~10 MB ✅
- **Bandwidth**: ~3 GB/month ✅
- **Verdict**: Comfortable on free tier

### Scenario 3: Growing Site
- **Listings**: 10,000
- **Daily Views**: 10,000
- **Storage**: ~20 MB ✅
- **Bandwidth**: ~9 GB/month ⚠️
- **Verdict**: At bandwidth limit, monitor closely

### Scenario 4: Established Site
- **Listings**: 20,000+
- **Daily Views**: 50,000+
- **Storage**: ~50 MB ✅
- **Bandwidth**: ~40 GB/month ❌
- **Verdict**: Need to upgrade or optimize

---

## Bottom Line

**Upstash Free Tier (256 MB, 10 GB/month) is excellent for:**

✅ **Testing & Development** - Plenty of headroom  
✅ **Small Production Sites** - Up to ~5,000 daily page views  
⚠️ **Medium Production Sites** - Up to ~10,000 daily page views (monitor bandwidth)  
❌ **Large Sites** - Need to upgrade or optimize

**Your current usage pattern** (hot path counters + short-lived API caches) is very efficient and should easily fit within the free tier for testing and small-to-medium production sites.

**Monitor**: Set up alerts at 80% bandwidth usage to know when to optimize or upgrade.

