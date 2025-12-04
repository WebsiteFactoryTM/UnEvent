# UnEvent - Comprehensive Project Analysis & SEO Readiness Assessment

**Date:** January 2025  
**Purpose:** Comprehensive analysis of UnEvent platform for SEO optimization targeting event spaces, services, and events in Romania

---

## 📋 Executive Summary

UnEvent is a modern event management platform built with Next.js 15, PayloadCMS v3, and PostgreSQL, designed to connect users with event locations, services, and events across Romania. The platform has a solid foundation with partial SEO implementation, but requires strategic enhancements to achieve top rankings for Romanian event-related searches.

**Current State:** 
- ✅ Basic SEO metadata implemented
- ✅ Schema.org structured data partially implemented
- ⚠️ Missing sitemaps and robots.txt
- ⚠️ URL structure needs alignment with SEO blueprint
- ⚠️ No HUB pages for city+category combinations
- ⚠️ Missing noindex logic for filtered pages

**Target SEO Queries:**
- "locație nuntă {oraș}" (wedding venue {city})
- "sală {eveniment} {oraș}" (event hall {event type} {city})
- "trupă {eveniment} {oraș}" (band {event type} {city})
- "servicii evenimente {oraș}" (event services {city})

---

## 🏗️ Architecture Overview

### Tech Stack

**Frontend:**
- Next.js 15 (App Router) with React 19
- TypeScript
- Tailwind CSS 4 (black & white minimalist design)
- React Query (TanStack Query) for data fetching
- NextAuth.js for authentication
- Redis (ioredis) for caching

**Backend:**
- PayloadCMS v3 (headless CMS)
- PostgreSQL (via @payloadcms/db-postgres)
- Redis for caching
- Node.js runtime

**Infrastructure:**
- Cloudflare R2 / AWS S3 for media storage
- Docker & Docker Compose for local development
- pnpm workspaces (monorepo)
- Sentry for error tracking

### Project Structure

```
UnEvent/
├── apps/
│   ├── backend/          # PayloadCMS v3 API
│   ├── frontend/         # Next.js 15 App Router
│   └── worker/           # Background jobs
├── packages/
│   └── shared/           # Shared utilities
└── docs/                 # Documentation
```

---

## 📁 Current Routing Structure

### Existing Routes

1. **Homepage:** `/`
2. **Listing Type Pages:** `/{listingType}` (e.g., `/locatii`, `/servicii`, `/evenimente`)
3. **City Archive Pages:** `/{listingType}/oras/{city}` (e.g., `/locatii/oras/timisoara`)
4. **City + Type Pages:** `/{listingType}/oras/{city}/{type}` (e.g., `/locatii/oras/timisoara/nunta`)
5. **Detail Pages:** `/{listingType}/{slug}` (e.g., `/locatii/salon-nora`)
6. **Profile Pages:** `/profil/{slug}`
7. **User Account:** `/cont/*`

### URL Structure Analysis

**Current Pattern:**
- ✅ City-based routing exists: `/{listingType}/oras/{city}`
- ✅ Type-based filtering exists: `/{listingType}/oras/{city}/{type}`
- ⚠️ Detail pages don't include city in URL: `/{listingType}/{slug}`
- ⚠️ SEO blueprint suggests: `/oras/{city}/{listingType}/{slug}` or `/oras/{city}/{type}/{slug}`

**Gap:** Detail pages should follow SEO blueprint pattern:
- `/oras/locatie/{slug}` (for locations)
- `/oras/serviciu/{slug}` (for services)
- `/oras/eveniment/{slug}` (for events)

---

## 🔍 Current SEO Implementation

### ✅ What's Implemented

#### 1. Metadata Generation
- **Location:** `apps/frontend/app/(main)/[listingType]/oras/[city]/page.tsx`
  - Dynamic title: `Top {listingLabel} {cityLabel} | UN:EVENT`
  - Dynamic description
  - Canonical URLs
  - Open Graph tags
  - Twitter cards

- **Detail Pages:** `apps/frontend/app/(main)/[listingType]/[slug]/page.tsx`
  - Dynamic title: `{title} | UN:EVENT`
  - Dynamic description (first 160 chars)
  - Open Graph with images

#### 2. Schema.org Structured Data

**Implemented:**
- ✅ `ItemList` schema on archive pages (`ArchiveSchema.tsx`)
- ✅ `Event` schema for events (`jsonld.ts`)
- ✅ `Place` schema for locations (`jsonld.ts`)
- ✅ `Service` schema for services (`jsonld.ts`)
- ✅ `Person` schema for profiles (`profil/[slug]/page.tsx`)

