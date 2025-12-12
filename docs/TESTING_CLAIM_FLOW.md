# Testing Claim Flow - Complete Guide

This guide outlines how to test the claim flow using both API calls and the frontend UI.

## Prerequisites

1. **Backend running**: `http://localhost:4000` (or your PAYLOAD_PUBLIC_SERVER_URL)
2. **Frontend API running**: `http://localhost:3000` (or your NEXT_PUBLIC_FRONTEND_URL)
3. **Worker running**: For processing email notifications
4. **Redis running**: For notification queue
5. **Admin user**: You'll need an admin account to create unclaimed listings and approve claims

---

## Backend API Testing

### Step 1: Create an Unclaimed Listing

### Option A: Via Payload Admin UI
1. Go to `http://localhost:4000/admin`
2. Login as admin
3. Navigate to Locations/Events/Services
4. Create a new listing with:
   - `claimStatus: 'unclaimed'`
   - `contact.email: 'test@example.com'` (required for invitation email)
   - Set `owner` to a system/generic profile (or any profile)

### Option B: Via Direct Payload API

**Login as admin first:**
```bash
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Create unclaimed location:**
```bash
curl -X POST http://localhost:4000/api/locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Venue",
    "description": "A test venue for claiming",
    "city": 1,
    "address": "Test Street 123",
    "claimStatus": "unclaimed",
    "contact": {
      "email": "venue.owner@example.com",
      "phone": "+40712345678"
    },
    "type": [1],
    "suitableFor": [1],
    "moderationStatus": "approved"
  }'
```

**Note:** Replace `city`, `type`, `suitableFor` with actual IDs from your database.

**Expected Result:**
- Listing created with `claimStatus: 'unclaimed'`
- Email notification queued: `listing.claim.invitation`
- Check worker logs for email job processing

## Step 2: Submit a Claim (As Unauthenticated User)

**Create claim via frontend API:**
```bash
curl -X POST http://localhost:3000/api/claims \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": 96,
    "listingType": "locations",
    "claimantEmail": "claimant@example.com",
    "claimantName": "John Doe",
    "claimantPhone": "+40712345678"
  }'
```

**Note:** The frontend API will automatically format the polymorphic `listing` relationship as `{ relationTo: "locations", value: 96 }` before sending to Payload.

**Response:**
```json
{
  "success": true,
  "claimId": 1,
  "claimToken": "550e8400-e29b-41d4-a716-446655440000",
  "profileId": null
}
```

**Expected Result:**
- Claim created with `status: 'pending'`
- `claimToken` generated automatically
- Admin notification queued: `admin.claim.pending`
- Check Payload admin UI → Claims collection to see the new claim

### Step 3: View Claim Details

**Get claim by token:**
```bash
curl http://localhost:3000/api/claims/token/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "claim": {
    "id": 1,
    "claimToken": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "claimantEmail": "claimant@example.com",
    "listing": { ... },
    ...
  }
}
```

**Get claim by ID:**
```bash
curl http://localhost:3000/api/claims/1
```

## Step 4: Associate Claim with Profile (After Signup)

**First, login or create a user account:**

```bash
# Login and get token
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "claimant@example.com",
    "password": "password123"
  }'
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "email": "claimant@example.com",
    "profile": 456,
    ...
  }
}
```

**Extract the token from the response and use it to associate the claim:**

```bash
# Replace YOUR_TOKEN_HERE with the token from login response
# Replace CLAIM_TOKEN with the actual claim token from Step 2
curl -X PATCH http://localhost:3000/api/claims/token/CLAIM_TOKEN \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Note:** The PATCH request does NOT require a body - it automatically associates the authenticated user's profile with the claim.

**Response:**
```json
{
  "success": true,
  "claim": {
    "id": 1,
    "claimantProfile": 456,
    "claimToken": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    ...
  }
}
```

**Example with actual values:**
```bash
# 1. Login first
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "claimant@example.com",
    "password": "password123"
  }')

# 2. Extract token (requires jq: brew install jq)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

# 3. Associate claim with profile
curl -X PATCH http://localhost:3000/api/claims/token/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 5: Approve Claim (As Admin)

**Approve claim via Payload API:**
```bash
curl -X PATCH http://localhost:4000/api/claims/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "status": "approved"
  }'
```

**Expected Result:**
- Claim `status` changed to `'approved'`
- Listing `owner` transferred to claimant's profile
- Listing `claimStatus` changed to `'claimed'`
- User notification queued: `claim.approved`
- Check listing to verify ownership transfer

**Verify ownership transfer:**
```bash
curl http://localhost:4000/api/locations/1 \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

**Check:**
- `owner` should be the claimant's profile ID
- `claimStatus` should be `'claimed'`

## Step 6: Test Claim Rejection

