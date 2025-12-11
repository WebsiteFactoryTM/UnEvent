# Testing Claim Flow - API Guide

This guide outlines how to test the claim flow using API calls without the frontend.

## Prerequisites

1. **Backend running**: `http://localhost:4000` (or your PAYLOAD_PUBLIC_SERVER_URL)
2. **Frontend API running**: `http://localhost:3000` (or your NEXT_PUBLIC_FRONTEND_URL)
3. **Worker running**: For processing email notifications
4. **Redis running**: For notification queue
5. **Admin user**: You'll need an admin account to create unclaimed listings and approve claims

## Step 1: Create an Unclaimed Listing

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

## Step 3: View Claim Details

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
# Login
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "claimant@example.com",
    "password": "password123"
  }'
```

**Associate claim with profile:**
```bash
curl -X PATCH http://localhost:3000/api/claims/token/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "claim": {
    "id": 1,
    "claimantProfile": 123,
    ...
  }
}
```

## Step 5: Approve Claim (As Admin)

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

## Step 7: View User's Claims

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

## Step 9: Test Email Notifications

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

## Testing Checklist

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

## Common Issues

### Email not sending
- Check Redis connection
- Check worker is running
- Check `ADMIN_EMAILS` env variable
- Check email service (Resend) configuration

### Claim creation fails
- Verify listing exists
- Verify listing has `claimStatus: 'unclaimed'`
- Check for duplicate pending claims

### Ownership transfer fails
- Verify claimant has a profile
- Check claim status is `'approved'`
- Verify listing collection name matches

### Token lookup fails
- Verify token format (UUID)
- Check claim exists in database
- Verify token is not expired

## Direct Payload API Endpoints

You can also interact directly with Payload API:

**Create claim:**
```bash
POST http://localhost:4000/api/claims
```

**Get claim:**
```bash
GET http://localhost:4000/api/claims/{id}
```

**Update claim:**
```bash
PATCH http://localhost:4000/api/claims/{id}
```

**Query claims:**
```bash
GET http://localhost:4000/api/claims?where[status][equals]=pending
GET http://localhost:4000/api/claims?where[claimantEmail][equals]=test@example.com
```