**Missing/Incomplete:**
- ⚠️ `LocalBusiness` schema (should be used instead of just `Place` for locations)
- ⚠️ `MusicGroup` / `PerformingGroup` for bands/musicians
- ⚠️ `BreadcrumbList` schema (breadcrumbs exist but no schema)
- ⚠️ `FAQPage` schema (for HUB pages)
- ⚠️ `WebSite` + `SearchAction` (global schema)
- ⚠️ `Organization` schema (company info)

#### 3. ISR/SSG Strategy

**Current:**
- `revalidate = 3600` (1 hour) on city archive pages
- Dynamic rendering with caching via React Query
- Tag-based cache invalidation via PayloadCMS hooks

**Gap:**
- No pre-built static pages for top 50 cities × 10 categories
- ISR revalidation could be optimized (6-12h for HUB pages per blueprint)

### ❌ What's Missing

#### 1. Sitemaps
- ❌ No `sitemap.xml` or segmented sitemaps
- ❌ No `robots.txt`
- ❌ No sitemap generation on listing create/update

#### 2. Robots Meta Tags
- ❌ No `noindex,follow` logic for filtered pages (with query params)
- ❌ No robots meta tag handling in middleware

#### 3. HUB Pages
- ❌ No dedicated HUB pages with:
  - Unique 120-180 word intros
  - Top 10 editorial recommendations
  - FAQ sections
  - Programmatic content generation

#### 4. Breadcrumbs Schema
- ✅ Visual breadcrumbs exist
- ❌ No `BreadcrumbList` JSON-LD schema

#### 5. Canonical URLs
- ✅ Basic canonical URLs exist
- ⚠️ Need to ensure self-canonical on all pages
- ⚠️ Need to handle pagination canonical URLs

---

## 📊 Data Model Analysis

### Collections (PayloadCMS)

#### 1. **Listings** (Locations, Services, Events)
**Fields:**
- `title`, `slug`, `description`
- `city` (relationship to Cities)
- `type` / `suitableFor` (relationships to ListingTypes)
- `owner` (relationship to Users/Profiles)
- `moderationStatus` (pending, approved, rejected)
- `featured`, `sponsored` (for recommendations)
- `rating`, `reviewCount` (aggregated)
- `views` (tracking)
- Media: `featuredImage`, `gallery`, `youtubeLinks`
- Contact: `phone`, `email`, `website`, `socialMedia`
- Location: `address`, `geo` (lat/lng)

**SEO Relevance:**
- ✅ Rich data available for schema markup
- ✅ City relationship enables city-based routing
- ✅ Type/suitableFor enables category filtering
- ⚠️ Need to ensure all fields populated for complete schema

#### 2. **Cities**
- 14,000+ Romanian cities with geo coordinates
- `slug`, `name`, `geo` (lat/lng)
- Used for city-based routing and filtering

#### 3. **ListingTypes**
- Categories for locations, services, and events
- Used for filtering and HUB page generation

#### 4. **Reviews**
- `rating` (1-5), `reviewBody`, `author`
- `listing` (relationship)
- Moderation status

**SEO Relevance:**
- ✅ Enables `AggregateRating` schema
- ✅ Supports E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

#### 5. **Profiles**
- User profiles with verification status
- `displayName`, `bio`, `avatar`
- `rating`, `reviewCount` (aggregated)
- Social media links

#### 6. **Facilities**
- Amenities/features for locations
- Used in filtering and schema (`amenityFeature`)

---

## 🎯 SEO Blueprint Alignment

### Current vs. Blueprint Requirements

| Requirement | Status | Notes |
|------------|--------|-------|
| **URL Structure** | ⚠️ Partial | Detail pages need city in URL |
| **HUB Pages** | ❌ Missing | Need city+category combination pages |
| **Metadata** | ✅ Good | Dynamic titles/descriptions implemented |
| **Schema.org** | ⚠️ Partial | Missing LocalBusiness, BreadcrumbList, FAQPage, WebSite |
| **Sitemaps** | ❌ Missing | No sitemap generation |
| **Robots.txt** | ❌ Missing | Need to create |
| **Noindex Logic** | ❌ Missing | Filtered pages should be noindex |
| **Breadcrumbs** | ✅ Visual | Missing schema markup |
| **ISR/SSG** | ⚠️ Partial | ISR exists but could be optimized |
| **Canonical URLs** | ✅ Good | Implemented but need pagination handling |

---

## 🔧 Technical Implementation Gaps

### 1. URL Structure Changes Needed

**Current:**
```
/{listingType}/{slug}
```

**Should Be (per blueprint):**
```
/oras/{city}/locatie/{slug}
/oras/{city}/serviciu/{slug}
/oras/{city}/eveniment/{slug}
```

