# UnEvent - Comprehensive SEO Implementation Plan
## Romanian Event Industry Dominance Strategy

**Version:** 1.1  
**Date:** January 2025  
**Last Updated:** January 2025 (Added Pre-Launch Essentials)  
**Objective:** Achieve #1 rankings for event spaces, event services, and events in Romania

---

## 📊 Executive Summary

This plan outlines a complete SEO strategy to make UnEvent the dominant platform for event-related searches in Romania. 

**IMPORTANT:** Start with the **Pre-Launch Essentials** section below for critical tasks that MUST be completed before going live (3-5 days implementation time).

The full implementation is divided into 5 phases over 12-16 weeks, targeting high-intent keywords like:

- **"locație nuntă București"** (wedding venue Bucharest)
- **"sală evenimente Cluj"** (event hall Cluj)
- **"trupă nuntă Timișoara"** (wedding band Timisoara)
- **"DJ evenimente Iași"** (event DJ Iasi)
- **"catering evenimente Brașov"** (event catering Brasov)

**Target Market:** 41+ Romanian counties, 14,000+ cities, focusing on top 100 cities initially.

**Expected Timeline:** 
- **Pre-Launch:** 3-5 days for critical SEO essentials
- **Full Implementation:** 12-16 weeks across 5 phases
- **Significant Results:** 3-6 months to see major ranking improvements

---

## 🚨 PRE-LAUNCH ESSENTIALS - CRITICAL FOR GO-LIVE

### ⚡ These MUST be implemented before launch. Estimated time: 3-5 days

Before taking UnEvent live, these are the **absolute minimum** SEO requirements. Without these, the site will have poor search visibility and may even be penalized by search engines.

---

### ✅ 1. robots.txt (Priority: CRITICAL)

**File:** `apps/frontend/public/robots.txt`

**Status:** ❌ Currently missing

**Why Critical:** Without this, search engines will crawl and index admin pages, user account pages, API endpoints, and filtered pages creating duplicate content issues and wasting crawl budget.

**Implementation Time:** 15 minutes

**Content:**
```txt
User-agent: *
Allow: /

# Block admin, API, and user account routes
Disallow: /admin
Disallow: /api/
Disallow: /cont/
Disallow: /auth/

# Block draft and preview pages
Disallow: /preview
Disallow: /draft

# Block filtered search results (prevent duplicate content)
Disallow: /*?*priceMin=
Disallow: /*?*priceMax=
Disallow: /*?*capacityMin=
Disallow: /*?*facilities=
Disallow: /*?*lat=
Disallow: /*?*lng=
Disallow: /*?*radius=

# Sitemap location (add after creating sitemap)
Sitemap: https://unevent.ro/sitemap.xml
```

**Action:** Create this file immediately in `apps/frontend/public/robots.txt`

---

### ✅ 2. Basic Sitemap (Priority: CRITICAL)

**File:** `apps/frontend/app/sitemap.xml/route.ts`

**Status:** ❌ Currently missing

**Why Critical:** Search engines need a sitemap to discover all your pages efficiently. Without it, many pages may never be indexed.

**Implementation Time:** 2-3 hours

**Minimum Required:** Even a basic sitemap listing main pages is better than none.

**Quick Implementation (for launch):**

```typescript
// apps/frontend/app/sitemap.xml/route.ts
import { MetadataRoute } from 'next';

export async function GET() {
  const baseUrl = 'https://unevent.ro';
  
  // Static pages (immediate)
  const staticPages = [
    '',
    '/locatii',
    '/servicii',
    '/evenimente',
    '/despre',
    '/contact',
    '/politica-de-confidentialitate',
    '/termeni-si-conditii',
  ];

  // Generate for top cities (minimum for launch)
  const topCities = ['bucuresti', 'cluj-napoca', 'timisoara', 'iasi', 'brasov', 'constanta'];
  const listingTypes = ['locatii', 'servicii', 'evenimente'];
  
  const cityPages = listingTypes.flatMap(type =>
    topCities.map(city => `/${type}/oras/${city}`)
  );

  // Combine all URLs
  const urls = [...staticPages, ...cityPages].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: path === '' ? 1.0 : path.includes('/oras/') ? 0.8 : 0.7,
  }));

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, lastModified, changeFrequency, priority }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
```

**Post-Launch Improvement:** Add dynamic listing URLs from database (see Phase 1 for full implementation).

**Action:** Implement basic sitemap before launch, enhance within first week.

---

### ✅ 3. Meta Tags (Title, Description, OG) (Priority: CRITICAL)

**Status:** ✅ Partially implemented (needs verification)

**Why Critical:** These are what users see in search results. Poor meta tags = poor click-through rates = poor rankings.

**Implementation Time:** 1 hour to verify and fix missing ones

**Verify on these pages:**
- ✓ Homepage (`/`)
- ✓ Listing type pages (`/locatii`, `/servicii`, `/evenimente`)
- ✓ City pages (`/{type}/oras/{city}`)
- ✓ Detail pages (`/{type}/{slug}`)
- ✓ Profile pages (`/profil/{slug}`)
- ✓ Static pages (`/despre`, `/contact`, etc.)

**Checklist for each page:**
- [ ] Unique `<title>` tag (50-60 characters, includes "UN:EVENT" brand)
- [ ] Unique meta description (150-160 characters, compelling)
- [ ] Canonical URL (`<link rel="canonical">`)
- [ ] Open Graph tags (og:title, og:description, og:image, og:url)
- [ ] Twitter Card tags

**Quick Verification Script:**

Visit each page type and check:
1. View page source
2. Search for `<title>`, `<meta name="description"`, `<link rel="canonical"`
3. Ensure all are present and unique

**Missing pages fix priority:**
1. Homepage - CRITICAL
2. Top 6 city pages for each type - HIGH
3. Detail pages - HIGH
4. Other pages - MEDIUM

---

### ✅ 4. Essential Schema.org Markup (Priority: HIGH)

**Status:** ✅ Partially implemented (needs Organization + WebSite schemas)

**Why Critical:** Rich snippets in search results = higher click-through rates. Missing schema = leaving visibility on the table.

**Implementation Time:** 2 hours

**Minimum Required for Launch:**

#### A. Organization Schema (Global - in layout)

**File:** `apps/frontend/app/layout.tsx`

```typescript
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "UN:EVENT",
  "alternateName": "UnEvent",
  "url": "https://unevent.ro",
  "logo": "https://unevent.ro/logo-unevent-white.png",
  "description": "Platformă pentru locații evenimente, servicii evenimente și evenimente în România",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "RO"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "contact@unevent.ro"
  }
};
```

#### B. WebSite Schema with SearchAction (Global - in layout)

```typescript
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "UN:EVENT",
  "url": "https://unevent.ro",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://unevent.ro/{listingType}/oras/{city}?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};
```

**Verify existing schemas:**
- ✓ Detail pages have Event/Place/Service schema (already implemented)
- ✓ Profile pages have Person schema (already implemented)
- ✓ Archive pages have ItemList schema (already implemented)

**Action:** Add Organization + WebSite schemas to root layout immediately.

---

### ✅ 5. 404 & 500 Error Pages (Priority: MEDIUM)

**File:** `apps/frontend/app/not-found.tsx` and `apps/frontend/app/error.tsx`

**Status:** ✅ Likely implemented (verify they exist)

**Why Important:** Proper error pages prevent search engines from deindexing valid pages and provide better UX.

**Verify:**
1. 404 page exists and returns proper 404 status code
2. 404 page has helpful navigation (search, popular pages, home link)
3. 500 error page exists for server errors
4. Error pages have proper meta tags (noindex)

**Quick Fix if Missing:**

```typescript
// apps/frontend/app/not-found.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Pagină negăsită | UN:EVENT',
  robots: { index: false, follow: false }
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Pagină negăsită</h1>
        <p className="mb-8">Ne pare rău, pagina pe care o cauți nu există.</p>
        <Link href="/" className="btn-primary">
          Înapoi la pagina principală
        </Link>
      </div>
    </div>
  );
}
```

---

### ✅ 6. Google Search Console Setup (Priority: HIGH)

**Status:** ❌ Must be done before launch