**Reject a claim:**
```bash
curl -X PATCH http://localhost:4000/api/claims/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "status": "rejected",
    "rejectionReason": "Unable to verify ownership"
  }'
```

**Expected Result:**
- Claim `status` changed to `'rejected'`
- `rejectionReason` saved
- User notification queued: `claim.rejected`
- Listing ownership remains unchanged

### Step 7: View User's Claims

**Get user's claims (requires authentication):**
```bash
curl http://localhost:3000/api/claims/my-claims?listingType=locations \
  -H "Authorization: Bearer USER_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": 1,
      "status": "approved",
      "listing": { ... },
      ...
    }
  ],
  "totalDocs": 1
}
```

**Filter by status:**
```bash
curl http://localhost:3000/api/claims/my-claims?status=pending \
  -H "Authorization: Bearer USER_TOKEN_HERE"
```

## Step 8: Test Duplicate Claim Prevention

**Try to create duplicate claim:**
```bash
curl -X POST http://localhost:3000/api/claims \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": 1,
    "listingType": "locations",
    "claimantEmail": "claimant@example.com"
  }'
```

**Expected Result:**
- Error: `409 Conflict`
- Message: `"A pending claim already exists for this listing and email"`

### Step 9: Test Email Notifications

### Check Email Queue (Redis)
If you have Redis CLI access:
```bash
redis-cli
> KEYS bull:notifications:*
> LRANGE bull:notifications:waiting 0 -1
```

### Check Worker Logs
Look for log messages like:
- `✅ Enqueued listing.claim.invitation for locations 1`
- `✅ Enqueued admin.claim.pending for claim 1`
- `✅ Enqueued claim.approved for claim 1`

### Verify Email Templates
Check that emails are being processed:
- Admin receives `admin.claim.pending` when claim is created
- User receives `claim.approved` when claim is approved
- User receives `claim.rejected` when claim is rejected
- User receives `listing.claim.invitation` when unclaimed listing is created

---

## Frontend UI Testing

### Step 1: Verify Unclaimed Badge Display

**On Listing Cards:**
1. Navigate to homepage or listing type pages (`/locatii`, `/servicii`, `/evenimente`)
2. Look for listings with `claimStatus: 'unclaimed'`
3. **Expected:** Orange "Nerevindicat" badge visible on listing cards

**On Listing Detail Pages:**
1. Navigate to an unclaimed listing detail page: `/locatii/[slug]` or `/servicii/[slug]` or `/evenimente/[slug]`
2. **Expected:** 
   - "Nerevindicat" badge visible in hero section
   - CTA button with dynamic text:
     - Locations: "Ești proprietarul acestei locații?"
     - Services: "Ești furnizorul acestui serviciu?"
     - Events: "Ești organizatorul acestui eveniment?"

### Step 2: Test Discovery Flow (Dialog)

**From Listing Detail Page:**
1. Navigate to an unclaimed listing: `http://localhost:3000/locatii/[slug]`
2. Click the CTA button (e.g., "Ești proprietarul acestei locații?")
3. **Expected:** Dialog/modal opens with claim form
4. Fill in the form:
   - Email (required)
   - Name (optional)
   - Phone (optional)
5. Click "Revendică listarea"
6. **Expected:**
   - Success toast notification
   - Dialog closes
   - If not authenticated: Redirects to `/auth/inregistrare?claimToken=...`
   - If authenticated: Stays on page, shows success message

### Step 3: Test Email Flow (Page-Based)

**Direct URL Access:**
1. Navigate directly to claim page:
   ```
   http://localhost:3000/claim?listingId=96&listingType=locations
   ```
2. **Expected:**
   - Page loads with listing preview card (image, title, description, location, rating)
   - "Nerevindicat" badge visible on preview
   - Claim form below preview
   - Link to "Vezi detalii complete" listing page

**With Email Pre-fill:**
1. Navigate with email param:
   ```
   http://localhost:3000/claim?listingId=96&listingType=locations&email=test@example.com
   ```
2. **Expected:** Email field is pre-filled with `test@example.com`

**Submit Claim:**
1. Fill in form (email may be pre-filled)
2. Click "Revendică listarea"
3. **Expected:**
   - Success alert appears: "Cererea ta de revendicare a fost trimisă cu succes!"
   - After 2-3 seconds:
     - If authenticated: Redirects to listing page
     - If not authenticated: Redirects to `/auth/inregistrare?claimToken=...`

**Test Invalid Listing:**
1. Try accessing claim page for claimed listing:
   ```
   http://localhost:3000/claim?listingId=1&listingType=locations
   ```
   (where listing has `claimStatus: 'claimed'`)
2. **Expected:** Redirects to listing detail page