**Impact:**
- Requires route restructuring
- Need redirects from old URLs
- Update all internal links

### 2. HUB Page Generation

**Required Pages:**
- `/oras/{city}/locatii/{type}` (e.g., `/oras/timisoara/locatii/nunta`)
- `/oras/{city}/servicii/{category}` (e.g., `/oras/timisoara/servicii/trupe-nunta`)
- `/oras/{city}/evenimente`

**Content Requirements:**
- Unique H1 per page
- 120-180 word intro (programmatically generated)
- Top 10 editorial recommendations
- FAQ section (FAQPage schema)
- Interlinking to related listings

### 3. Sitemap Generation

**Required Sitemaps:**
- `/sitemap.xml` (index)
- `/sitemap-cities.xml` (HUB pages per city)
- `/sitemap-categories.xml` (HUB pages per city+category)
- `/sitemap-listings-locatii.xml`
- `/sitemap-listings-servicii.xml`
- `/sitemap-listings-evenimente.xml`

**Implementation:**
- Use `next-sitemap` or custom sitemap generation
- Webhook from PayloadCMS to regenerate on listing changes
- Ping Google on sitemap updates

### 4. Robots Meta Tag Logic

**Required:**
- Pages with query params → `noindex,follow`
- Clean URLs (no params) → `index,follow`
- Pagination pages → `index,follow` (with page number in H1)

**Implementation:**
- Middleware to detect query params
- Set header or meta tag accordingly
- Update `generateMetadata` functions

### 5. Schema.org Enhancements

**Missing Schemas:**
- `LocalBusiness` (for locations with business details)
- `MusicGroup` / `PerformingGroup` (for bands/musicians)
- `BreadcrumbList` (for navigation)
- `FAQPage` (for HUB pages)
- `WebSite` + `SearchAction` (global)
- `Organization` (company info)

**Enhancements Needed:**
- Add `amenityFeature` to location schema
- Add `areaServed` to service schema
- Add `sameAs` (social links) to all schemas
- Add `aggregateRating` where missing

---

## 📈 Performance & Core Web Vitals

### Current State

**Caching Strategy:**
- React Query with Redis caching
- ISR with 1-hour revalidation
- Tag-based cache invalidation
- Edge caching via CDN (Cloudflare)

**Image Optimization:**
- Next.js Image component configured
- Remote patterns for R2/S3
- Device sizes configured
- 30-day cache TTL

**Potential Issues:**
- ⚠️ No explicit LCP optimization
- ⚠️ Font loading not optimized (need `display=swap`)
- ⚠️ CSS critical path not optimized

### Recommendations

1. **LCP Optimization:**
   - Priority loading for hero images
   - Preload critical resources
   - Optimize image formats (AVIF/WebP)

2. **CLS Prevention:**
   - Reserve space for images
   - Use aspect ratio on images
   - Avoid layout shifts

3. **Font Optimization:**
   - Add `display=swap` to font loading
   - Subset fonts (Latin only)
   - Limit font weights

---

## 🗺️ Content Strategy for SEO

### Programmatic Content Generation

**HUB Pages Need:**
1. **Unique Intros (120-180 words):**
   - Template-based generation
   - Include city name, category, key benefits
   - Natural language, not keyword-stuffed

2. **Top 10 Recommendations:**
   - Editorial selection (admin-curated)
   - Featured listings
   - Rich snippets with ratings

3. **FAQ Sections:**
   - Common questions per category
   - Schema.org FAQPage markup
   - Local relevance (city-specific)

4. **Interlinking:**
   - Related listings in same city
   - Related categories
   - Nearby cities

### Content Templates Needed

**For "Locații nuntă în {Oraș}":**
- Intro about wedding venues in city
- Top venues list
- FAQ: "Cât costă o locație de nuntă în {Oraș}?"
- Related: services, events in city

**For "Trupe nuntă în {Oraș}":**
- Intro about wedding bands in city
- Top bands list
- FAQ: "Cum aleg o trupă de nuntă?"
- Related: venues, other services

---

## 🔗 Interlinking Strategy

### Current State
- ✅ Breadcrumbs exist (visual)
- ⚠️ No systematic interlinking
- ⚠️ No "related listings" sections

### Required

1. **Detail Page Interlinking:**
   - "Similar listings in {City}"
   - "Popular {Category} in {City}"
   - "Related services/venues"

2. **HUB Page Interlinking:**
   - Nearby cities
   - Related categories
   - Popular listings

3. **Internal Link Structure:**
   - City → Categories → Listings
   - Listings → Related Listings
   - Listings → Owner Profile

---

## 📝 Next Steps & Recommendations