**Why Critical:** You can't monitor search performance, indexation, or errors without GSC.

**Implementation Time:** 30 minutes

**Steps:**
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property for `unevent.ro`
3. Verify ownership (DNS TXT record or HTML file method)
4. Submit sitemap (`https://unevent.ro/sitemap.xml`)
5. Set preferred domain (with or without www)
6. Enable email alerts for critical issues

**Post-verification:**
- Request indexing for homepage
- Request indexing for top 10 city pages
- Monitor indexation status daily for first week

---

### ✅ 7. Google Analytics 4 Setup (Priority: HIGH)

**Status:** ⚠️ Verify if already installed (Vercel Analytics is installed, but GA4 recommended too)

**Why Important:** Track organic traffic, conversions, and user behavior.

**Implementation Time:** 30 minutes

**Steps:**
1. Create GA4 property
2. Add GA4 tracking code to `apps/frontend/app/layout.tsx`
3. Set up key events:
   - `page_view` (automatic)
   - `view_listing` (detail page views)
   - `contact_listing` (contact button clicks)
4. Set up conversions
5. Link to Google Search Console

**Alternative:** Can use Vercel Analytics + add GA4 later (within first week).

---

### ✅ 8. HTTPS Verification (Priority: CRITICAL)

**Status:** ✅ Likely handled by Vercel/hosting (verify)

**Why Critical:** HTTPS is a ranking factor. Sites without it are penalized.

**Verify:**
1. Site accessible via `https://unevent.ro` (not http)
2. HTTP redirects to HTTPS (301 permanent redirect)
3. No mixed content warnings (all resources load via HTTPS)
4. SSL certificate is valid and not expired

**Action:** Test on launch and ensure all assets (images, CSS, JS) load via HTTPS.

---

### ✅ 9. Mobile Responsiveness (Priority: CRITICAL)

**Status:** ✅ Likely implemented (Tailwind CSS mobile-first)

**Why Critical:** 70%+ of Romanian searches are mobile. Google uses mobile-first indexing.

