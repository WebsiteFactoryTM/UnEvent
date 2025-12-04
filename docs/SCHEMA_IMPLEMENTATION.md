# Schema.org Implementation - Essential Schemas

**Status:** ✅ Implemented  
**Date:** January 2025  
**Location:** Global Layout

---

## What Was Implemented

### 1. Organization Schema (Global)
**Location:** `apps/frontend/app/(main)/layout.tsx`

**Purpose:** Tells search engines about your business entity.

**Schema Type:** `Organization`

**Includes:**
- ✅ Business name (UN:EVENT)
- ✅ Legal name (SC PIXEL FACTORY SRL)
- ✅ Logo
- ✅ Description
- ✅ Contact information (email)
- ✅ Address (Romania)
- ✅ Social media profiles (Facebook, Instagram, LinkedIn)

**Benefits:**
- Appears in Google Knowledge Panel
- Builds brand authority
- Helps with local SEO
- Rich snippets in search results

---

### 2. WebSite Schema with SearchAction (Global)
**Location:** `apps/frontend/app/(main)/layout.tsx`

**Purpose:** Enables Google Sitelinks Search Box in search results.

**Schema Type:** `WebSite`

**Includes:**
- ✅ Site name
- ✅ URL
- ✅ Description
- ✅ Language (Romanian)
- ✅ SearchAction (allows searching from Google)

**Benefits:**
- Search box in Google results
- Direct search from SERPs
- Better user experience
- Higher click-through rates

**Search Action:**
- Users can search your site directly from Google
- Format: `https://unevent.ro/locatii/oras/{city}?q={search_term}`

---

## Additional SEO Enhancements

### 3. Enhanced Metadata
**Also implemented in:** `apps/frontend/app/(main)/layout.tsx`

**Improvements:**
- ✅ `metadataBase` - Base URL for all relative URLs
- ✅ Title template - Dynamic titles on all pages
- ✅ Keywords - Relevant Romanian event keywords
- ✅ Enhanced robots directives
- ✅ Open Graph tags (Facebook/LinkedIn sharing)
- ✅ Twitter Card tags (Twitter sharing)
- ✅ Canonical URL

**Benefits:**
- Better social media sharing
- Consistent titles across site
- Proper crawling directives
- Enhanced search appearance

---

### 4. Font Optimization
**Also implemented in:** `apps/frontend/app/(main)/layout.tsx`

**Improvements:**
- ✅ `display: "swap"` - Prevents invisible text (FOIT)
- ✅ `latin-ext` subset - Includes Romanian characters (ă, â, î, ș, ț)
- ✅ Specific weights only - Only loads 400, 500, 600, 700
- ✅ `preload: true` - Faster font loading

**Benefits:**
- Faster page load
- Better Core Web Vitals (LCP)
- No layout shift during font load
- Romanian character support

---

## Testing

### 1. Verify Schema Markup

**Using Google Rich Results Test:**
1. Go to: [Rich Results Test](https://search.google.com/test/rich-results)
2. Enter: `https://unevent.ro`
3. Click "Test URL"
4. Verify both Organization and WebSite schemas are detected

**Using Schema Markup Validator:**
1. Go to: [Schema Markup Validator](https://validator.schema.org/)
2. Enter: `https://unevent.ro`
3. Verify no errors

**Manual Check:**
1. Visit: `https://unevent.ro`
2. View page source (Ctrl+U or Cmd+U)
3. Search for: `application/ld+json`
4. You should see 2 schema blocks in the `<head>`

---

### 2. Expected Schema Output

**Organization Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "UN:EVENT",
  "alternateName": "UnEvent",
  "legalName": "SC PIXEL FACTORY SRL",
  "url": "https://unevent.ro",
  "logo": "https://unevent.ro/logo-unevent-white.png",
  "description": "Platformă pentru locații evenimente...",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "RO",
    "addressLocality": "România"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "contact@unevent.ro"
  },
  "sameAs": [
    "https://www.facebook.com/unevent",
    "https://www.instagram.com/unevent",
    "https://www.linkedin.com/company/unevent"
  ]
}
```

**WebSite Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "UN:EVENT",
  "url": "https://unevent.ro",
  "description": "Platforma ta pentru evenimente memorabile în România",
  "inLanguage": "ro",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://unevent.ro/locatii/oras/{city}?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

---

## Google Search Features Enabled

### 1. Google Sitelinks Search Box
**When:** After indexation (1-4 weeks)

**Appears:** In Google search results when searching for "UN:EVENT" or "unevent.ro"

**Benefit:** Users can search your site directly from Google

### 2. Knowledge Panel (Potential)
**When:** After building authority (3-6 months)

**Shows:**
- Business name
- Logo
- Description
- Social links
- Contact info

**Benefit:** Enhanced brand visibility in search

### 3. Rich Snippets
**When:** Immediate (after indexation)

**Shows:** Enhanced search results with logo, description

---

## What Other Pages Have Schema

### Already Implemented (from previous code):
- ✅ **Detail Pages** - Event, Place, Service schemas
- ✅ **Profile Pages** - Person schema
- ✅ **Archive Pages** - ItemList schema

### Still Need to Implement:
- ⚠️ **BreadcrumbList** schema (all pages)
- ⚠️ **FAQPage** schema (HUB pages)
- ⚠️ **LocalBusiness** schema (upgrade from Place for locations)
- ⚠️ **MusicGroup** schema (for bands/musicians)

See `SEO_IMPLEMENTATION_PLAN.md` Phase 3 for full schema enhancement plan.

---

## Maintenance

### Update When:
- ✅ Business name changes
- ✅ Logo changes
- ✅ Contact email changes
- ✅ Social media accounts change
- ✅ Business address changes

### File to Update:
`apps/frontend/app/(main)/layout.tsx` - Lines with schema definitions

---

## Common Issues

### Schema Not Detected
**Solution:** 
- Clear cache
- Wait 24 hours for Google to recrawl
- Use "Request Indexing" in Google Search Console

### Search Box Not Showing
**Solution:**
- This is automatic by Google
- Usually appears within 1-4 weeks
- Requires sufficient search volume for brand name

### Validation Errors
**Solution:**
- Use Rich Results Test to see specific errors
- Ensure all URLs are absolute (include domain)
- Ensure logo image is accessible

---

## Related Files

### Modified:
- `apps/frontend/app/(main)/layout.tsx` - Added schemas + enhanced metadata + font optimization

### Documentation:
- `docs/SEO_IMPLEMENTATION_PLAN.md` - Full SEO plan
- `docs/SITEMAP_IMPLEMENTATION.md` - Sitemap docs
- `docs/SCHEMA_IMPLEMENTATION.md` - This file

---

## Next Steps

1. ✅ **Deploy changes**
2. ✅ **Test with Rich Results Test**
3. ✅ **Verify in page source**
4. ✅ **Submit to Google Search Console** (if not done)
5. ⏳ **Wait 1-4 weeks** for search features to appear
6. 📊 **Monitor in Search Console** - Enhancements > Unparsed structured data

---

**Implementation Status:** ✅ Complete  
**Testing Status:** Ready for production  
**Expected Results:** Within 1-4 weeks after deployment

