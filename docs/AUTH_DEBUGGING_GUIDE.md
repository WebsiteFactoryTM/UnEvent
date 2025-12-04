# Authentication Debugging Guide

## Issue
Protected `/cont/*` pages are being blocked on live domain after switching to production.

## Changes Made

### 1. Fixed Cookie Domain Configuration
- Added proper validation for `COOKIE_DOMAIN` to prevent invalid empty string errors
- Made domain attribute conditional on valid non-empty `COOKIE_DOMAIN`

### 2. Added Debug Logging

#### In `apps/frontend/auth.ts`:
- Environment variable validation on startup
- Logs critical config on server start
- JWT callback logs when user logs in
- JWT callback logs when session expires or loses accessToken

#### In `apps/frontend/middleware.ts`:
- Logs every protected route access attempt
- Shows whether token exists, has accessToken, or has errors
- Shows decision reason (ALLOWED vs BLOCKED)

### 3. Enabled NextAuth Debug Mode
Temporarily enabled `debug: true` in production to get detailed NextAuth logs.

## Required Environment Variables

### Production Frontend
```bash
# Critical - Must be set
NEXTAUTH_SECRET="your-production-secret-here"  # MUST be different from dev
NEXTAUTH_URL="https://unevent.ro"              # Your live frontend URL

# API Configuration
NEXT_PUBLIC_API_URL="https://server.unevent.ro"  # Your backend URL
API_URL="https://server.unevent.ro"              # Same as above for SSR

# Optional - Only if sharing cookies across subdomains
COOKIE_DOMAIN=""  # Leave empty for same-origin cookies (recommended)
# COOKIE_DOMAIN=".unevent.ro"  # Only use if you need cross-subdomain cookies
```

### Common Issues & Solutions

#### Issue 1: "option domain is invalid"
**Cause**: `COOKIE_DOMAIN` set to empty string or invalid value
**Solution**: Remove `COOKIE_DOMAIN` from environment variables OR set to valid domain like `.unevent.ro`

#### Issue 2: Session not persisting after login
**Cause**: 
- `NEXTAUTH_URL` not set or incorrect
- `NEXTAUTH_SECRET` not set or different between deployments
- Cookie `secure` flag causing issues with HTTP

**Solution**:
1. Set `NEXTAUTH_URL` to your exact production URL
2. Set `NEXTAUTH_SECRET` to a strong random string (use `openssl rand -base64 32`)
3. Ensure you're using HTTPS in production

#### Issue 3: Middleware blocking all /cont requests
**Cause**: Token not being read from cookies

**Solution**: Check server logs for:
```
[Middleware] BLOCKED: No token found
```
This means NextAuth can't read the session cookie. Verify:
- `NEXTAUTH_URL` matches your domain
- Cookies are enabled in browser
- No ad blockers interfering

## Debugging Steps

### Step 1: Check Server Logs on Startup
Look for:
```
[Auth Config] Environment check: { ... }
```

Verify:
- `isProduction: true`
- `hasNextAuthSecret: true` (MUST be true)
- `hasNextAuthUrl: true` (Should be true)
- `nextAuthUrl: "https://unevent.ro"` (Should match your domain)
- `hasApiUrl: true`
- `apiUrl: "https://server.unevent.ro"`

### Step 2: Attempt Login
After logging in, check logs for:
```
[JWT Callback] New user login: { userId: ..., email: ..., hasToken: true }
```

If you don't see this, the login request isn't reaching the JWT callback.

### Step 3: Navigate to /cont Page
Check logs for:
```
[Middleware] Protected route access attempt: { ... }
```

Look at the decision:
- `ALLOWED: Has accessToken` - Good! 
- `BLOCKED: No token found` - Session cookie not readable
- `BLOCKED: Definitive error` - Token expired

### Step 4: Check Browser Cookies
Open DevTools → Application → Cookies → `https://unevent.ro`

Look for:
- `next-auth.session-token` (or `__Secure-next-auth.session-token` on HTTPS)
- Should have `HttpOnly: true`
- Should have `Secure: true` (in production)
- Should have `SameSite: Lax` (if no COOKIE_DOMAIN set)

If cookie is missing:
1. Login might have failed silently
2. `NEXTAUTH_URL` mismatch
3. `NEXTAUTH_SECRET` issue

## Quick Fix Checklist

- [ ] `NEXTAUTH_SECRET` is set and is a strong random string
- [ ] `NEXTAUTH_SECRET` is the SAME across all frontend instances
- [ ] `NEXTAUTH_URL` is set to `https://unevent.ro`
- [ ] `NEXT_PUBLIC_API_URL` is set to `https://server.unevent.ro`
- [ ] `COOKIE_DOMAIN` is either not set OR set to valid domain
- [ ] Using HTTPS in production (not HTTP)
- [ ] No proxy/CDN stripping cookies
- [ ] Deployed latest code with debug logging

## After Debugging

Once issue is resolved, remember to:
1. Change `debug: true` back to `debug: process.env.NODE_ENV === "development"`
2. Remove or comment out console.log statements
3. Redeploy

## Still Not Working?

Share the output from:
1. Server startup logs (environment check)
2. Login attempt logs
3. Middleware logs when accessing /cont
4. Browser cookies screenshot

This will help diagnose the exact issue.