**Verify Before Launch:**
1. Test on real mobile devices (iOS + Android)
2. Test on various screen sizes (320px, 375px, 414px widths)
3. Use Google Mobile-Friendly Test: [search.google.com/test/mobile-friendly](https://search.google.com/test/mobile-friendly)
4. Check touch targets are 44x44px minimum
5. Ensure no horizontal scrolling
6. Test forms are usable on mobile

**Quick Mobile Test Checklist:**
- [ ] Navigation menu works on mobile
- [ ] Listing cards display properly
- [ ] Filters are accessible
- [ ] Forms are fillable without zooming
- [ ] Images load and scale correctly
- [ ] Buttons are tappable
- [ ] No text overflow

---

### ✅ 10. Page Speed Basics (Priority: HIGH)

**Status:** ⚠️ Needs verification

**Why Important:** Speed is a ranking factor. Slow sites = poor rankings + poor conversions.

**Pre-Launch Speed Targets:**
- Lighthouse Performance score: > 70 (mobile)
- First Contentful Paint (FCP): < 2.5s
- Largest Contentful Paint (LCP): < 3.5s (aim for < 2.5s)
- Cumulative Layout Shift (CLS): < 0.1

**Quick Wins (if needed):**
1. Ensure images use Next.js Image component with proper sizes
2. Add `loading="lazy"` to below-fold images
3. Minify CSS/JS (should be automatic with Next.js production build)
4. Enable compression (should be automatic on Vercel)
5. Use CDN for assets (automatic on Vercel)

**Test with:**
- Google PageSpeed Insights: [pagespeed.web.dev](https://pagespeed.web.dev/)
- Lighthouse in Chrome DevTools

**Action:** Run PageSpeed Insights on 3 page types (homepage, city page, detail page) before launch.

---

### ✅ 11. Canonical URLs (Priority: HIGH)

**Status:** ✅ Partially implemented (verify on all page types)

**Why Important:** Prevents duplicate content issues. Tell search engines which version is primary.

**Verify on all pages:**
```html
<link rel="canonical" href="https://unevent.ro/current-page-path" />
```

**Rules:**
- Every page MUST have a self-canonical (points to itself)
- Filtered pages (with query params) should canonical to clean version
- No trailing slashes unless consistent site-wide
- Use absolute URLs (include domain)
- HTTPS only

**Quick Check:**
- View source on 5 random pages
- Search for `rel="canonical"`
- Ensure URL is correct and absolute

---

### ✅ 12. Internal Linking Basics (Priority: MEDIUM)

**Status:** ✅ Likely exists (breadcrumbs, navigation)

**Why Important:** Helps search engines discover pages and understand site structure.

**Minimum Required:**
- [ ] Main navigation links to all main sections (Locații, Servicii, Evenimente)
- [ ] Breadcrumbs on all pages (already implemented ✓)
- [ ] Footer links to important pages
- [ ] "Related listings" on detail pages (can be added post-launch)

**Quick Win:** Ensure footer has links to:
- Top 6 cities for each listing type
- About, Contact, Terms, Privacy pages

---

### ✅ 13. XML Sitemap in robots.txt (Priority: HIGH)

**Status:** ❌ Depends on implementing #1 and #2 above

**Why Important:** Tells search engines where to find your sitemap.

**Action:** After creating sitemap, add this line to robots.txt:

```txt
Sitemap: https://unevent.ro/sitemap.xml
```

---

### ✅ 14. No Broken Links (Priority: MEDIUM)

**Status:** ⚠️ Needs verification

**Why Important:** Broken links = poor user experience + wasted crawl budget.

**Before Launch Check:**
1. Crawl site with Screaming Frog (free version, 500 URLs)
2. Or use online tool: [deadlinkchecker.com](https://www.deadlinkchecker.com/)
3. Fix any 404s found
4. Ensure all navigation links work
5. Test all footer links
6. Test sample listing links

**Common Issues to Check:**
- Links to non-existent listings (deleted or never published)
- Old city slugs
- Incorrect internal links
- External links to dead sites

---

### ✅ 15. Essential Redirects (Priority: MEDIUM)

**Status:** ⚠️ Check if needed

**Why Important:** If you had a previous version or changed URLs, redirects prevent losing traffic.

**Check if needed:**
- Are there old URLs that should redirect to new ones?
- Should `www.unevent.ro` redirect to `unevent.ro` (or vice versa)?
- Should `/cont` redirect to `/cont/profil`? (already implemented ✓)

**Implementation:**
- Use Next.js `redirects()` in `next.config.mjs` (already has one example)
- All redirects should be 301 (permanent)
- Test each redirect after implementation

---

## 📋 PRE-LAUNCH CHECKLIST (Print & Complete)

Use this checklist in the final days before launch:

### Critical (Must Complete)
- [ ] **robots.txt created** and deployed
- [ ] **Basic sitemap.xml** created and accessible at `/sitemap.xml`
- [ ] **Sitemap submitted** to Google Search Console
- [ ] **Google Search Console** verified and configured
- [ ] **HTTPS working** (site loads on https://, redirects from http://)
- [ ] **Homepage meta tags** complete (title, description, OG, canonical)
- [ ] **Organization schema** added to root layout
- [ ] **WebSite schema** added to root layout
- [ ] **Mobile responsive** test passed on 3+ devices
- [ ] **404 page** exists and works properly

### High Priority (Should Complete)
- [ ] **All main page types** have proper meta tags
- [ ] **Canonical URLs** verified on 10 random pages
- [ ] **Google Analytics** installed and tracking
- [ ] **PageSpeed Insights** run on 3 page types (scores > 70)
- [ ] **Main navigation** works on desktop + mobile
- [ ] **Footer links** all working
- [ ] **Contact forms** tested and working
- [ ] **Images optimized** and loading properly

### Medium Priority (Nice to Have)
- [ ] **Broken links** checked and fixed
- [ ] **Schema markup** verified with Rich Results Test
- [ ] **Search functionality** tested
- [ ] **Profile pages** accessible and working
- [ ] **Review system** tested (if implemented)
- [ ] **Social sharing** buttons work
- [ ] **Email notifications** work

---

## ⏱️ PRE-LAUNCH TIMELINE

**If starting from scratch, here's a realistic timeline:**

### Day 1 (4-6 hours)
- Morning: Create robots.txt ✓
- Morning: Add Organization + WebSite schemas ✓
- Afternoon: Create basic sitemap ✓
- Afternoon: Verify all meta tags on main pages ✓

### Day 2 (4-6 hours)
- Morning: Set up Google Search Console ✓
- Morning: Submit sitemap to GSC ✓
- Afternoon: Test mobile responsiveness ✓
- Afternoon: Run PageSpeed Insights tests ✓

### Day 3 (3-4 hours)
- Morning: Check for broken links ✓
- Morning: Verify canonical URLs ✓
- Afternoon: Test 404 page ✓
- Afternoon: Final review of all pages ✓

### Day 4 (2-3 hours)
- Morning: Set up Google Analytics (if needed) ✓
- Afternoon: Final testing on production staging ✓
- Afternoon: Complete pre-launch checklist ✓

### Day 5 - LAUNCH DAY 🚀
- Monitor Google Search Console for indexation
- Request indexing for key pages
- Monitor analytics for traffic
- Keep an eye on server logs for errors

---

## 🚫 COMMON PRE-LAUNCH MISTAKES TO AVOID

1. **No robots.txt** → Search engines index everything, including admin pages
2. **No sitemap** → Pages don't get discovered or indexed
3. **Missing canonical URLs** → Duplicate content issues from day 1
4. **No GSC setup** → Can't monitor or fix issues
5. **Slow mobile performance** → Poor rankings from start
6. **Broken links** → Wastes crawl budget, poor UX
7. **Missing meta descriptions** → Poor click-through from search
8. **No 404 page** → Search engines may deindex pages
9. **HTTP instead of HTTPS** → Security warning + ranking penalty
10. **Forgetting to submit sitemap to GSC** → Slower indexation

---

## 🎯 POST-LAUNCH (First Week)

After going live, these are critical first-week tasks:

### Day 1 (Launch Day)
- [ ] Submit homepage to Google Search Console for indexing
- [ ] Monitor GSC Coverage report
- [ ] Check analytics is receiving data
- [ ] Monitor error logs

### Day 2-3
- [ ] Request indexing for top 20 city pages in GSC
- [ ] Check which pages have been indexed (site:unevent.ro in Google)
- [ ] Monitor Core Web Vitals in GSC

### Day 4-7
- [ ] Review GSC for any crawl errors
- [ ] Fix any 404s that appear
- [ ] Check which keywords are appearing (if any)
- [ ] Start Phase 1 full implementation (segmented sitemaps, etc.)

---

**Continue to full implementation plan below ↓**

---

## 🎯 Target Keywords & Search Intent

### Primary Keywords (High Volume, High Intent)

**Location-based searches:**
- "locație nuntă {oraș}" - 1,200 monthly searches/city (top 20 cities)
- "sală evenimente {oraș}" - 800 monthly searches/city
- "sală conferințe {oraș}" - 400 monthly searches/city
- "locație petrecere {oraș}" - 300 monthly searches/city

**Service-based searches:**
- "trupă nuntă {oraș}" - 600 monthly searches/city
- "DJ evenimente {oraș}" - 500 monthly searches/city
- "catering evenimente {oraș}" - 450 monthly searches/city
- "fotograf nuntă {oraș}" - 700 monthly searches/city
- "videograf evenimente {oraș}" - 300 monthly searches/city

**Event searches:**
- "evenimente {oraș}" - 2,000+ monthly searches (major cities)
- "evenimente weekend {oraș}" - 500 monthly searches
- "concerte {oraș}" - 1,500 monthly searches
- "festivaluri {oraș}" - 600 monthly searches

### Secondary Keywords (Lower Volume, High Conversion)

- "cel mai bun {service} pentru {event_type} în {oraș}"
- "preț {service} {oraș}"
- "cum aleg {service} pentru {event_type}"
- "{location_type} cu vedere în {oraș}"
- "{location_type} outdoor {oraș}"

### Long-tail Keywords (Very High Conversion)

- "locație nuntă până în 200 persoane București"
- "trupă muzică populară petreceri Brașov"
- "sală conferințe cu cazare Cluj-Napoca"
- "DJ cu echipamente proprii evenimente corporate Timișoara"

---

## 🏗️ Phase 1: Technical Foundation (Weeks 1-3)

### Priority: CRITICAL | Timeline: 3 weeks

### 1.1 Robots.txt Implementation

**File:** `apps/frontend/public/robots.txt`

**Content:**
```txt
User-agent: *
Allow: /

# Block admin and API routes
Disallow: /admin
Disallow: /api/
Disallow: /cont/
Disallow: /auth/

# Block draft and preview pages
Disallow: /preview
Disallow: /draft

# Block search result pages with parameters
Disallow: /*?*page=
Disallow: /*?*priceMin=
Disallow: /*?*priceMax=
Disallow: /*?*capacityMin=
Disallow: /*?*facilities=
Disallow: /*?*lat=
Disallow: /*?*lng=

# Allow clean city and category URLs
Allow: /locatii/oras/
Allow: /servicii/oras/
Allow: /evenimente/oras/

# Sitemap
Sitemap: https://unevent.ro/sitemap.xml
Sitemap: https://unevent.ro/sitemap-cities.xml
Sitemap: https://unevent.ro/sitemap-categories.xml
Sitemap: https://unevent.ro/sitemap-listings-locatii.xml
Sitemap: https://unevent.ro/sitemap-listings-servicii.xml
Sitemap: https://unevent.ro/sitemap-listings-evenimente.xml
```

**Why:** Prevents search engines from indexing duplicate/filtered pages while allowing clean URLs.

---

### 1.2 Robots Meta Tag Middleware

**File:** `apps/frontend/middleware.ts`

**Implementation:** Add query parameter detection to set noindex header for filtered pages.

**Logic:**
```typescript
// Add to existing middleware
function hasFilterParams(url: URL): boolean {
  const filterParams = ['page', 'priceMin', 'priceMax', 'capacityMin', 
                        'facilities', 'lat', 'lng', 'radius', 'ratingMin'];
  return filterParams.some(param => url.searchParams.has(param));
}

// Set custom header for pages with filters
if (hasFilterParams(req.nextUrl)) {
  const response = NextResponse.next();
  response.headers.set('x-robots-noindex', 'true');
  return response;
}
```

**Update generateMetadata functions** to read this header and set robots meta accordingly.

**Why:** Prevents indexing of infinite filter combinations while keeping clean URLs indexable.

---

### 1.3 Dynamic Sitemap Generation

**Implementation:** Create segmented sitemaps for different content types.

#### A. Main Sitemap Index

**File:** `apps/frontend/app/sitemap.xml/route.ts`

```typescript
export async function GET() {
  const sitemaps = [
    { url: 'https://unevent.ro/sitemap-static.xml', lastmod: new Date().toISOString() },
    { url: 'https://unevent.ro/sitemap-cities.xml', lastmod: new Date().toISOString() },
    { url: 'https://unevent.ro/sitemap-categories.xml', lastmod: new Date().toISOString() },
    { url: 'https://unevent.ro/sitemap-listings-locatii.xml', lastmod: new Date().toISOString() },
    { url: 'https://unevent.ro/sitemap-listings-servicii.xml', lastmod: new Date().toISOString() },
    { url: 'https://unevent.ro/sitemap-listings-evenimente.xml', lastmod: new Date().toISOString() },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(s => `  <sitemap>
    <loc>${s.url}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' }
  });
}
```

#### B. Cities Sitemap (Hub Pages)

**File:** `apps/frontend/app/sitemap-cities.xml/route.ts`

**Purpose:** List all city hub pages for each listing type.

**Format:**
```
/locatii/oras/bucuresti
/locatii/oras/cluj-napoca
/servicii/oras/timisoara
/evenimente/oras/iasi
```

**Priority:** 0.8 for top 20 cities, 0.6 for others.

#### C. Categories Sitemap (City + Category Combinations)

**File:** `apps/frontend/app/sitemap-categories.xml/route.ts`

**Purpose:** List all city+category combination pages.

**Format:**
```
/locatii/oras/bucuresti/nunta
/locatii/oras/bucuresti/botez
/servicii/oras/cluj-napoca/catering
/servicii/oras/cluj-napoca/fotografie
```

**Priority:** 0.9 for top keyword combinations.

#### D. Listings Sitemaps (by Type)

**Files:** 
- `apps/frontend/app/sitemap-listings-locatii.xml/route.ts`
- `apps/frontend/app/sitemap-listings-servicii.xml/route.ts`
- `apps/frontend/app/sitemap-listings-evenimente.xml/route.ts`

**Purpose:** List all approved listing detail pages.

**Format:**
```
/locatii/salon-nora-bucuresti
/servicii/dj-marian-cluj
/evenimente/concert-jazz-brasov
```

**Priority:** 0.7, changefreq: weekly

**Query from PayloadCMS:** Only include `moderationStatus: 'approved'` and `_status: 'published'`.

---

### 1.4 Sitemap Auto-Regeneration

**Implementation:** Add PayloadCMS hook to trigger sitemap regeneration.

**File:** `apps/backend/src/collections/Listings/_hooks/afterChange/regenerateSitemap.ts`

```typescript
export const regenerateSitemap: CollectionAfterChangeHook = async ({ doc, operation }) => {
  if (operation === 'create' || operation === 'update') {
    // Only trigger for published and approved listings
    if (doc._status === 'published' && doc.moderationStatus === 'approved') {
      try {
        // Call frontend API to regenerate sitemap
        await fetch(`${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/api/revalidate-sitemap`, {
          method: 'POST',
          headers: { 'x-revalidate-secret': process.env.REVALIDATE_SECRET }
        });
        
        // Optional: Ping Google
        await fetch(`https://www.google.com/ping?sitemap=https://unevent.ro/sitemap.xml`);
      } catch (error) {
        console.error('Failed to regenerate sitemap:', error);
      }
    }
  }
};
```

**Add hook** to all three listing collections (Locations, Services, Events).

---

### 1.5 Canonical URL Enhancement

**Update all page metadata functions** to ensure proper canonicals:

**Rules:**
1. Clean URLs (no params): Self-canonical
2. Pagination: Self-canonical (page=2 is valid)
3. Filtered URLs: Canonical to clean version
4. Detail pages: Self-canonical

**Example for city archive pages:**

```typescript
const hasFilters = Object.keys(searchFilters).some(key => 
  key !== 'page' && key !== 'limit' && searchFilters[key]
);

const canonicalUrl = hasFilters 
  ? `https://unevent.ro/${listingType}/oras/${city}` 
  : `https://unevent.ro/${listingType}/oras/${city}${page > 1 ? `?page=${page}` : ''}`;
```

---

## 🌐 Phase 2: URL Structure & HUB Pages (Weeks 4-7)

### Priority: HIGH | Timeline: 4 weeks

### 2.1 URL Structure Decision

**Current Issue:** Detail pages don't include city in URL.

**Options:**

**Option A (Recommended):** Keep current structure but add city data to slug
- Format: `/{listingType}/{slug-with-city}` (e.g., `/locatii/salon-nora-bucuresti`)
- Pros: Minimal code changes, SEO-friendly
- Cons: Slug must be unique globally

**Option B:** Restructure to include city in path
- Format: `/oras/{city}/{listingType}/{slug}` (e.g., `/oras/bucuresti/locatii/salon-nora`)
- Pros: Very clear URL hierarchy
- Cons: Major refactoring, need redirects

**Recommendation:** Go with Option A - append city to slug automatically.

**Implementation:**
1. Update slug generation hook in PayloadCMS to include city
2. Ensure uniqueness check
3. Apply to new listings going forward
4. Schedule migration for existing listings
5. Set up 301 redirects from old URLs

---

### 2.2 HUB Pages - City + Category Combinations

**Objective:** Create dedicated pages for every city+category combination that has content.

**URL Patterns:**
- `/locatii/oras/{city}/{category}` (e.g., `/locatii/oras/bucuresti/nunta`)
- `/servicii/oras/{city}/{category}` (e.g., `/servicii/oras/cluj-napoca/catering`)
- `/evenimente/oras/{city}` (no subcategory, events are time-based)

**Current State:** Route exists at `[listingType]/oras/[city]/[type]/page.tsx` but is a placeholder.

**Enhancement Required:** Transform into full SEO-optimized HUB page.

---

### 2.3 HUB Page Content Structure

Each HUB page must include:

#### A. SEO-Optimized H1 & Intro

**Template for Locations:**
```
H1: "Locații {category} în {city} - Găsește spațiul perfect pentru {event_type}"

Intro (150-180 words):
"Cauți o locație de {category} în {city}? Descoperă cele mai bune spații pentru {event_type} 
din {city} și împrejurimi. Filtrează după capacitate, preț, facilități și locație exactă. 
Toate locațiile sunt verificate și includ recenzii reale de la organizatori care au găzduit 
evenimente similare.

{City} oferă o varietate de opțiuni pentru {event_type}, de la săli moderne cu tehnologie 
avansată până la locații istorice cu farmec tradițional. Compară prețuri, vezi galerii foto 
și contactează direct proprietarii pentru disponibilitate.

Pe UnEvent găsești {count} locații de {category} în {city}, cu informații complete despre 
capacitate, facilități, prețuri și disponibilitate. Toate listările includ hartă interactivă, 
galerie foto și opțiune de mesagerie directă."
```

**Template for Services:**
```
H1: "Servicii {category} pentru evenimente în {city}"

Intro (150-180 words):
"Găsește cei mai buni {category} pentru evenimentul tău în {city}. Compară prețuri, vezi 
portofolii și citește recenzii reale de la clienți verificați. Toți prestatorii sunt verificați 
și oferă servicii profesionale pentru {suitable_events}.

În {city}, găsești profesioniști cu experiență în organizarea de {suitable_events}, cu 
echipamente moderne și pachete personalizabile. Filtrează după tip de eveniment, buget 
și disponibilitate.

Pe UnEvent ai acces la {count} prestatori de servicii {category} în {city}, toți cu 
profil complet, portofoliu, prețuri transparente și recenzii verificate. Contactează 
direct prin mesagerie securizată."
```

#### B. Filters Section

- City selector (default to current city)
- Category selector (checkboxes for sub-categories)
- Price range slider
- Capacity selector (for locations)
- Rating filter
- Availability/Date picker (for services)

**Important:** Apply filters via query params to maintain clean canonical URL.

#### C. Featured/Top Listings Section

**Title:** "Top 10 {category} recomandate în {city}"

**Content:** 
- Editorial selection (admin-curated)
- "Recomandat" badge
- Rich snippet cards with:
  - Featured image
  - Title
  - Rating & review count
  - Key features (3-4 bullet points)
  - Price range
  - CTA button "Vezi detalii"

**SEO:** ItemList schema with position ranking.

#### D. All Listings Grid

**Title:** "Toate locațiile de {category} în {city} ({count})"

**Display:** 
- Grid/list toggle
- Map view toggle
- Pagination (24 per page)
- Sort options: Recomandate, Cele mai populare, Preț crescător, Preț descrescător, Cele mai noi

#### E. FAQ Section (Schema.org FAQPage)

**Template FAQs for Locations:**

```markdown
## Întrebări frecvente despre locații {category} în {city}

**Cât costă închirierea unei locații de {category} în {city}?**
Prețurile pentru locații de {category} în {city} variază între {min_price} și {max_price} RON, 
în funcție de capacitate, facilități și sezon. Cele mai populare locații costă în medie 
{avg_price} RON.

**Ce capacitate au locațiile de {category} din {city}?**
Locațiile din {city} pot găzdui între {min_capacity} și {max_capacity} de persoane. 
Cele mai căutate sunt locațiile pentru {popular_capacity} persoane.

**Ce facilități oferă locațiile de {category} din {city}?**
Cele mai comune facilități includ: {top_facilities}. Multe locații oferă și parcare, 
terasă exterioară și sonorizare profesională.

**Cum rezerv o locație de {category} în {city}?**
Poți contacta direct proprietarul prin platformă, folosind butonul "Trimite mesaj" 
din pagina locației. Verifică disponibilitatea pentru data dorită și solicită o vizită.

**Care sunt cele mai populare zone pentru {category} în {city}?**
Cele mai căutate zone din {city} pentru {category} sunt: {popular_neighborhoods}.
```

**Template FAQs for Services:**

```markdown
## Întrebări frecvente despre servicii {category} în {city}

**Cât costă servicii de {category} pentru evenimente în {city}?**
Prețurile pentru {category} în {city} pornesc de la {min_price} RON și pot ajunge la 
{max_price} RON, în funcție de experiență, echipamente și durata evenimentului.

**Cum aleg un {category_singular} pentru {event_type}?**
Verifică portofoliul, recenziile clienților anteriori și asigură-te că are experiență 
cu evenimente similare. Solicită întotdeauna o întâlnire sau apel video înainte de a rezerva.

**Cu cât timp înainte trebuie să rezerv {category} în {city}?**
Pentru evenimente importante (nunți, botezuri, conferințe), recomandăm rezervarea cu 
3-6 luni înainte. Pentru evenimente mai mici, 1-2 luni în avans sunt suficiente.

**Ce întrebări să pun când contactez un {category_singular}?**
Întreabă despre: disponibilitate, experiență cu evenimente similare, echipamente incluse, 
politica de anulare, prețuri pentru servicii suplimentare.
```

#### F. Related Links Section

**Interlinking Strategy:**

For Location HUB pages, link to:
- Other categories in same city: "Vezi și: [Servicii catering în {city}], [Servicii fotografie în {city}]"
- Nearby cities: "Vezi locații similare în: [{nearby_city_1}], [{nearby_city_2}], [{nearby_city_3}]"
- Popular events: "Evenimente populare în {city}"

For Service HUB pages, link to:
- Locations: "Găsește locații potrivite în {city}"
- Other services: "Vezi și: [Alt serviciu 1], [Alt serviciu 2]"
- Events: "Evenimente pentru care poți oferi servicii"

---

### 2.4 HUB Page Implementation

**Files to create/update:**
- `apps/frontend/app/(main)/[listingType]/oras/[city]/[type]/page.tsx` (already exists, needs enhancement)
- `apps/frontend/components/hub/HubContent.tsx` (new)
- `apps/frontend/components/hub/HubIntro.tsx` (new)
- `apps/frontend/components/hub/HubFAQ.tsx` (new)
- `apps/frontend/components/hub/FeaturedListings.tsx` (new)

**Metadata Function:**

```typescript
export async function generateMetadata({ params }) {
  const { listingType, city, type } = await params;
  
  const listingLabel = getListingTypeLabel(listingType);
  const cityLabel = getCityLabel(city);
  const typeLabel = getTypeLabel(listingType, type);
  
  const title = `${listingLabel} ${typeLabel} în ${cityLabel} - Găsește ${typeLabel} perfecte | UN:EVENT`;
  const description = `Descoperă cele mai bune ${listingLabel.toLowerCase()} de ${typeLabel.toLowerCase()} în ${cityLabel}. Compară prețuri, vezi recenzii și contactează direct organizatorii.`;
  
  const url = `https://unevent.ro/${listingType}/oras/${city}/${type}`;
  
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: 'ro_RO',
      siteName: 'UN:EVENT',
      images: [{
        url: '/og-image-hub.jpg',
        width: 1200,
        height: 630,
        alt: `${listingLabel} ${typeLabel} ${cityLabel}`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}
```

---

### 2.5 Programmatic Content Generation

**Create utility functions** to generate dynamic content for HUB pages.

**File:** `apps/frontend/lib/seo/hub-content-generator.ts`

**Functions:**
1. `generateHubIntro(city, category, listingType, stats)` - Generate unique intro text
2. `generateHubFAQs(city, category, listingType, stats)` - Generate relevant FAQs
3. `getRelatedLinks(city, category, listingType)` - Get related HUB pages
4. `getNearby Cities(citySlug)` - Get 3-5 nearby major cities
5. `getTopFacilities(city, category)` - Get most common facilities

**Data sources:**
- Aggregate stats from PayloadCMS (price ranges, capacity ranges, counts)
- Static templates with variable replacement
- Nearby cities from geographic data

---

### 2.6 Static Generation Strategy (ISR)

**For HUB pages:**
- `revalidate = 21600` (6 hours) - Pages change infrequently
- Pre-build top 100 cities × top 10 categories at build time
- Other combinations: On-demand ISR
- Cache listings data in Redis for faster page generation

**Implementation:**

```typescript
export const revalidate = 21600; // 6 hours

// Pre-generate top combinations
export async function generateStaticParams() {
  const topCities = ['bucuresti', 'cluj-napoca', 'timisoara', 'iasi', 'brasov'];
  const topCategories = ['nunta', 'botez', 'conferinta', 'petrecere', 'corporate'];
  
  return topCities.flatMap(city =>
    topCategories.map(category => ({
      listingType: 'locatii',
      city,
      type: category
    }))
  );
}
```

---

## 📝 Phase 3: Schema.org Enhancement (Weeks 8-10)

### Priority: HIGH | Timeline: 3 weeks

### 3.1 Global Schema (All Pages)

**File:** `apps/frontend/app/layout.tsx`

**Add to root layout:**

#### A. WebSite Schema

```typescript
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "UN:EVENT",
  "url": "https://unevent.ro",
  "description": "Platformă pentru locații evenimente, servicii evenimente și evenimente în România",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://unevent.ro/cauta?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "inLanguage": "ro"
};
```

#### B. Organization Schema

```typescript
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "UN:EVENT",
  "legalName": "SC PIXEL FACTORY SRL",
  "url": "https://unevent.ro",
  "logo": "https://unevent.ro/logo-unevent.png",
  "description": "Platformă de conectare pentru organizatori de evenimente, furnizori de locații și servicii în România",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "RO",
    "addressLocality": "România"
  },
  "sameAs": [
    "https://www.facebook.com/unevent",
    "https://www.instagram.com/unevent",
    "https://www.linkedin.com/company/unevent"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "contact@unevent.ro",
    "availableLanguage": "Romanian"
  }
};
```

---

### 3.2 BreadcrumbList Schema

**File:** `apps/frontend/components/listing/shared/Breadcrumbs.tsx`

**Add schema to existing breadcrumbs component:**

```typescript
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Acasă",
      "item": "https://unevent.ro"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": listingTypeLabel,
      "item": `https://unevent.ro/${listingType}`
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": cityLabel,
      "item": `https://unevent.ro/${listingType}/oras/${city}`
    },
    // Add more levels as needed
  ]
};
```

**Add to all pages:** Detail pages, HUB pages, Archive pages.

---

### 3.3 Enhanced ItemList Schema (Archive & HUB Pages)

**File:** `apps/frontend/components/archives/ArchiveSchema.tsx`

**Current implementation is basic.** Enhance with:

```typescript
const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": `${listingLabel} ${typeLabel} ${cityLabel}`,
  "description": `Lista completă de ${listingLabel.toLowerCase()} ${typeLabel.toLowerCase()} în ${cityLabel}`,
  "numberOfItems": totalCount,
  "itemListElement": listings.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": listingType === 'locatii' ? 'Place' : 
              listingType === 'servicii' ? 'Service' : 'Event',
      "@id": `https://unevent.ro/${listingType}/${item.slug}`,
      "name": item.title,
      "url": `https://unevent.ro/${listingType}/${item.slug}`,
      "image": item.imageUrl,
      "description": item.description?.slice(0, 200),
      ...(item.rating && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": item.rating,
          "reviewCount": item.reviewCount,
          "bestRating": 5,
          "worstRating": 1
        }
      })
    }
  }))
};
```

---

### 3.4 Enhanced Location Schema (LocalBusiness)

**File:** `apps/frontend/components/listing/shared/jsonld.ts`

**Current:** Uses `Place` type.  
**Upgrade to:** `LocalBusiness` with full details.

```typescript
export function buildLocationJsonLd(location: any) {
  const cityName = typeof location?.city === 'object' ? location.city.name : 'România';
  const citySlug = typeof location?.city === 'object' ? location.city.slug : '';
  
  const owner = typeof location?.owner === 'object' ? location.owner : null;
  const ownerProfile = typeof owner?.profile === 'object' ? owner.profile : null;
  
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://unevent.ro/locatii/${location.slug}`,
    "name": location?.title,
    "description": location?.description,
    "url": `https://unevent.ro/locatii/${location.slug}`,
    "image": location?.featuredImage?.url ? 
      (Array.isArray(location.gallery) ? 
        [location.featuredImage.url, ...location.gallery.map(g => g.url).slice(0, 5)] : 
        [location.featuredImage.url]) : 
      [],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": location?.address,
      "addressLocality": cityName,
      "addressCountry": "RO"
    },
    ...(location?.geo && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": Array.isArray(location.geo) ? location.geo[1] : location.geo.coordinates?.[1],
        "longitude": Array.isArray(location.geo) ? location.geo[0] : location.geo.coordinates?.[0]
      }
    }),
    ...(location?.contact?.phone && {
      "telephone": location.contact.phone
    }),
    ...(location?.contact?.email && {
      "email": location.contact.email
    }),
    ...(location?.contact?.website && {
      "url": location.contact.website
    }),
    ...(location?.capacity?.indoor && {
      "maximumAttendeeCapacity": location.capacity.indoor + (location.capacity.outdoor || 0)
    }),
    ...(location?.rating && location?.reviewCount && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": location.rating,
        "reviewCount": location.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      }
    }),
    ...(location?.pricing?.amount && {
      "priceRange": location.pricing.per === 'hour' ? 
        `${location.pricing.amount} RON/oră` : 
        `${location.pricing.amount} RON/zi`
    }),
    // Facilities as amenityFeature
    ...(location?.facilities && location.facilities.length > 0 && {
      "amenityFeature": location.facilities.map((f: any) => ({
        "@type": "LocationFeatureSpecification",
        "name": typeof f === 'object' ? f.title : f,
        "value": true
      }))
    }),
    // Social media links
    "sameAs": [
      location?.contact?.socialMedia?.facebook,
      location?.contact?.socialMedia?.instagram,
      location?.contact?.socialMedia?.website,
      ownerProfile?.socialMedia?.facebook,
      ownerProfile?.socialMedia?.instagram
    ].filter(Boolean),
    // Owner info
    ...(ownerProfile && {
      "employee": {
        "@type": "Person",
        "name": ownerProfile.displayName || ownerProfile.name,
        "telephone": ownerProfile.phone,
        ...(ownerProfile.avatar?.url && {
          "image": ownerProfile.avatar.url
        })
      }
    }),
    "areaServed": {
      "@type": "City",
      "name": cityName,
      "@id": `https://unevent.ro/oras/${citySlug}`
    }
  };
}
```

---

### 3.5 Enhanced Service Schema (ProfessionalService / LocalBusiness)

**File:** `apps/frontend/components/listing/shared/jsonld.ts`

**Upgrade for bands/musicians:** Use `MusicGroup` when appropriate.

```typescript
export function buildServiceJsonLd(service: any) {
  const cityName = typeof service?.city === 'object' ? service.city.name : 'România';
  const citySlug = typeof service?.city === 'object' ? service.city.slug : '';
  
  // Determine if it's a music service
  const isMusicService = service?.type?.some((t: any) => 
    ['muzica', 'trupa', 'dj', 'band'].includes(typeof t === 'object' ? t.slug : t)
  );
  
  const baseType = isMusicService ? 'MusicGroup' : 'ProfessionalService';
  
  const owner = typeof service?.owner === 'object' ? service.owner : null;
  const ownerProfile = typeof owner?.profile === 'object' ? owner.profile : null;
  
  return {
    "@context": "https://schema.org",
    "@type": baseType,
    "@id": `https://unevent.ro/servicii/${service.slug}`,
    "name": service?.title,
    "description": service?.description,
    "url": `https://unevent.ro/servicii/${service.slug}`,
    "image": service?.featuredImage?.url ? 
      (Array.isArray(service.gallery) ? 
        [service.featuredImage.url, ...service.gallery.map(g => g.url).slice(0, 5)] : 
        [service.featuredImage.url]) : 
      [],
    ...(service?.contact?.phone && {
      "telephone": service.contact.phone
    }),
    ...(service?.contact?.email && {
      "email": service.contact.email
    }),
    ...(service?.contact?.website && {
      "url": service.contact.website
    }),
    "areaServed": {
      "@type": "City",
      "name": cityName,
      "@id": `https://unevent.ro/oras/${citySlug}`
    },
    ...(service?.pricing?.amount && {
      "offers": {
        "@type": "Offer",
        "price": service.pricing.amount,
        "priceCurrency": "RON",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": service.pricing.amount,
          "priceCurrency": "RON",
          "unitText": service.pricing.per === 'hour' ? 'oră' : 'zi'
        }
      }
    }),
    ...(service?.rating && service?.reviewCount && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": service.rating,
        "reviewCount": service.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      }
    }),
    "sameAs": [
      service?.contact?.socialMedia?.facebook,
      service?.contact?.socialMedia?.instagram,
      service?.contact?.socialMedia?.website,
      ownerProfile?.socialMedia?.facebook,
      ownerProfile?.socialMedia?.instagram
    ].filter(Boolean),
    // Provider/performer info
    ...(ownerProfile && {
      [isMusicService ? 'member' : 'provider']: {
        "@type": "Person",
        "name": ownerProfile.displayName || ownerProfile.name,
        "telephone": ownerProfile.phone,
        ...(ownerProfile.avatar?.url && {
          "image": ownerProfile.avatar.url
        })
      }
    })
  };
}
```

---

### 3.6 Enhanced Event Schema

**File:** `apps/frontend/components/listing/shared/jsonld.ts`

**Add more details:**

```typescript
export function buildEventJsonLd(event: any) {
  const cityName = typeof event?.city === 'object' ? event.city.name : 'România';
  const citySlug = typeof event?.city === 'object' ? event.city.slug : '';
  
  const owner = typeof event?.owner === 'object' ? event.owner : null;
  const ownerProfile = typeof owner?.profile === 'object' ? owner.profile : null;
  
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `https://unevent.ro/evenimente/${event.slug}`,
    "name": event?.title,
    "description": event?.description,
    "url": `https://unevent.ro/evenimente/${event.slug}`,
    "image": event?.featuredImage?.url ? 
      (Array.isArray(event.gallery) ? 
        [event.featuredImage.url, ...event.gallery.map(g => g.url).slice(0, 5)] : 
        [event.featuredImage.url]) : 
      [],
    "startDate": event?.startDate,
    "endDate": event?.endDate,
    "eventStatus": event?.eventStatus === 'upcoming' ? 
      'https://schema.org/EventScheduled' : 
      event?.eventStatus === 'ongoing' ?
        'https://schema.org/EventScheduled' :
        'https://schema.org/EventCancelled',
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": event?.venue && typeof event.venue === 'object' ? 
        event.venue.title : 
        cityName,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": event?.address,
        "addressLocality": cityName,
        "addressCountry": "RO"
      },
      ...(event?.geo && {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": Array.isArray(event.geo) ? event.geo[1] : event.geo.coordinates?.[1],
          "longitude": Array.isArray(event.geo) ? event.geo[0] : event.geo.coordinates?.[0]
        }
      })
    },
    ...(event?.pricing?.amount || event?.pricing?.isFree && {
      "offers": {
        "@type": "Offer",
        "price": event?.pricing?.isFree ? 0 : (event?.pricing?.amount || 0),
        "priceCurrency": "RON",
        "availability": event?.capacity?.remaining > 0 ? 
          "https://schema.org/InStock" : 
          "https://schema.org/SoldOut",
        "url": event?.ticketUrl || `https://unevent.ro/evenimente/${event.slug}`,
        ...(event?.pricing?.isFree && {
          "description": "Intrare liberă"
        })
      }
    }),
    ...(ownerProfile && {
      "organizer": {
        "@type": "Person",
        "name": ownerProfile.displayName || ownerProfile.name,
        "url": `https://unevent.ro/profil/${ownerProfile.slug}`
      }
    }),
    ...(event?.rating && event?.reviewCount && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": event.rating,
        "reviewCount": event.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      }
    }),
    "inLanguage": "ro"
  };
}
```

---

### 3.7 FAQPage Schema (HUB Pages)

**File:** `apps/frontend/components/hub/HubFAQ.tsx`

```typescript
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};
```

---

## 🎨 Phase 4: Content & Performance (Weeks 11-14)

### Priority: MEDIUM | Timeline: 4 weeks

### 4.1 Performance Optimization

#### A. Image Optimization

**Current:** Next.js Image component configured.

**Enhancements needed:**

1. **Priority loading** for above-the-fold images:
```typescript
<Image 
  src={featuredImage} 
  alt={title}
  priority={isAboveFold}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