### Phase 1: Foundation (High Priority)

1. **Create robots.txt**
   - Allow all public pages
   - Disallow `/admin`, `/api`, `/preview`, `/draft`

2. **Implement Sitemap Generation**
   - Install `next-sitemap` or custom solution
   - Generate segmented sitemaps
   - Set up webhook for regeneration

3. **Add Robots Meta Logic**
   - Middleware to detect query params
   - Set `noindex,follow` for filtered pages
   - Update metadata functions

4. **Enhance Schema.org**
   - Add `BreadcrumbList` schema
   - Add `WebSite` + `SearchAction` (global)
   - Upgrade `Place` to `LocalBusiness` for locations
   - Add `MusicGroup` for bands

### Phase 2: URL Structure (High Priority)

1. **Restructure Detail Page URLs**
   - Change from `/{listingType}/{slug}` to `/oras/{city}/{listingType}/{slug}`
   - Implement redirects from old URLs
   - Update all internal links

2. **Create HUB Pages**
   - Generate city+category combination pages
   - Add unique content (intro, FAQ, recommendations)
   - Implement `FAQPage` schema

### Phase 3: Content & Optimization (Medium Priority)

1. **Programmatic Content Generation**
   - HUB page intro templates
   - FAQ generation per category
   - Editorial recommendation system

2. **Performance Optimization**
   - LCP optimization (priority images)
   - Font optimization (`display=swap`)
   - CSS critical path

3. **Interlinking Implementation**
   - Related listings sections
   - Nearby cities links
   - Category cross-linking

### Phase 4: Advanced SEO (Lower Priority)

1. **Rich Snippets Enhancement**
   - Complete all schema properties
   - Add `aggregateRating` everywhere possible
   - Add `sameAs` (social links)

2. **Local SEO**
   - Google Business Profile integration (if applicable)
   - Local citations
   - NAP consistency

3. **Content Expansion**
   - Blog/guides section
   - "How-to" articles per city
   - Event planning guides

---

## 🎯 SEO Target Keywords (Romanian Market)

### Primary Keywords
- "locație nuntă {oraș}"
- "sală eveniment {oraș}"
- "trupă nuntă {oraș}"
- "DJ eveniment {oraș}"
- "catering eveniment {oraș}"
- "foto video eveniment {oraș}"

### Secondary Keywords
- "spații evenimente {oraș}"
- "închiriere sală {oraș}"
- "organizare eveniment {oraș}"
- "servicii evenimente {oraș}"

### Long-tail Keywords
- "cel mai bun DJ pentru nuntă în {oraș}"
- "locații de nuntă cu vedere în {oraș}"
- "trupe de muzică populară {oraș}"

---

## 📊 Monitoring & Measurement

### Current State
- ✅ Sentry for error tracking
- ⚠️ No SEO-specific monitoring

### Required

1. **Google Search Console**
   - Submit sitemaps
   - Monitor indexing status
   - Track keyword rankings
   - Monitor Core Web Vitals

2. **Analytics**
   - Track organic traffic
   - Monitor conversion rates
   - Track "Contact" button clicks
   - Monitor listing views

3. **Custom Events**
   - Click-through from HUB → Detail
   - "Contact organizer" clicks
   - Filter usage

---

## ✅ Checklist Summary

### Critical (Must Have)
- [ ] robots.txt
- [ ] Sitemap generation (segmented)
- [ ] Robots meta logic (noindex for filters)
- [ ] URL restructuring (city in detail URLs)
- [ ] HUB pages (city+category)
- [ ] BreadcrumbList schema
- [ ] WebSite + SearchAction schema

### Important (Should Have)
- [ ] LocalBusiness schema upgrade
- [ ] MusicGroup schema for bands
- [ ] FAQPage schema for HUB pages
- [ ] Canonical URL handling (pagination)
- [ ] Interlinking implementation
- [ ] Performance optimization (LCP, fonts)

### Nice to Have
- [ ] Blog/guides section
- [ ] Advanced rich snippets
- [ ] Google Business integration
- [ ] Content expansion

---

## 📚 References

- **SEO Blueprint:** `docs/UNEVENT-SEO-Blueprint.docx.md`
- **Project Specs:** `docs/Descriere UnEvent - specificatii si pagini.md`
- **Current Schema Implementation:** `apps/frontend/components/listing/shared/jsonld.ts`
- **Archive Schema:** `apps/frontend/components/archives/ArchiveSchema.tsx`

---

**End of Analysis**

This document provides a comprehensive overview of the UnEvent platform's current state and SEO readiness. Use this as a foundation for planning and implementing SEO improvements targeting Romanian event-related searches.

