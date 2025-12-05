# reCAPTCHA Troubleshooting Guide

## Issue: 400 Bad Request on reCAPTCHA Script

If you see a 400 error when loading:
```
https://www.google.com/recaptcha/enterprise.js?render=YOUR_SITE_KEY
```

This means your key is **NOT a reCAPTCHA Enterprise key** - it's a regular v3 key.

## Solution: Determine Your Key Type

### Check Your Key Type in Google Cloud Console

1. Go to https://console.cloud.google.com/security/recaptcha
2. Look at your key details

**If you see "reCAPTCHA Enterprise":**
- Use Enterprise configuration (see Option 1 below)

**If you see just "reCAPTCHA" or "reCAPTCHA v3":**
- Use regular v3 configuration (see Option 2 below)

## Option 1: Using Regular reCAPTCHA v3 (Most Common)

### Frontend Environment (.env.local)
```bash
# Your site key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LfXMZ0qAAAAALaNDLO3pe_1qumzR1wS1jwPmEiO

# Tell the app to use regular v3 (NOT Enterprise)
NEXT_PUBLIC_RECAPTCHA_ENTERPRISE=false

# Backend URL
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
```

### What This Does:
- Loads script from: `https://www.google.com/recaptcha/api.js?render=YOUR_KEY`
- Uses `window.grecaptcha.execute()` (v3 API)
- Works with regular reCAPTCHA v3 keys

## Option 2: Using reCAPTCHA Enterprise

### Frontend Environment (.env.local)
```bash
# Your Enterprise site key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_enterprise_site_key

# Tell the app to use Enterprise
NEXT_PUBLIC_RECAPTCHA_ENTERPRISE=true

# Backend URL
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
```

### What This Does:
- Loads script from: `https://www.google.com/recaptcha/enterprise.js?render=YOUR_KEY`
- Uses `window.grecaptcha.enterprise.execute()` (Enterprise API)
- Works with reCAPTCHA Enterprise keys

## Backend Configuration (Both Options)

Both use the same verification endpoint and backend code!

```bash
# Your secret key (matches the site key type)
RECAPTCHA_SECRET_KEY=your_secret_key_here

# Admin emails
ADMIN_EMAILS=contact@unevent.ro
```

## Quick Test

1. **Set environment variables** based on your key type
2. **Restart dev server:**
   ```bash
   cd apps/frontend
   pnpm dev
   ```
3. **Check browser console** for:
   ```
   ✅ reCAPTCHA v3 script loaded
   # OR
   ✅ reCAPTCHA Enterprise script loaded
   ```
4. **Check Network tab** - script should load with 200 status

## How to Get the Right Keys

### For Regular v3 (Simpler, Free):
1. Go to: https://www.google.com/recaptcha/admin
2. Click "Create"
3. Choose "reCAPTCHA v3"
4. Add your domains
5. Get Site Key and Secret Key

### For Enterprise (Advanced, Paid):
1. Go to: https://console.cloud.google.com/security/recaptcha
2. Enable reCAPTCHA Enterprise API
3. Create a key
4. Choose "Score-based (v3)"
5. Add your domains
6. Get Site Key and API Key (Secret)

## Common Errors

### Error: "Invalid site key or not loaded"
**Cause:** Wrong API endpoint for your key type
**Solution:** Set `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE` correctly

### Error: 400 Bad Request on script
**Cause:** Using Enterprise endpoint with v3 key
**Solution:** Set `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE=false`

### Error: "Failed to load reCAPTCHA script"
**Cause:** Domain not whitelisted
**Solution:** Add your domain in Google Console

## Recommended Setup for Development

Use **regular v3** for simplicity:

```bash
# Frontend .env.local
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LfXMZ0qAAAAALaNDLO3pe_1qumzR1wS1jwPmEiO
NEXT_PUBLIC_RECAPTCHA_ENTERPRISE=false
NEXT_PUBLIC_SERVER_URL=http://localhost:4000

# Backend .env
RECAPTCHA_SECRET_KEY=your_v3_secret_key
ADMIN_EMAILS=contact@unevent.ro
```

## Verification

Both APIs work the same on the backend - they both return a score from 0.0 to 1.0, and we reject submissions with score < 0.5.