2. **AVIF format** support (already supported by Next.js Image)

3. **Lazy loading** for gallery images (below fold)

4. **Placeholder blur** for better perceived performance:
```typescript
<Image 
  src={image} 
  placeholder="blur"
  blurDataURL={generateBlurDataURL(image)}
/>
```

#### B. Font Optimization

**File:** `apps/frontend/app/layout.tsx`

**Current:** Likely using standard Google Fonts.

**Optimization:**
```typescript
import { Manrope } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'], // Include Romanian characters
  display: 'swap', // Prevents invisible text during font load
  weight: ['400', '500', '600', '700'], // Only weights you use
  variable: '--font-manrope',
  preload: true,
});
```

#### C. Critical CSS

- Ensure Tailwind CSS is properly tree-shaken in production
- Move any custom critical CSS inline for first paint
- Use `next/font` to prevent FOIT (Flash of Invisible Text)

#### D. Core Web Vitals Monitoring

**Setup:**
1. Vercel Analytics (already installed)
2. Google Search Console - Core Web Vitals report
3. Custom RUM (Real User Monitoring) via Sentry

**Target Metrics:**
- **LCP (Largest Contentful Paint):** < 2.5s on mobile
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **INP (Interaction to Next Paint):** < 200ms

---

### 4.2 Listing Description Enhancement

