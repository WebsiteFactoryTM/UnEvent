# Contact Form Testing Guide

## Prerequisites

Before testing, ensure these environment variables are set:

### Frontend (.env.local)
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LfXMZ0qAAAAALaNDLO3pe_1qumzR1wS1jwPmEiO
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
```

### Backend (.env)
```bash
RECAPTCHA_SECRET_KEY=<your_enterprise_secret_key>
ADMIN_EMAILS=contact@unevent.ro
UPSTASH_REDIS_URL=<your_redis_url>
```

## Testing Checklist

### 1. Basic Functionality Test ✓

**Steps:**
1. Start backend: `cd apps/backend && pnpm dev`
2. Start worker: `cd apps/worker && pnpm dev`
3. Start frontend: `cd apps/frontend && pnpm dev`
4. Navigate to `http://localhost:3000/contact`
5. Verify reCAPTCHA badge appears in bottom-right corner

**Expected:** 
- ✅ Page loads without errors
- ✅ reCAPTCHA badge visible
- ✅ Form fields render correctly
- ✅ Submit button shows "Se încarcă..." until reCAPTCHA is ready

### 2. Successful Form Submission ✓

**Steps:**
1. Fill out form with valid data:
   - Nume complet: "Test User"
   - Telefon: "0712345678"
   - Email: "test@example.com"
   - Subiect: "Întrebare generală"
   - Mesaj: "This is a test message to verify the contact form works."
2. Check privacy consent checkbox
3. Click "Trimite"

**Expected:**
- ✅ Submit button shows "Se trimite..." during submission
- ✅ Success toast appears: "Mesaj trimis cu succes!"
- ✅ Form fields are cleared after successful submission
- ✅ Backend console logs: `[ContactEndpoint] ✅ reCAPTCHA verified successfully`
- ✅ Backend console logs: `[ContactEndpoint] ✅ Enqueued admin.contact notification`
- ✅ Worker processes job and sends email
- ✅ Admin receives email with all form data

### 3. Frontend Validation Test ✓

**Steps:**
1. Try submitting form with:
   - Empty fields
   - Invalid email format
   - Short name (< 2 characters)
   - Short message (< 10 characters)
   - Unchecked privacy consent

**Expected:**
- ✅ Form validation catches errors before submission
- ✅ Error messages appear below invalid fields
- ✅ Submit button disabled or validation errors shown
- ✅ No API call made until all fields valid

### 4. Backend Validation Test ✓

**Steps:**
1. Use browser DevTools to send POST to `/api/contact` with:
   - Missing required fields
   - No reCAPTCHA token
   - Invalid reCAPTCHA token

**Expected:**
- ✅ Missing fields: 400 error "Missing required fields"
- ✅ No token: 400 error "reCAPTCHA token is required"
- ✅ Invalid token: 400 error "reCAPTCHA verification failed"

### 5. reCAPTCHA Verification Test ✓

**Test Low Score:**
- Use automated testing tools or bot-like behavior
- Expected: Backend rejects with "Submission rejected. Please try again later."
- Backend logs show: `reCAPTCHA score too low: X.XX (min: 0.5)`

**Test High Score:**
- Normal user behavior, filling form naturally
- Expected: Submission succeeds
- Backend logs show: `✅ reCAPTCHA verified successfully (score: X.XX)`

### 6. Email Delivery Test ✓

**Steps:**
1. Submit contact form successfully
2. Check admin inbox (configured in ADMIN_EMAILS)

**Expected Email Content:**
```
Subject: 📬 Mesaj nou de contact: [subject]

Un nou mesaj de contact a fost primit prin formularul de pe site.

Date contact:
- Nume: Test User
- Email: test@example.com
- Telefon: 0712345678
- Subiect: Întrebare generală

Mesaj:
This is a test message to verify the contact form works.

Trimis pe: [timestamp]

[Răspunde la mesaj button]
```

### 7. Worker Queue Test ✓

**Steps:**
1. Check Redis queue for `notifications` jobs
2. Monitor worker console output