**Test Missing Params:**
1. Try accessing without required params:
   ```
   http://localhost:3000/claim
   ```
2. **Expected:** 404 Not Found page

### Step 4: Test Claim Form Validation

**Required Field:**
1. Try submitting form without email
2. **Expected:** Validation error: "Email-ul este obligatoriu."

**Invalid Email:**
1. Enter invalid email format (e.g., "notanemail")
2. **Expected:** Validation error: "Te rugăm să introduci o adresă de email validă."

**Duplicate Claim:**
1. Submit claim for a listing you already claimed
2. **Expected:** Error toast: "Ai trimis deja o cerere de revendicare pentru această listare."

---

## Email Flow Testing

### Step 1: Test Email Invitation Link

**Simulate Email Click:**
1. When an unclaimed listing is created with `contact.email`, an invitation email is sent
2. The email contains a link like:
   ```
   http://localhost:3000/claim?listingId=96&listingType=locations
   ```
3. Click the link (or navigate manually)
4. **Expected:** Claim page loads with listing preview and form

**With Email in Link:**
1. Email link may include email param:
   ```
   http://localhost:3000/claim?listingId=96&listingType=locations&email=venue.owner@example.com
   ```
2. **Expected:** Email field is pre-filled

### Step 2: Test Email Notification Links

**Claim Approval Email:**
1. After admin approves a claim, user receives email
2. Email contains link to listing
3. **Expected:** Link works and shows claimed listing (no claim form)

**Claim Rejection Email:**
1. After admin rejects a claim, user receives email
2. Email contains support contact info
3. User can resubmit claim if needed

---

## Discovery Flow Testing

### Step 1: Browse Unclaimed Listings

1. Navigate to listing type pages:
   - `http://localhost:3000/locatii`
   - `http://localhost:3000/servicii`
   - `http://localhost:3000/evenimente`
2. **Expected:** Unclaimed listings show "Nerevindicat" badge on cards

### Step 2: View Listing Detail

1. Click on an unclaimed listing card
2. Navigate to detail page: `/locatii/[slug]`
3. **Expected:**
   - "Nerevindicat" badge in hero section
   - CTA button visible
   - Listing content displays normally

### Step 3: Open Claim Dialog

1. Click CTA button on listing detail page
2. **Expected:**
   - Dialog opens smoothly
   - Form is visible and functional
   - Dialog can be closed with X button or outside click

---

## Signup Integration Testing

### Step 1: Submit Claim Without Account

1. Navigate to claim page or use dialog
2. Submit claim with email that doesn't have an account
3. **Expected:**
   - Success message
   - Redirects to `/auth/inregistrare?claimToken=...`
   - Claim token stored in localStorage

### Step 2: Sign Up with Claim Token

1. After redirect to signup page, complete signup form
2. Use the email from the claim submission
3. **Expected:**
   - Account created successfully
   - `ClaimTokenHandler` component detects token
   - Claim automatically associated with new profile
   - Success toast: "Cererea ta de revendicare a fost asociată cu contul tău."
   - Token removed from localStorage

### Step 3: Test Existing User Flow

1. Submit claim with email that already has an account
2. **Expected:**
   - Success message
   - Redirects to `/auth/inregistrare?claimToken=...`
3. Instead of signing up, login:
   ```
   http://localhost:3000/auth/autentificare
   ```
4. After login, **Expected:**
   - `ClaimTokenHandler` detects token from URL or localStorage
   - Claim automatically associated with profile
   - Success toast appears

### Step 4: Test Token Persistence

1. Submit claim → Redirected to signup
2. Close browser or navigate away
3. Return to signup page later
4. **Expected:** Token still in localStorage, claim associates after signup/login

---

## Testing Checklist

### Backend API
- [ ] Create unclaimed listing with `contact.email`
- [ ] Verify invitation email is queued
- [ ] Submit claim as unauthenticated user
- [ ] Verify claim token is generated
- [ ] Verify admin notification is sent
- [ ] View claim by token
- [ ] Associate claim with profile after signup
- [ ] Approve claim as admin
- [ ] Verify ownership transfer
- [ ] Verify user receives approval email
- [ ] Test claim rejection
- [ ] Verify user receives rejection email
- [ ] Test duplicate claim prevention
- [ ] View user's claims list
- [ ] Filter claims by status/listingType

### Frontend UI
- [ ] "Nerevindicat" badge displays on listing cards
- [ ] "Nerevindicat" badge displays on listing detail pages
- [ ] CTA button displays with correct text for each listing type
- [ ] Dialog opens when clicking CTA from listing page
- [ ] Claim form validates required fields
- [ ] Claim form validates email format
- [ ] Success state displays after submission
- [ ] Error messages display for duplicate claims
- [ ] Claim page loads with listing preview
- [ ] Claim page pre-fills email from URL params
- [ ] Claim page redirects if listing is already claimed
- [ ] Claim page shows 404 for invalid/missing params

