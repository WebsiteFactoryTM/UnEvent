# Worker Service

Long-running worker service that processes email notifications (event-driven) and runs scheduled cronjobs using BullMQ + Upstash Redis.

## Features

- **Event-driven email notifications**: Processes jobs enqueued from Payload hooks
- **Scheduled cronjobs**: Runs time-based jobs using BullMQ schedulers
- **Healthcheck endpoints**: HTTP server for monitoring (`/health`, `/ready`)
- **Sentry integration**: Error tracking and performance monitoring
- **Graceful shutdown**: Handles SIGTERM/SIGINT signals properly

## Architecture

### Queues

- **notifications**: Event-driven email notifications from Payload hooks
- **maintenance**: Scheduled maintenance tasks and cronjobs

### Processors

- **notifications processor**: Handles notification jobs (e.g., `event.reminder.24h`)
- **maintenance processor**: Handles maintenance jobs (e.g., `admin.digest.daily`)

### Schedulers

- **Heartbeat**: Runs every 1 minute to verify worker is alive
- **Admin Digest**: Runs daily at 07:00 UTC (configurable via `ADMIN_DIGEST_TIME`)

## Setup

### Prerequisites

- Node.js 20.11.1+ (see `package.json` engines)
- pnpm 9.1.0+
- Redis (Upstash or local)

### Installation

From the monorepo root:

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in `apps/worker/` or set these in your environment:

#### Required

- `UPSTASH_REDIS_URL` - Upstash Redis TLS connection string (preferred)
  - OR use fallback: `REDIS_HOST`, `REDIS_PASSWORD`, `REDIS_PORT`
  - **Important**: Redis eviction policy must be set to `noeviction` (see Troubleshooting section)

#### Optional

- `PORT` - Healthcheck server port (default: `3001`)
- `NODE_ENV` - Environment mode (`development`, `production`, etc.)
- `SENTRY_DSN` - Sentry DSN for error tracking
- `SENTRY_ENVIRONMENT` - Sentry environment (defaults to `NODE_ENV`)
- `ADMIN_DIGEST_TIME` - Admin digest schedule time in `HH:MM` format (default: `07:00`)

#### Email Configuration (Resend)

- `RESEND_API_KEY` - Resend API key for sending emails (required for email sending)
- `RESEND_FROM_EMAIL` - From email address (default: `noreply@unevent.ro`)
- `TEST_EMAIL` - **Development only**: Override all email recipients to this address (required for Resend testing without domain verification)
- `RESEND_OVERRIDE_TO` - Alternative override for all email recipients in non-production (fallback if `TEST_EMAIL` not set)
- `ADMIN_EMAILS` - Comma-separated list of admin emails for daily digest (default: `admin@unevent.ro`)

**Email Behavior:**
- If `RESEND_API_KEY` is not set, emails are logged but not sent
- In `NODE_ENV=production`: emails are sent to real recipients
- In non-production: 
  - If `TEST_EMAIL` is set, all emails go to that address (recommended for development)
  - Otherwise, if `RESEND_OVERRIDE_TO` is set, all emails go to that address
  - Otherwise, emails are sent to real recipients (may fail without domain verification)

**Note**: Resend requires domain verification to send to arbitrary recipients. In development, use `TEST_EMAIL` set to your Resend account email (e.g., `office.pixelfactory@gmail.com`) to test without domain verification.

#### Example `.env`

```env
# Redis (Upstash TLS - preferred)
UPSTASH_REDIS_URL=rediss://default:password@host:6380

# OR Redis fallback
# REDIS_HOST=localhost
# REDIS_PASSWORD=
# REDIS_PORT=6379
# REDIS_TLS=false

# Server
PORT=3001
NODE_ENV=development

# Sentry
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=development

# Scheduler
ADMIN_DIGEST_TIME=07:00

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@unevent.ro
# In development, use TEST_EMAIL to avoid Resend domain verification requirements:
TEST_EMAIL=contact@unevent.ro
# Alternative override (fallback if TEST_EMAIL not set):
# RESEND_OVERRIDE_TO=test@example.com
ADMIN_EMAILS=contact@unevent.ro,admin2@unevent.ro
```

## Development

### Run locally

From the monorepo root:

```bash
# Start worker in development mode (with watch)
pnpm dev:worker

# Or from apps/worker directory
cd apps/worker
pnpm dev
```

### Build

```bash
# From monorepo root
pnpm --filter @unevent/worker build

# Or from apps/worker directory
cd apps/worker
pnpm build
```

### Start production build

```bash
# From monorepo root
pnpm start:worker

# Or from apps/worker directory
cd apps/worker
pnpm start
```

### Seed test job

Enqueue a test `ping` job to the notifications queue:

```bash
# From monorepo root
pnpm --filter @unevent/worker seed

# Or from apps/worker directory
cd apps/worker
pnpm seed
```

## Healthcheck

The worker exposes HTTP endpoints for health monitoring:

- `GET /health` - Always returns 200 if server is running
- `GET /ready` - Returns 200 if Redis is connected, 503 otherwise

Example:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/ready
```

## Docker

### Build

```bash
docker build -f apps/worker/Dockerfile -t unevent-worker .
```

### Run

```bash
docker run -p 3001:3001 \
  -e UPSTASH_REDIS_URL=rediss://... \
  -e SENTRY_DSN=... \
  unevent-worker
```

## Enqueueing Jobs from Payload

To enqueue a notification job from a Payload hook, use the BullMQ client:

```typescript
import { Queue } from 'bullmq'
import Redis from 'ioredis'

// In your Payload hook
const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
  tls: { rejectUnauthorized: true }
})