**Expected:**
- ✅ Job appears in Redis with type `admin.contact`
- ✅ Worker console shows: `Processing admin.contact notification`
- ✅ Worker console shows: `✅ Email sent successfully`
- ✅ Job marked as completed in Redis

### 8. Error Handling Tests ✓

**Test Backend Offline:**
1. Stop backend server
2. Try submitting form
3. Expected: Error toast "Eroare de conexiune. Te rugăm să reîncerci."

**Test Redis Offline:**
1. Stop Redis/disable UPSTASH_REDIS_URL
2. Submit form
3. Expected: 
   - Form submission succeeds (graceful degradation)
   - Backend logs: `⚠️ Skipping admin.contact - Redis unavailable`
   - User still sees success message (to not disrupt UX)

**Test reCAPTCHA Not Ready:**
1. Block reCAPTCHA script in DevTools
2. Form should disable submit button
3. Button text shows "Se încarcă..."

### 9. Multiple Admin Recipients Test ✓

**Steps:**
1. Set `ADMIN_EMAILS=admin1@unevent.ro,admin2@unevent.ro,admin3@unevent.ro`
2. Submit contact form
3. Check all admin inboxes

**Expected:**
- ✅ All admins receive the email
- ✅ Email content is identical for all recipients

### 10. Security Tests ✓

**Test XSS Prevention:**
1. Submit form with HTML/script tags in message:
   ```
   <script>alert('xss')</script>
   <b>bold text</b>
   ```
2. Check received email

**Expected:**
- ✅ HTML tags are stripped
- ✅ Email contains: `alert('xss') bold text`

**Test SQL Injection:**
1. Submit with special characters: `' OR 1=1 --`
2. Expected: ✅ Form processes normally, no SQL errors

### 11. Performance Test ✓

**Steps:**
1. Submit multiple forms in quick succession
2. Monitor backend and worker performance

**Expected:**
- ✅ reCAPTCHA score may decrease for rapid submissions
- ✅ Worker processes jobs in order
- ✅ No memory leaks or performance degradation

## Common Issues & Solutions

### Issue: "reCAPTCHA not ready yet"
**Solution:** 
- Check `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set correctly
- Verify reCAPTCHA script loads (check Network tab)
- Wait a few seconds for script to initialize

### Issue: "reCAPTCHA verification failed"
**Solution:**
- Verify `RECAPTCHA_SECRET_KEY` matches site key
- Check backend can reach `www.google.com`
- Ensure using Enterprise keys (not v2/v3 keys)

### Issue: Email not received
**Solution:**
- Check `ADMIN_EMAILS` environment variable
- Verify Redis connection is working
- Check worker is running and processing jobs
- Check spam folder
- Verify Resend API key is configured

### Issue: Backend returns 500 error
**Solution:**
- Check backend logs for detailed error
- Verify all required env variables are set
- Check Sentry for error reports

## Monitoring

### Backend Console
Look for these log messages:
- `✅ reCAPTCHA verified successfully (score: X.XX)`
- `✅ Enqueued admin.contact notification (job: xxx)`
- `⚠️` warnings indicate non-critical issues
- `❌` errors indicate failures

### Worker Console
Look for these log messages:
- `Processing admin.contact notification`
- `✅ Email sent successfully`
- `Completed job xxx`

### Redis/BullMQ Dashboard
- Check job counts (completed, failed, waiting)
- Monitor job processing times
- Review failed job details

## Success Criteria

All tests pass when:
- ✅ Form submits successfully with valid data
- ✅ reCAPTCHA verification works correctly
- ✅ Admin receives email with all form data
- ✅ Error handling works gracefully
- ✅ No linter errors or console warnings
- ✅ Security measures prevent XSS and spam
- ✅ Performance is acceptable (< 3s submission time)

## Next Steps

After successful testing:
1. Deploy backend with production environment variables
2. Deploy worker with production Redis
3. Deploy frontend with production reCAPTCHA keys
4. Test on production environment
5. Monitor Sentry for any errors
6. Check email delivery rates
7. Adjust reCAPTCHA score threshold if needed
