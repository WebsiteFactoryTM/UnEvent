# Sentry Monitoring Setup

This document describes the Sentry monitoring integration for both Backend (PayloadCMS) and Frontend (Next.js).

## Overview

Sentry is configured for error tracking and performance monitoring across:
- **Backend**: PayloadCMS v3 with Next.js (using `@payloadcms/plugin-sentry`)
- **Frontend**: Next.js 15 App Router

## Environment Variables

### Backend Environment Variables

Add these to your backend `.env` file:

```bash
# Sentry Configuration
SENTRY_DSN=https://your-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=unevent-backend
SENTRY_AUTH_TOKEN=your-auth-token  # For source maps upload
```

### Frontend Environment Variables

Add these to your frontend `.env.local` file:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=unevent-frontend
SENTRY_AUTH_TOKEN=your-auth-token  # For source maps upload
```

## Getting Your Sentry Credentials

1. **Create Projects in Sentry Dashboard**:
   - Go to https://sentry.io
   - Create two separate projects:
     - Backend: Platform: Node.js, Framework: Next.js
     - Frontend: Platform: JavaScript, Framework: Next.js

2. **Get DSN (Data Source Name)**:
   - In each project, go to Settings → Client Keys (DSN)
   - Copy the DSN for `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`

3. **Get Organization and Project Names**:
   - Organization slug: Found in URL or Settings → Organization Settings
   - Project slug: Found in project Settings → General Settings

4. **Create Auth Token** (for source maps upload):
   - Go to Settings → Auth Tokens (organization-level, not project-level)
   - Create a new token with `project:releases` scope
   - **Important**: This token is shared across all projects in your organization
   - Use the same token for both backend and frontend `SENTRY_AUTH_TOKEN`
   - If the wizard already created one for backend, you can reuse it for frontend

## Configuration Files

### Backend

- `apps/backend/sentry.server.config.ts` - Server-side Sentry configuration
- `apps/backend/sentry.edge.config.ts` - Edge runtime configuration
- `apps/backend/src/instrumentation-client.ts` - Client-side configuration
- `apps/backend/src/instrumentation.ts` - Next.js instrumentation
- `apps/backend/src/payload.config.ts` - PayloadCMS plugin configuration
- `apps/backend/next.config.mjs` - Sentry webpack plugin configuration

### Frontend

- `apps/frontend/sentry.client.config.ts` - Client-side Sentry configuration
- `apps/frontend/sentry.server.config.ts` - Server-side Sentry configuration
- `apps/frontend/sentry.edge.config.ts` - Edge runtime configuration
- `apps/frontend/instrumentation.ts` - Next.js instrumentation
- `apps/frontend/next.config.mjs` - Sentry webpack plugin configuration

## Features

### Automatic Error Tracking

- **Backend**: PayloadCMS plugin automatically tracks:
  - Collection operations (create, update, delete)
  - Hook errors
  - Authentication errors
  - Custom endpoint errors (with context)

- **Frontend**: Next.js integration automatically tracks:
  - Unhandled errors
  - React error boundaries
  - API route errors

### User Context

- **Backend**: Automatically set from `req.user` in PayloadCMS requests
- **Frontend**: Automatically set from NextAuth session via `SentryUserContext` component

### Performance Monitoring

- Transaction sampling: 10% in production, 100% in development
- Database query performance (when `pg` driver is injected)
- Page load times
- API endpoint performance

### Custom Tracking

Custom endpoints have Sentry tracking with context:
- `feedEndpoint.ts` - Feed API errors
- `seedEndpoint.ts` - Seed operation errors
- `homeListings.ts` - Home page data errors
- `hubEndpoint.ts` - Hub data errors
- `recordViews.ts` - View tracking errors
- `taxonomies.ts` - Taxonomy fetch errors

## Source Maps

Source maps are automatically uploaded during build via the Sentry webpack plugin configured in `next.config.mjs`. This provides readable stack traces in production.

## Accessing Sentry Dashboard

1. Go to https://sentry.io
2. Navigate to your organization
3. Select the project (backend or frontend)
4. View errors, performance metrics, and releases

## Testing

To test Sentry integration:

1. **Backend**: Trigger an error in a custom endpoint
2. **Frontend**: Trigger an error in a React component or API route
3. Check the Sentry dashboard for the error to appear

## Troubleshooting

- **No errors appearing**: Check that environment variables are set correctly
- **Source maps not working**: Verify `SENTRY_AUTH_TOKEN` is set and has correct permissions
- **User context missing**: Ensure user is authenticated and session is available

