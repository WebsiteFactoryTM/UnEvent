# Email Verification Options

## Summary

PayloadCMS has a built-in `verify: true` option that automatically:
- Generates verification tokens
- Sends verification emails (if email adapter is configured)
- Manages verification state

**However**, since you're using a custom worker queue system with React Email templates, you have two options:

## Option 1: Use Payload's Built-in Verification (Recommended for Simplicity)

### Setup

1. **Enable verification in `Users/index.ts`**:
   ```typescript
   auth: {
     verify: true, // Uncomment this
     maxLoginAttempts: 3,
     tokenExpiration: 24 * 60 * 60,
   }
   ```

2. **Configure email adapter in `payload.config.ts`** (if you want Payload to send emails):
   ```typescript
   import { resendAdapter } from '@payloadcms/email-resend'
   
   export default buildConfig({
     email: resendAdapter({
       defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'noreply@unevent.com',
       apiKey: process.env.RESEND_API_KEY,
     }),
     // ... rest of config
   })
   ```

3. **Customize the verification email** (optional):
   - Payload will use its default template
   - To use your custom template, you can override the email in a hook or disable Payload's email and use your queue system

### How It Works

- When `verify: true` is enabled, Payload automatically:
  - Generates `_verificationToken` on user creation
  - Sets user status to unverified
  - Provides `/api/users/verify/:token` endpoint
  - If email adapter is configured, sends verification email automatically

- Your `sendWelcomeEmail` hook will receive the token in `doc._verificationToken`
- You can use this token in your custom welcome email template

### Pros
- ✅ Automatic token generation and management
- ✅ Built-in verification endpoint
- ✅ No custom token logic needed

### Cons
- ⚠️ If you configure email adapter, Payload sends its own email (not your React Email template)
- ⚠️ You'd have two email systems (Payload's + your worker queue)

## Option 2: Custom Verification with Worker Queue (Recommended for Full Control)

### Setup

1. **Keep `verify: true` commented out** (or set to `false`)

2. **Generate your own verification token** in a `beforeChange` hook:
   ```typescript
   import crypto from 'crypto'
   
   export const generateVerificationToken: CollectionBeforeChangeHook = async ({
     data,
     operation,
   }) => {
     if (operation === 'create') {
       // Generate secure random token
       const token = crypto.randomBytes(32).toString('hex')
       data._verificationToken = token
       data._verificationTokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
     }
     return data
   }
   ```

3. **Add verification fields to User collection** (if not using Payload's built-in):
   ```typescript
   {
     name: '_verificationToken',
     type: 'text',
     admin: { readOnly: true, hidden: true },
   },
   {
     name: '_verificationTokenExpiration',
     type: 'date',
     admin: { readOnly: true, hidden: true },
   },
   {
     name: '_verified',
     type: 'checkbox',
     defaultValue: false,
   }
   ```

4. **Create verification endpoint**:
   ```typescript
   // In Users/endpoints/verifyEmail.ts
   export const verifyEmail = async (req: PayloadRequest) => {
     const { token } = req.query
     // Find user by token, verify, update _verified status
   }
   ```

5. **Your `sendWelcomeEmail` hook** will use the token you generated

### Pros
- ✅ Full control over verification flow
- ✅ Use your custom React Email templates
- ✅ Single email system (worker queue)
- ✅ Custom verification logic

### Cons
- ⚠️ More code to maintain
- ⚠️ Need to implement token generation and verification endpoint

## Current Implementation

The `sendWelcomeEmail` hook is set up to work with **both approaches**:

- If `verify: true` is enabled → uses `_verificationToken` from Payload
- If `verify: false` → falls back to `userId` (you'll need to implement custom verification)

## Recommendation

**Use Option 1** (Payload's `verify: true`) but **don't configure the email adapter**. Instead:
- Let Payload generate and manage tokens
- Use your `sendWelcomeEmail` hook to send the welcome email with the token via your worker queue
- This gives you the best of both worlds: automatic token management + your custom email templates

### Implementation

1. Uncomment `verify: true` in `Users/index.ts`
2. **Don't** add email adapter to `payload.config.ts` (or add it but disable auto-send)
3. Your `sendWelcomeEmail` hook will automatically receive `_verificationToken`
4. The token will be included in your custom welcome email (URL points to frontend)
5. Create a frontend page at `/confirm-email` that:
   - Reads the `token` query parameter
   - Calls Payload's `/api/users/verify/:token` endpoint
   - Shows success/error message to the user

**Frontend Flow:**
```
User clicks email link → Frontend /confirm-email?token=xxx
  → Frontend calls POST /api/users/verify/:token
  → Payload verifies token and updates user._verified = true
  → Frontend shows success message
```

**Environment Variable:**
Make sure `PAYLOAD_PUBLIC_FRONTEND_URL` is set in your backend `.env`:
```env
PAYLOAD_PUBLIC_FRONTEND_URL=http://localhost:3000  # or your production URL
```

This way you get:
- ✅ Automatic token generation (Payload)
- ✅ Custom email templates (your worker)
- ✅ Single email system (worker queue)
- ✅ Built-in verification endpoint (Payload)
- ✅ Frontend handles the user experience

