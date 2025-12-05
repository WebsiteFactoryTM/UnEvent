# reCAPTCHA Enterprise Setup Guide

## Important: Key Type Matters!

Your reCAPTCHA Enterprise key **MUST** be **Score-based (v3)**, not Checkbox (v2)!

## Check Your Current Key Type

1. Go to: https://console.cloud.google.com/security/recaptcha
2. Find your key: `6LfXMZ0qAAAAALaNDLO3pe_1qumzR1wS1jwPmEiO`
3. Check the "Integration type":
   - ✅ **Score-based (reCAPTCHA v3)** → Continue with this guide
   - ❌ **Checkbox (reCAPTCHA v2)** → Create a new key (see below)

## If You Have Checkbox Key (400 Error)

The HTML setup you shared shows checkbox integration:
```html
<div class="g-recaptcha" data-sitekey="..." data-action="LOGIN"></div>
```

This won't work with our invisible form! You need a **Score-based** key.

### Create New Score-based Enterprise Key

1. **Go to:** https://console.cloud.google.com/security/recaptcha
2. **Click:** "Create Key"
3. **Configure:**
   - Display name: `UnEvent Contact Form v3`
   - Platform: **Website**
   - Integration type: **Score-based (reCAPTCHA v3)** ⚠️ Important!
   - Domains:
     ```
     localhost
     127.0.0.1
     unevent.ro
     www.unevent.ro
     ```
4. **Click:** "Create"
5. **Copy both keys:**
   - Site key (public)
   - API key (secret)

## Get Your API Key

The API key is your "secret key" for backend verification:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Look for your API key, or create one:
   - Click "Create Credentials" → "API Key"
   - Copy the key
   - (Optional) Restrict it to reCAPTCHA Enterprise API only

## Environment Variables

### Frontend (.env.local)

```bash
# Your NEW score-based site key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_new_site_key_here

# Set to true for Enterprise
NEXT_PUBLIC_RECAPTCHA_ENTERPRISE=true

# Backend URL
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
```

### Backend (.env)

```bash
# Your API Key from Google Cloud Console
RECAPTCHA_SECRET_KEY=your_api_key_here

# Set to true for Enterprise
RECAPTCHA_ENTERPRISE=true

# Your Google Cloud Project ID (check in Cloud Console)
RECAPTCHA_PROJECT_ID=unevent

# Your site key (same as frontend)
RECAPTCHA_SITE_KEY=your_new_site_key_here

# Admin emails
ADMIN_EMAILS=contact@unevent.ro
```

## Verification Endpoint

Enterprise uses a different API:

**Regular v3:**
```
POST https://www.google.com/recaptcha/api/siteverify
```

**Enterprise:**
```
POST https://recaptchaenterprise.googleapis.com/v1/projects/unevent/assessments?key=API_KEY
```

Our backend automatically handles both!

## Testing

1. **Set all environment variables** (both frontend and backend)
2. **Enable reCAPTCHA Enterprise API:**
   - Go to: https://console.cloud.google.com/apis/library/recaptchaenterprise.googleapis.com
   - Click "Enable"
3. **Restart services:**
   ```bash
   # Backend
   cd apps/backend
   pnpm dev
   
   # Frontend
   cd apps/frontend
   pnpm dev
   ```
4. **Test the form:**
   - Go to http://localhost:3000/contact
   - Check console: Should see `✅ reCAPTCHA Enterprise script loaded`
   - Submit form
   - Check backend logs: Should see `✅ reCAPTCHA verified successfully (score: X.XX)`

## Common Issues

### Error: 400 Bad Request on script load
**Cause:** Key is Checkbox (v2), not Score-based (v3)
**Solution:** Create new Score-based key

### Error: "Invalid API key"
**Cause:** API key not found or restricted
**Solution:** Check API key in https://console.cloud.google.com/apis/credentials

### Error: "reCAPTCHA Enterprise API not enabled"
**Cause:** API not enabled in project
**Solution:** Enable at https://console.cloud.google.com/apis/library/recaptchaenterprise.googleapis.com

### Error: "Permission denied"
**Cause:** API key doesn't have permission
**Solution:** Check API key restrictions

## Verification Example

The backend sends this to Enterprise API:

```json
{
  "event": {
    "token": "user_token_from_frontend",
    "expectedAction": "contact_form",
    "siteKey": "6LfXMZ0qAAAAALaNDLO3pe_1qumzR1wS1jwPmEiO"
  }
}
```

And receives:

```json
{
  "tokenProperties": {
    "valid": true,
    "hostname": "unevent.ro",
    "action": "contact_form"
  },
  "riskAnalysis": {
    "score": 0.9,
    "reasons": []
  }
}
```

We check:
- `tokenProperties.valid` must be `true`
- `riskAnalysis.score` must be ≥ 0.5

## Cost Considerations

- **First 10,000 assessments/month:** Free
- **After 10,000:** $1 per 1,000 assessments

For a contact form, this is typically negligible.

## Alternative: Use Regular v3 (Free)

If you don't need Enterprise features:

1. Go to: https://www.google.com/recaptcha/admin/create
2. Choose "reCAPTCHA v3"
3. Add domains
4. Set `RECAPTCHA_ENTERPRISE=false` in both frontend and backend

Regular v3 is completely free and works great for most use cases!