**Objective:** Ensure all listings have rich, unique descriptions (300-500 words minimum).

**Implementation:**

1. **Admin notification:** Alert when descriptions are < 300 words
2. **Description template:** Provide template to help users write better descriptions
3. **AI-assisted descriptions:** (Future) Use AI to help expand short descriptions
4. **Description guidelines:** Create documentation on writing SEO-friendly descriptions

**Template for locations:**
```
# Structure
1. Opening paragraph: What makes this location special (50-80 words)
2. Facilities & amenities: Detailed list with descriptions (100-150 words)
3. Capacity & layout: Space configurations, indoor/outdoor (50-80 words)
4. Ideal events: What events is this perfect for (50-80 words)
5. Location & accessibility: Neighborhood, parking, public transport (50-80 words)
6. Unique selling points: What sets it apart (30-50 words)
```

---

### 4.3 Interlinking Implementation

#### A. Related Listings Component

**File:** `apps/frontend/components/listing/RelatedListings.tsx`

**Display on detail pages:**
- "Similar listings in {city}" (same type, same city)
- "Popular {category} in {city}" (featured listings)
- "Other listings from {owner}" (if owner has multiple listings)

**Logic:**
```typescript
// Priority order:
1. Same city + same category + similar price range (3-4 listings)
2. Same city + same category (any price) (2-3 listings)
3. Same city + different category but same event types (2-3 listings)
4. Nearby cities + same category (1-2 listings)
```

