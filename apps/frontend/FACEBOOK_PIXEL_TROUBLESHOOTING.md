# Facebook Pixel Troubleshooting Guide

## Issue: Meta Pixel works locally but not on live domain

### Quick Diagnostic Steps

1. **Open Browser Console on Live Domain**
   - Go to your live site: https://your-domain.com
   - Press F12 → Console tab
   - Look for `[Tracking] Consent state:` log

2. **Check the Console Output**

The log will show:
```javascript
{
  hasConsented: true/false,
  consent: ["necessary", "analytics", "tracking", "social"],
  socialConsent: true/false,
  trackingConsent: true/false,
  gaMeasurementId: "SET" / "NOT_SET",
  fbPixelId: "SET" / "NOT_SET",
  willLoadGA: true/false,
  willLoadFB: true/false  ← This should be TRUE
}
```

### Common Issues & Solutions

#### Issue 1: `fbPixelId: "NOT_SET"`
**Problem:** Environment variable not set in Vercel
**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_FB_PIXEL_ID` = `your-actual-pixel-id`
3. **Important:** Redeploy after adding env var!

#### Issue 2: `willLoadFB: false` but `fbPixelId: "SET"`
**Problem:** Consent not given for "social" or "tracking"
**Solution:**
1. Clear localStorage: `localStorage.clear()` in console
2. Reload page
3. Accept "Social Media" OR "Tracking" in cookie banner
4. Check console again - `willLoadFB` should now be `true`

#### Issue 3: `willLoadFB: true` but no `_fbp` cookie
**Problem:** Ad blocker or Content Security Policy blocking Facebook

**Check for Ad Blocker:**
- Disable uBlock Origin, Privacy Badger, or browser ad blocker
- Reload page
- Check if `_fbp` cookie appears

**Check CSP (if using Cloudflare/custom headers):**
```bash
# Check response headers
curl -I https://your-domain.com | grep -i content-security
```

If CSP is present, add to `next.config.mjs`:
```javascript
async headers() {
  return [{
    source: '/:path*',
    headers: [{
      key: 'Content-Security-Policy',
      value: "connect-src 'self' https://connect.facebook.net https://www.facebook.com"
    }]
  }]
}
```

#### Issue 4: Script blocked by CORS/Network
**Check Network Tab:**
1. F12 → Network tab
2. Filter by "facebook"
3. Look for `fbevents.js`
4. If blocked (red), check error message

**Common fixes:**
- Whitelist `connect.facebook.net` in firewall
- Check Cloudflare firewall rules
- Verify DNS is resolving correctly

### Verification Commands

Run these in browser console on live domain:

```javascript
// 1. Check if fbq is defined
typeof window.fbq
// Should return: "function"

// 2. Check if Pixel ID is loaded
window.fbq('getState').pixels
// Should show your Pixel ID

// 3. Check consent storage
JSON.parse(localStorage.getItem('unevent-cookie-consent'))
// Should show: { services: [...], hasConsented: true }

// 4. Manually trigger test event (if fbq exists)
window.fbq('track', 'PageView')
// Check Network tab for request to facebook.com/tr
```

### Expected Behavior

**When working correctly:**
1. User accepts "Social Media" or "Tracking" consent
2. Console shows: `[Tracking] Consent state: { willLoadFB: true }`
3. `<script>` tag injected with Facebook Pixel code
4. Network request to `connect.facebook.net/en_US/fbevents.js`
5. Cookie `_fbp` set in browser
6. Network requests to `www.facebook.com/tr?id=...`

### Still Not Working?

1. **Compare local vs production:**
   ```bash
   # Local
   console.log(process.env.NEXT_PUBLIC_FB_PIXEL_ID)
   
   # Should match Vercel env var
   ```

2. **Check build logs in Vercel:**
   - Look for environment variable warnings
   - Check if build succeeded without errors

3. **Nuclear option (full reset):**
   ```javascript
   // In browser console on live domain
   localStorage.clear()
   location.reload()
   ```
   Then re-accept cookies with "Social Media" enabled.

### Contact Support

If still not working after all above steps, provide:
1. Screenshot of console `[Tracking] Consent state` log
2. Screenshot of Vercel environment variables (hide sensitive values)
3. Screenshot of Network tab filtered by "facebook"
4. Browser and version (Chrome 120, Safari 17, etc.)
