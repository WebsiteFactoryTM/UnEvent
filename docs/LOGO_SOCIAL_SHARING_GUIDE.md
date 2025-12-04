# Logo for Google Search & Social Media Sharing

**Status:** ✅ Configured  
**Logo:** `logo-unevent-favicon-white-on-black.png`

---

## Where Your Logo Will Appear

### 1. ✅ Google Search Results
**When:** After indexation (1-7 days)

**Location:** Organization schema in search results

**Technical:** Logo is referenced in Organization schema:
```json
{
  "@type": "Organization",
  "logo": "https://unevent.ro/logo-unevent-favicon-white-on-black.png"
}
```

**Preview:** Your logo will appear next to your business name in search results and Knowledge Panel

---

### 2. ✅ Facebook & WhatsApp Sharing
**When:** Immediately after deployment

**What Shows:**
- Your logo as the preview image
- Title: "UN:EVENT - Locații, Servicii și Evenimente în România"
- Description

**Technical:** Uses Open Graph meta tags
```html
<meta property="og:image" content="https://unevent.ro/logo-unevent-favicon-white-on-black.png" />
```

**How to Test:**
1. Share a link in Facebook/WhatsApp
2. Logo should appear as preview
3. If not, use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

---

### 3. ✅ Twitter/X Sharing
**When:** Immediately after deployment

**Card Type:** Summary card (square logo, perfect for brands)

**What Shows:**
- Logo centered
- Title and description

**Technical:** Uses Twitter Card meta tags

**How to Test:**
1. Share a link on Twitter
2. Or use [Twitter Card Validator](https://cards-dev.twitter.com/validator)

---

### 4. ✅ LinkedIn Sharing
**When:** Immediately after deployment

**Uses:** Open Graph tags (same as Facebook)

**What Shows:** Logo + title + description

---

### 5. ✅ Browser Tab (Favicon)
**When:** Immediately after deployment

**Where:** Browser tab, bookmarks, history

**Technical:** Uses icon metadata in Next.js

---

## Testing After Deployment

### Test Google Search
**Timeline:** 1-7 days after deployment

1. Google search: `site:unevent.ro`
2. Look for your logo in results
3. May take time to appear in Knowledge Panel

### Test Facebook/WhatsApp
**Timeline:** Immediate (with cache clearing)

**Manual Test:**
1. Share any UN:EVENT link in WhatsApp
2. Logo should appear

**Facebook Debugger:**
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter: `https://unevent.ro`
3. Click "Scrape Again" to refresh cache
4. Verify logo appears in preview

### Test Twitter
**Timeline:** Immediate

**Card Validator:**
1. Go to: https://cards-dev.twitter.com/validator
2. Enter: `https://unevent.ro`
3. Verify logo appears

### Test LinkedIn
**Timeline:** Immediate (may need cache clearing)

1. Share link in LinkedIn
2. Logo should appear
3. If not, LinkedIn crawls the first time a link is shared

---

## Troubleshooting

### Logo Not Showing in Facebook/WhatsApp
**Solution:**
1. Clear Facebook cache: https://developers.facebook.com/tools/debug/
2. Enter your URL and click "Scrape Again"
3. Facebook caches for 24-48 hours

### Logo Not Showing in Google Search
**Solution:**
1. Check schema is valid: https://search.google.com/test/rich-results
2. Request indexing in Google Search Console
3. Wait 1-7 days for Google to update

### Logo Shows as Broken Image
**Solution:**
1. Verify file exists: `https://unevent.ro/logo-unevent-favicon-white-on-black.png`
2. Check file is accessible (not blocked by robots.txt)
3. Verify image format is valid PNG

### Wrong Logo Showing
**Solution:**
1. Clear social media caches (Facebook debugger, etc.)
2. Hard refresh browser (Ctrl+Shift+R)
3. Wait 24 hours for caches to clear

---

## Logo Requirements

### Current Logo Specs
**File:** `logo-unevent-favicon-white-on-black.png`
**Format:** PNG
**Recommended Size:** 512x512px (square)

### Google Requirements
- ✅ At least 112x112px
- ✅ Square aspect ratio preferred
- ✅ PNG or SVG format
- ✅ White logo on dark background (your current setup)

### Open Graph (Facebook/WhatsApp) Recommendations
- ✅ Square logos work (512x512px is good)
- 📌 For best results, consider creating 1200x630px version with logo centered
- ✅ PNG format
- ✅ Less than 8MB

### Twitter Requirements
- ✅ Summary card: Square image (512x512px is perfect)
- ✅ PNG format
- ✅ Less than 5MB

---

## Future Optimization (Optional)

### Create Dedicated OG Image
For better social media appearance, you could create:

**File:** `og-image.png` or `og-image.jpg`
**Size:** 1200x630px (landscape)
**Content:** 
- Logo centered or in corner
- Tagline: "Locații, Servicii și Evenimente în România"
- Brand colors/gradient background

**Benefits:**
- More visual impact on social media
- Space for tagline/text
- Better for landscape sharing

**Update in layout.tsx:**
```typescript
images: [
  {
    url: "/og-image.jpg",
    width: 1200,
    height: 630,
    alt: "UN:EVENT",
  },
],
```

---

## Files Modified

**Layout:**
- `apps/frontend/app/(main)/layout.tsx`
  - Organization schema logo
  - Open Graph image
  - Twitter Card image
  - Favicon/icon metadata

**Logo Files Used:**
- `/logo-unevent-favicon-white-on-black.png` (main)
- `/logo-unevent-favicon-white-on-black.svg` (vector fallback)

---

## Summary

✅ **Google Search:** Logo in Organization schema  
✅ **Facebook:** Logo in Open Graph  
✅ **WhatsApp:** Logo in Open Graph  
✅ **Twitter:** Logo in Twitter Card  
✅ **LinkedIn:** Logo in Open Graph  
✅ **Browser:** Logo as favicon  

**Your logo will appear everywhere!** 🎉

---

**Last Updated:** January 2025  
**Status:** Production Ready ✅