const notificationsQueue = new Queue('notifications', {
  connection: redis
})

await notificationsQueue.add('event.reminder.24h', {
  type: 'event.reminder.24h',
  payload: {
    eventId: '123',
    userId: '456',
    eventTitle: 'My Event',
    eventDate: '2024-01-01T10:00:00Z',
  },
})
```

## Migrating Payload Cronjobs

To migrate existing Payload cronjobs to the worker:

1. Add a new job type handler in `src/processors/maintenance.ts`
2. Register the scheduler in `src/schedulers/index.ts`
3. Remove the cronjob from Payload's `payload.config.ts`

Example scheduler registration:

```typescript
// In src/schedulers/index.ts
await maintenanceQueue.add(
  'feed-flush',
  { type: 'feed.flush' },
  {
    repeat: { every: 10 * 60 * 1000 }, // Every 10 minutes
    jobId: 'feed-flush-recurring',
  },
)
```

## Email Integration

The worker uses **Resend + React Email** for sending templated emails.

### Email Templates

- **Event Reminder** (`src/emails/EventReminderEmail.tsx`): Sent 24h before events
- **Admin Daily Digest** (`src/emails/AdminDailyDigestEmail.tsx`): Daily summary for admins

### Email Safety

- **Production**: Emails are sent to real recipients
- **Non-production**: If `RESEND_OVERRIDE_TO` is set, all emails are redirected to that address
- **No API key**: If `RESEND_API_KEY` is not set, emails are logged but not sent

### Adding New Email Types

1. Create a React Email template in `src/emails/`
2. Import and use `sendTemplatedEmail()` in the appropriate processor
3. Add the email type to the job payload interface

## Monitoring

- **Sentry**: Errors and performance metrics are automatically captured
- **Healthcheck**: Use `/health` and `/ready` endpoints for uptime monitoring
- **Logs**: All job processing is logged to stdout

## Troubleshooting

### Redis eviction policy warning

If you see: `IMPORTANT! Eviction policy is optimistic-volatile. It should be "noeviction"`

**This is critical for BullMQ.** Jobs can be lost if Redis evicts keys. Fix it:

**For Upstash:**
1. Go to your Upstash Redis dashboard
2. Navigate to your database settings
3. Change "Eviction Policy" from `allkeys-lru` (or similar) to `noeviction`
4. Restart the worker

**For local Redis:**
```bash
# In redis.conf or via CLI
CONFIG SET maxmemory-policy noeviction
```

### Sentry DSN warning

If you see: `Invalid Sentry Dsn: "https://..."` but also `[Sentry] Initialized`

This is usually a false positive. If Sentry says it's initialized, it's working. The warning can be ignored. If you want to verify, check your Sentry dashboard for events.

### Redis connection issues

- Verify `UPSTASH_REDIS_URL` is set correctly
- Check Redis credentials and network access
- Ensure TLS is enabled for Upstash (port 6380)

### Jobs not processing

- Check worker logs for errors
- Verify Redis connection with `/ready` endpoint
- Ensure queues are properly initialized
- **Important**: Ensure Redis eviction policy is set to `noeviction` (see above)

### Scheduler not running

- Check that schedulers are registered on startup (see logs)
- Verify Redis connection is stable
- Check job repeat configuration in `src/schedulers/index.ts`

### Email Debugging

**Emails not sending:**

- Verify `RESEND_API_KEY` is set correctly
- Check worker logs for email errors (they're logged with `[Email]` prefix)
- In non-production, check if `RESEND_OVERRIDE_TO` is intercepting emails
- Check Sentry for email-related errors (tagged with `component: "email"`)

**Testing emails in development:**

1. Set `RESEND_OVERRIDE_TO=your-test@email.com` in your `.env`
2. All emails will be sent to that address instead of real recipients
3. Check Resend dashboard for delivery status

**Viewing email content:**

- Email HTML is logged in development (check console output)
- Use React Email's preview feature: `npx react-email dev` (if you add a preview script)
- Check Resend dashboard for sent emails and their content

## Email Registry

The worker handles the following email templates (located in `src/emails/`):

### Admin Notifications
*   `AdminContactEmail`: Contact form submissions.
*   `AdminDailyDigestEmail`: Daily summary of platform activity.
*   `AdminListingPendingEmail`: Notification of new listings awaiting approval.
*   `AdminListingReportEmail`: Reports filed against listings.
*   `AdminProfileReportEmail`: Reports filed against user profiles.
*   `AdminReviewPendingEmail`: New reviews awaiting moderation.
*   `AdminUserNewEmail`: Notification of new user registrations.
*   `AdminClaimPendingEmail`: New listing claim requests.

### User Welcome
*   `UserWelcomeEmail`: General welcome email.
*   `UserWelcomeClientEmail`: Welcome for Client role.
*   `UserWelcomeHostEmail`: Welcome for Host role.
*   `UserWelcomeOrganizerEmail`: Welcome for Organizer role.
*   `UserWelcomeProviderEmail`: Welcome for Service Provider role.

### Content Moderation (Listings & Reviews)
*   `ListingApprovedEmail`: Your listing has been approved and is live.
*   `ListingRejectedEmail`: Your listing was rejected (includes reason).
*   `ListingClaimInvitationEmail`: Invitation to claim a listing.
*   `ClaimApprovedEmail`: Listing claim request approved.
*   `ClaimRejectedEmail`: Listing claim request rejected.
*   `ReviewNewEmail`: You received a new review.
*   `ReviewApprovedEmail`: Your review has been published.
*   `ReviewRejectedEmail`: Your review was rejected.

### Operational
*   `EventReminderEmail`: Reminder sent 24h before an event starts.


