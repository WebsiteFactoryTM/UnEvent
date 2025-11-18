# Neon Free Tier Storage Capacity Estimate (0.5GB)

## Overview

Neon's free tier provides **0.5GB (512MB)** of storage. After accounting for PostgreSQL overhead (~20-30%), you have approximately **350-400MB** of usable storage for actual data.

**Important**: Media files (images, videos) are stored in Cloudflare R2/S3, NOT in the database. The Media collection only stores metadata (filename, alt text, relationships), which is very small.

---

## Per-Record Size Estimates

| Collection | Avg Size per Record | Notes |
|------------|---------------------|-------|
| **Users** | ~500 bytes | Small records, mostly text fields |
| **Profiles** | ~1.5 KB | Includes relationships, bio, social links |
| **Cities** | ~600 bytes | Text fields + geo point (small). **Note: You have ~14,000 cities** (~8.4 MB) |
| **Listings** (Locations/Services/Events) | ~4-6 KB | Largest records: many fields, relationships, arrays, text content |
| **Reviews** | ~1.2 KB | Comment text + relationships |
| **Favorites** | ~300 bytes | Minimal data, just relationships |
| **Media** (metadata only) | ~500 bytes | **Files stored in R2/S3, not DB** |
| **ListingTypes** | ~600 bytes | Small taxonomy records |
| **Facilities** | ~600 bytes | Small taxonomy records |
| **Feed Aggregates** | ~2-3 KB | Cached aggregation data |
| **HubSnapshots** | ~8-12 KB | Large arrays of city/type data |
| **Verifications** | ~1 KB | Verification documents metadata |
| **Views** | ~200 bytes | Minimal tracking data |

---

## Capacity Scenarios

### Scenario 1: Small Test Site (~50MB used)
- **100 Users** + Profiles: ~200 KB
- **14,000 Cities** (existing): ~8.4 MB ⚠️
- **500 Listings** (mix of locations/services/events): ~2.5 MB
- **1,000 Reviews**: ~1.2 MB
- **2,000 Favorites**: ~600 KB
- **5,000 Media records** (metadata only): ~2.5 MB
- **50 ListingTypes**: ~30 KB
- **100 Facilities**: ~60 KB
- **Feed aggregates & snapshots**: ~5 MB
- **Other collections**: ~1 MB
- **Total**: ~20.5 MB + indexes (~25MB) = **~45MB**

**Verdict**: ✅ Still plenty of room for testing

---

### Scenario 2: Medium Production Site (~210MB used)
- **5,000 Users** + Profiles: ~7.5 MB
- **14,000 Cities** (existing): ~8.4 MB ⚠️
- **10,000 Listings** (mix): ~50 MB
- **25,000 Reviews**: ~30 MB
- **50,000 Favorites**: ~15 MB
- **50,000 Media records** (metadata): ~25 MB
- **100 ListingTypes**: ~60 KB
- **200 Facilities**: ~120 KB
- **Feed aggregates & snapshots**: ~20 MB
- **Other collections**: ~5 MB
- **Total**: ~160.5 MB + indexes (~50MB) = **~210MB**

**Verdict**: ✅ Still comfortable for medium-scale production

---

### Scenario 3: Large Production Site (~360MB used)
- **20,000 Users** + Profiles: ~30 MB
- **14,000 Cities** (existing): ~8.4 MB ⚠️
- **50,000 Listings** (mix): ~250 MB
- **100,000 Reviews**: ~120 MB
- **200,000 Favorites**: ~60 MB
- **200,000 Media records** (metadata): ~100 MB
- **200 ListingTypes**: ~120 KB
- **500 Facilities**: ~300 KB
- **Feed aggregates & snapshots**: ~40 MB
- **Other collections**: ~10 MB
- **Total**: ~618.5 MB + indexes (~100MB) = **~720MB** ❌

**Verdict**: ❌ Exceeds free tier limit

---

## Key Factors Affecting Storage

### What Takes Space:
1. **Cities** - **~14,000 existing records** (~8.4 MB) ⚠️
   - Already accounts for ~2.4% of free tier
   - Each city: name, slug, geo point, usage count
   - Indexed fields add overhead

2. **Listings** - Your largest collection (4-6 KB each)
   - Many text fields (title, description, address)
   - Multiple relationships (city, owner, type, facilities)
   - Arrays (gallery, tags, YouTube links)
   - Group fields (contact, social links, pricing)

3. **Reviews** - Can grow quickly (1.2 KB each)
   - Comment text can be long
   - Relationships to listings and users

4. **Feed Aggregates & HubSnapshots** - Cached data
   - Pre-computed aggregations
   - Large arrays of city/type combinations

5. **Indexes** - PostgreSQL indexes add ~20-30% overhead
   - You have many indexed fields (slug, city, moderationStatus, etc.)
   - City indexes add extra overhead with 14K records

### What Doesn't Take Much Space:
- **Media files** - Only metadata in DB (actual files in R2/S3)
- **Users** - Small records
- **Cities** - Small records
- **Favorites** - Minimal data

---

## Recommendations

### For Free Tier (0.5GB):
- ✅ **Good for**: Testing, small production sites, MVP launch
- ✅ **Capacity**: ~8,000-12,000 listings comfortably (reduced due to 14K cities)
- ⚠️ **Already Used**: ~8.4 MB for cities (~2.4% of free tier)
- ⚠️ **Monitor**: Keep an eye on storage usage as you grow
- 💡 **Optimization**: 
  - Archive old HubSnapshots periodically
  - Clean up old feed aggregates
  - Consider archiving old reviews/listings
  - Cities are already loaded, so no additional city storage needed

### When to Upgrade:
- **Upgrade to Neon Pro** when you approach ~400MB
- **Neon Pro** offers 10GB+ storage (varies by plan)
- **Cost**: ~$19/month for 10GB (check current pricing)

### Storage Optimization Tips:
1. **Archive old data**: Move old listings/reviews to archive tables
2. **Clean aggregates**: Periodically clean old feed aggregates
3. **Optimize HubSnapshots**: Keep only recent snapshots
4. **Review indexes**: Remove unused indexes
5. **Text compression**: PostgreSQL compresses text automatically, but consider archiving very old content

---

## Real-World Estimate

For a **typical event listing platform** in Romania (with 14,000 cities already loaded):

- **Startup/MVP**: 1,000-5,000 listings → **~30-60MB** ✅ Free tier perfect
- **Growing**: 5,000-10,000 listings → **~60-150MB** ✅ Free tier sufficient
- **Established**: 10,000-15,000 listings → **~150-250MB** ✅ Free tier still works
- **Large**: 15,000+ listings → **~250MB+** ⚠️ Consider upgrading

**Bottom Line**: Neon's free tier (0.5GB) is excellent for testing and small-to-medium production sites. With **14,000 cities already loaded** (~8.4 MB), you can comfortably support **8,000-12,000 listings** before needing to upgrade. The cities are a one-time cost and won't grow significantly.

