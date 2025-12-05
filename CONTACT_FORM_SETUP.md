# Contact Form Email Notifications - Setup Guide

## Environment Variables Required

### Frontend (apps/frontend/.env.local)

```bash
# reCAPTCHA Site Key (Public - safe to expose in frontend)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LfXMZ0qAAAAALaNDLO3pe_1qumzR1wS1jwPmEiO

# Set to true for Enterprise, false for regular v3 (default: false)
NEXT_PUBLIC_RECAPTCHA_ENTERPRISE=false

# Backend API URL
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
# Or for production:
# NEXT_PUBLIC_SERVER_URL=https://your-backend-domain.com
```

**Note:** If you get a 400 error when loading the reCAPTCHA script, your key is likely a regular v3 key, not Enterprise. Set `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE=false`.

### Backend (apps/backend/.env)

```bash
# reCAPTCHA Secret Key (Private - NEVER expose in frontend)
# For Enterprise: Use the API Key from Google Cloud Console
# For regular v3: Use the Secret Key from reCAPTCHA Admin
RECAPTCHA_SECRET_KEY=your_secret_or_api_key_here

# Set to true if using Enterprise, false for regular v3
RECAPTCHA_ENTERPRISE=true

# For Enterprise: Your Google Cloud Project ID (default: unevent)
RECAPTCHA_PROJECT_ID=unevent

# For Enterprise: Your site key (used in API calls)
RECAPTCHA_SITE_KEY=6LfXMZ0qAAAAALaNDLO3pe_1qumzR1wS1jwPmEiO

# Admin Email Recipients (comma-separated)
ADMIN_EMAILS=contact@unevent.ro,admin@unevent.ro

# Redis/Upstash Configuration (for worker queue)
UPSTASH_REDIS_URL=rediss://default:password@host:6380
```

## Features Implemented

### Backend
- ✅ `/api/contact` endpoint created
- ✅ reCAPTCHA Enterprise token verification
- ✅ Form validation (name, email, phone, subject, message)
- ✅ Redis queue integration for email notifications
- ✅ Score threshold: 0.5 (submissions below this are rejected)
- ✅ Input sanitization to prevent XSS
- ✅ Sentry error tracking integration

### Worker
- ✅ `admin.contact` email template created
- ✅ Registry updated with contact notification type
- ✅ Email includes all form fields with timestamp
- ✅ "Reply to" button in email

### Frontend
- ✅ reCAPTCHA Enterprise script integration
- ✅ `useRecaptcha` hook for token generation
- ✅ ContactForm updated to call backend endpoint
- ✅ Loading states and error handling
- ✅ Success toast notification

## How It Works

1. User fills out contact form on `/contact` page
2. On submit, frontend gets reCAPTCHA Enterprise token
3. Form data + token sent to `/api/contact` endpoint
4. Backend verifies token with Google (score must be ≥ 0.5)
5. Backend enqueues `admin.contact` job to Redis
6. Worker picks up job and sends email to admins
7. User sees success message

## Testing

### Test Successful Submission
1. Go to `/contact` page
2. Fill out all required fields
3. Submit form
4. Should see success toast
5. Check admin email for notification

### Test reCAPTCHA Verification
- Bot-like behavior should receive low score and be rejected
- Normal users should receive high score and pass through

### Test Error Handling
- Submit without required fields (frontend validation catches this)
- Test with backend offline (should show connection error)
- Test with invalid reCAPTCHA token

## reCAPTCHA Enterprise Configuration

The implementation uses:
- **Script URL**: `https://www.google.com/recaptcha/enterprise.js`
- **Verification API**: `https://www.google.com/recaptcha/api/siteverify`
- **Action**: `contact_form`
- **Score Threshold**: 0.5

## Email Template

Admins receive emails with:
- Sender name, email, phone
- Subject of inquiry
- Full message text
- Timestamp
- "Reply to" button

## Security Features

- ✅ Server-side reCAPTCHA verification (never trust frontend)
- ✅ Score-based spam protection
- ✅ Input sanitization (HTML/script tag removal)
- ✅ Token freshness validation
- ✅ Single-use tokens
- ✅ Rate limiting via reCAPTCHA score