### Email Flow
- [ ] Email invitation link works correctly
- [ ] Email pre-fill works from URL params
- [ ] Claim page accessible from email link
- [ ] Listing preview displays correctly on claim page

### Signup Integration
- [ ] Unauthenticated claim redirects to signup
- [ ] Claim token stored in localStorage
- [ ] Claim token passed in signup URL
- [ ] Claim associates automatically after signup
- [ ] Claim associates automatically after login
- [ ] Token removed from localStorage after association
- [ ] Success toast appears after association

## Common Issues

### Email not sending
- Check Redis connection
- Check worker is running
- Check `ADMIN_EMAILS` env variable
- Check email service (Resend) configuration
- Check rate limiting (Resend: 2 requests/second)

### Claim creation fails
- Verify listing exists
- Verify listing has `claimStatus: 'unclaimed'`
- Check for duplicate pending claims
- Verify frontend API route is accessible
- Check browser console for errors

### Ownership transfer fails
- Verify claimant has a profile
- Check claim status is `'approved'`
- Verify listing collection name matches
- Check backend logs for hook errors
- Verify `transferOwnership` hook executed

### Token lookup fails
- Verify token format (UUID)
- Check claim exists in database
- Verify token is not expired
- Check frontend API route `/api/claims/token/[token]`

### Frontend UI Issues
- **Badge not showing:** Verify `claimStatus` is included in listing data from API
- **CTA not appearing:** Check listing has `claimStatus: 'unclaimed'`
- **Dialog not opening:** Check browser console for JavaScript errors
- **Form not submitting:** Verify API endpoint `/api/claims` is accessible
- **Redirect not working:** Check `useCreateClaim` hook logic
- **Token not associating:** Verify `ClaimTokenHandler` is in Providers, check localStorage

### Claim Page Issues
- **404 on claim page:** Verify `listingId` and `listingType` params are correct
- **Listing preview not loading:** Check `fetchListingById` function
- **Email not pre-filled:** Verify email param in URL
- **Redirect loop:** Check listing `claimStatus` - should redirect if already claimed

## Direct Payload API Endpoints

You can also interact directly with Payload API:

**Create claim (use custom endpoint):**
```bash
POST http://localhost:4000/api/claims/create
Content-Type: application/json

{
  "listingId": 96,
  "listingType": "locations",
  "claimantEmail": "test@example.com",
  "claimantName": "John Doe",
  "claimantPhone": "+40712345678"
}
```

**Get claim by token:**
```bash
GET http://localhost:4000/api/claims/by-token?token=550e8400-e29b-41d4-a716-446655440000
```

**Associate claim with profile:**
```bash
PATCH http://localhost:4000/api/claims/associate-profile?token=550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer USER_TOKEN
```

**Get claim:**
```bash
GET http://localhost:4000/api/claims/{id}
Authorization: Bearer ADMIN_TOKEN
```

**Update claim (admin only):**
```bash
PATCH http://localhost:4000/api/claims/{id}
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "status": "approved"
}
```

**Query claims:**
```bash
GET http://localhost:4000/api/claims?where[status][equals]=pending
GET http://localhost:4000/api/claims?where[claimantEmail][equals]=test@example.com
```

## Frontend Routes

**Claim Page:**
```
GET http://localhost:3000/claim?listingId=96&listingType=locations&email=test@example.com
```

**Frontend API Routes:**
```
POST   /api/claims                              - Create claim
GET    /api/claims/token/[token]                - Get claim by token
PATCH  /api/claims/token/[token]                - Associate claim with profile
GET    /api/claims/[id]                         - Get claim by ID
GET    /api/claims/my-claims                    - Get user's claims
```

## Quick Test Scenarios

### Scenario 1: Complete Email Flow
1. Admin creates unclaimed listing with `contact.email`
2. Email sent with claim link
3. User clicks link → Lands on `/claim` page
4. User sees listing preview + form
5. User submits claim → Redirects to signup
6. User signs up → Claim auto-associated
7. Admin approves claim → Ownership transferred
8. User receives approval email

### Scenario 2: Discovery Flow
1. User browses listings → Sees "Nerevindicat" badge
2. User clicks on unclaimed listing
3. User sees CTA button → Clicks it
4. Dialog opens with claim form
5. User submits claim → Success message
6. If not authenticated → Redirects to signup
7. If authenticated → Stays on page

### Scenario 3: Already Authenticated User
1. User is logged in
2. User finds unclaimed listing
3. User submits claim via dialog or page
4. Claim created with `claimantProfile` already set
5. Admin approves → Ownership transferred immediately
6. User receives approval email