#### B. Service-to-Location Cross-linking

**On service detail pages:**
- "Locații recomandate pentru {service_type} în {city}"
- Query locations that are suitable for the same event types

**On location detail pages:**
- "Servicii recomandate pentru evenimente în {location}"
- Query services that serve the same event types

#### C. Footer Site-wide Links

**Update footer** to include:
- Top 10 cities (with links to locatii/oras/{city})
- Top 5 categories per listing type
- Recent featured listings

---

### 4.4 Local SEO Enhancement

#### A. NAP Consistency

Ensure consistent **Name, Address, Phone** across:
- Footer on all pages
- Contact page
- Schema.org Organization markup
- Social media profiles

#### B. City-specific Landing Pages

**For major cities (Bucharest, Cluj, Timisoara, Iasi, Brasov, Constanta):**

Create rich city overview pages at `/oras/{city}`:
- City description (150-200 words about the city's event scene)
- Quick links to all categories
- Featured listings from all types
- City statistics (# of venues, # of service providers, # of upcoming events)
- Neighborhoods/zones within the city

#### C. County-level Pages (Future)

**URL:** `/judet/{county}` (e.g., `/judet/cluj`)

**Content:**
- List all cities in county
- Aggregate statistics
- Top listings across all cities in county

---

### 4.5 Content Freshness Strategy

**Objective:** Keep content fresh to encourage frequent crawling.

#### A. Automated Content Updates

1. **Event Status Updates:**
   - Auto-update event status (upcoming → ongoing → finished)
   - Mark finished events with schema eventStatus
   - Archive events 30 days after finish

2. **Listing Stats Updates:**
   - Update view counts daily
   - Update "Last updated" timestamp on any listing change
   - Show "Recently updated" badge on listings updated < 7 days

3. **HUB Page Stats:**
   - Auto-update intro text stats (counts, price ranges) weekly
   - Add "Updated {date}" timestamp to HUB pages

#### B. Editorial Content (Blog/Guides)

**Create content hub** at `/blog` or `/ghiduri`:

**Content categories:**
1. **City Guides:**
   - "Top 25 locații nuntă în București (2025)"
   - "Cele mai bune săli conferințe din Cluj-Napoca"
   
2. **How-to Guides:**
   - "Cum să alegi locația perfectă pentru nuntă"
   - "Checklist complet pentru organizarea unui eveniment corporate"
   - "Ghid: Cum să negociezi prețul cu furnizori de servicii"

3. **Industry News:**
   - "Tendințe evenimente 2025 în România"
   - "Cele mai populare stiluri de nunți în 2025"

4. **Local Insights:**
   - "Regulamente evenimente București: Tot ce trebuie să știi"
   - "Cele mai bune locații outdoor din Cluj pentru evenimente de vară"

**SEO Benefits:**
- Target informational keywords
- Build topical authority
- Earn backlinks from event planners/bloggers
- Interlink to relevant listings

---

## 🔗 Phase 5: Link Building & Off-Page SEO (Weeks 15-24)

### Priority: MEDIUM-LOW | Timeline: Ongoing

### 5.1 Romanian Event Industry Partnerships

**Target partners:**
1. **Wedding planners associations**
2. **Event management companies**
3. **Catering associations**
4. **Hotel & venue associations**
5. **Local tourism boards**

**Tactics:**
- Partner badges on listings
- "Recommended by {partner}" endorsements
- Co-marketing campaigns
- Event sponsorships

---

### 5.2 Local Citations & Directory Listings

**Submit to:**
1. **Romanian business directories:**
   - firme.info
   - listafirme.ro
   - romaniaservicii.ro

2. **Event industry directories:**
   - nunta.ro (wedding category)
   - evenimentecorporate.ro
   - conferinteromania.ro

3. **Local directories per city:**
   - bucurestifm.ro
   - clujeni.ro
   - etc.

**NAP Consistency:** Ensure exact same format across all directories.

---

### 5.3 Content Marketing for Backlinks

**Create linkable assets:**

1. **Data-driven reports:**
   - "Raport: Prețuri medii locații evenimente în România 2025"
   - "Statistici: Cele mai populare tipuri de evenimente în România"
   - "Tendințe: Top 10 facilități căutate de organizatori"

2. **Tools/Calculators:**
   - Calculator buget nuntă
   - Calculator capacitate sală (persoane → m²)
   - Checklist planificare evenimente (interactive)

3. **Visual content:**
   - Infografics about event planning in Romania
   - Maps of top venue concentrations per city
   - Before/after event setups

**Promotion:**
- Pitch to Romanian bloggers/journalists
- Share on social media
- Email outreach to event planners
- PR campaigns

---

### 5.4 Guest Posting Strategy

**Target blogs:**
1. Wedding blogs (nuntasi.ro, mirese.ro)
2. Event planning blogs
3. Business/corporate blogs
4. Local city blogs

**Topics:**
- Expert roundups
- Event planning tips
- Venue selection guides
- Budget planning guides

**Link placement:**
- Contextual links to relevant HUB pages
- Author bio link to UnEvent
- Image credit links to listings

---

### 5.5 Social Signals

**Not direct ranking factors but help with:**
- Brand awareness
- Traffic generation
- Indirect backlinks

**Strategy:**
1. **Facebook:**
   - Business page with regular posts
   - Join event planning groups
   - Share featured listings
   - Run targeted ads to event planners

2. **Instagram:**
   - Visual showcase of top venues
   - Stories with tips
   - Reels with venue tours
   - Influencer partnerships

3. **LinkedIn:**
   - B2B focus for corporate events
   - Share industry insights
   - Connect with event managers
   - Publish articles

---

## 📊 Measurement & Monitoring (Ongoing)

### 6.1 Key Performance Indicators (KPIs)

**Track weekly/monthly:**

#### A. Organic Traffic Metrics
- Total organic sessions
- Organic sessions by landing page type (HUB vs detail vs homepage)
- Organic sessions by city
- Organic sessions by listing type

#### B. Keyword Rankings
**Track top 50 keywords:**
- Position for "locație nuntă {city}" (top 10 cities)
- Position for "sală evenimente {city}" (top 10 cities)
- Position for "trupă nuntă {city}" (top 10 cities)
- Position for "DJ evenimente {city}" (top 10 cities)
- Position for branded keywords ("unevent", "un event romania")

#### C. Conversion Metrics
- Contact button clicks from organic
- Message sends from organic
- Listing views from organic
- Favorites added from organic

#### D. Technical SEO Health
- Pages indexed (via GSC)
- Crawl errors
- Core Web Vitals (LCP, FID, CLS)
- Mobile usability issues
- Sitemap submission status

---

### 6.2 Tools Setup

#### A. Google Search Console
1. Verify domain
2. Submit all sitemaps
3. Set up email alerts for critical issues
4. Monitor keyword performance
5. Monitor Core Web Vitals

#### B. Google Analytics 4
1. Set up events:
   - `view_listing` (detail page views)
   - `contact_listing` (contact button clicks)
   - `filter_applied` (filter usage)
   - `search_performed` (site search)
   - `favorite_added`

2. Create custom reports:
   - Organic traffic by listing type
   - Organic traffic by city
   - Conversion funnel (view → contact → message)

#### C. Rank Tracking
Use tool like:
- SEMrush
- Ahrefs
- Accuranker

**Track:**
- Top 50 target keywords
- Competitor rankings
- SERP feature appearances (featured snippets, local packs)

#### D. Schema Markup Validator
- Google Rich Results Test
- Schema.org validator
- Regular audits to ensure all markup is valid

---

### 6.3 Competitor Analysis

**Main competitors to track:**
1. eveniment.ro
2. salidevents.ro
3. salievents.ro
4. trupe.ro
5. nunta.ro (wedding category)

**Monitor:**
- Their keyword rankings
- Their backlink profile
- Their content strategy
- Their schema markup
- Their site structure

**Tools:**
- SEMrush
- Ahrefs
- SimilarWeb

---

### 6.4 Monthly SEO Audits

**Checklist:**
1. Crawl site with Screaming Frog or Sitebulb
2. Check for broken links
3. Check for orphan pages
4. Verify all sitemaps are up to date
5. Verify robots.txt is correct
6. Check schema markup on sample pages
7. Test mobile usability
8. Check Core Web Vitals
9. Review GSC for new errors
10. Review top performing pages
11. Review top performing keywords
12. Identify content gaps
13. Check for duplicate content issues
14. Verify canonical tags
15. Check for indexation issues

---

## 🎯 Expected Results Timeline

### Month 1-2 (After Phase 1-2 Implementation)
- ✅ All technical foundations in place
- ✅ Sitemaps submitted and indexed
- ✅ Clean URL structure
- ✅ Basic HUB pages live
- 📈 Indexation: 500-1,000 pages
- 📈 Organic traffic: +10-20% (mostly branded)

### Month 3-4 (After Phase 3 Implementation)
- ✅ All schema markup enhanced
- ✅ HUB pages fully optimized
- ✅ Performance optimized
- 📈 Indexation: 2,000-5,000 pages
- 📈 Keyword rankings: Entering top 100 for primary keywords
- 📈 Organic traffic: +40-60%

### Month 5-6 (After Phase 4 Implementation)
- ✅ Content freshness strategy active
- ✅ Interlinking fully implemented
- ✅ Initial link building results
- 📈 Indexation: 5,000-10,000 pages
- 📈 Keyword rankings: Top 50 for primary keywords, Top 20 for long-tail
- 📈 Organic traffic: +100-150%
- 📈 Conversions: Starting to see significant organic-driven contacts

### Month 7-12 (Ongoing Optimization)
- ✅ Continuous content creation
- ✅ Link building momentum
- ✅ Authority building
- 📈 Keyword rankings: Top 10 for primary keywords in major cities
- 📈 Organic traffic: +200-300%
- 📈 Market position: Recognized as top event platform in Romania

---

## 🚨 Critical Success Factors

### Must-Haves for Success:

1. **Unique, valuable content on HUB pages** - No thin content, every page must provide value
2. **Fast page load times** - Core Web Vitals must be green
3. **Mobile-first** - Most searches are mobile in Romania
4. **Regular content updates** - Stale content = poor rankings
5. **Quality over quantity** - Better to have 100 great HUB pages than 1,000 thin ones
6. **User engagement** - Track bounce rate, time on site, conversions - these are indirect ranking factors
7. **Listing quality** - Encourage complete profiles with photos, descriptions, reviews
8. **Review generation** - Fresh reviews = fresh content + social proof
9. **Local relevance** - Content must be genuinely useful for Romanian users
10. **Patience** - SEO takes 3-6 months to show significant results

---

## 🔄 Maintenance & Ongoing Tasks

### Weekly Tasks:
- Monitor GSC for new errors
- Check Core Web Vitals
- Review top performing pages
- Update HUB page stats if needed
- Moderate and publish new listings

### Monthly Tasks:
- Full SEO audit
- Competitor analysis
- Keyword ranking review
- Content gap analysis
- Schema markup validation
- Backlink profile review
- Update FAQ content based on user questions

### Quarterly Tasks:
- Comprehensive content audit
- Update older HUB pages
- Review and update metadata
- Link building campaign
- User experience review
- Conversion rate optimization
- Major performance audit

---

## 📚 Resources & Documentation

### Internal Documentation Needed:

1. **SEO Guidelines for Listing Owners:**
   - How to write SEO-friendly titles
   - How to write great descriptions
   - Importance of photos
   - Encouraging reviews

2. **Content Creation Guidelines:**
   - HUB page content templates
   - FAQ writing guidelines
   - Blog post SEO checklist

3. **Technical SEO Runbook:**
   - How to troubleshoot indexation issues
   - How to update sitemaps
   - How to fix schema errors
   - Core Web Vitals troubleshooting

### External Resources:

- Google Search Central documentation
- Schema.org documentation
- Romanian SEO best practices
- Event industry SEO case studies

---

## 🎓 Team Training Needs

### Development Team:
- Next.js SEO best practices
- Schema.org implementation
- Core Web Vitals optimization
- Sitemap generation

### Content Team:
- SEO copywriting for Romanian market
- Keyword research
- Content optimization
- FAQ creation

### Marketing Team:
- Link building strategies
- Content promotion
- Social media for SEO
- Local SEO tactics

---

## 🏁 Conclusion

This comprehensive plan provides a roadmap to SEO dominance for UnEvent in the Romanian event industry. The key to success is **systematic implementation** of all phases, with particular emphasis on:

1. **Technical excellence** (Phase 1)
2. **Content quality** (Phase 2)
3. **Schema richness** (Phase 3)
4. **User experience** (Phase 4)
5. **Authority building** (Phase 5)

By following this plan and maintaining consistency over 12+ months, UnEvent can achieve top rankings for all target keywords and become the go-to platform for event spaces, services, and events in Romania.

**Next Step:** Begin Phase 1 implementation immediately, starting with robots.txt and sitemap generation.

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Owner:** SEO Strategy Team  
**Review Cycle:** Monthly

