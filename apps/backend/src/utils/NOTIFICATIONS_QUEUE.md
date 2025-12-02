# Email Notifications Queue

This utility allows Payload hooks and endpoints to enqueue email notification jobs that are processed by the worker service.

## Setup

1. **Install dependencies** (already added to `package.json`):
   ```bash
   pnpm install
   ```

2. **Set environment variable**:
   ```env
   UPSTASH_REDIS_URL=rediss://default:password@host:6380
   ```
   
   This should be the same Redis instance used by the worker service.

## Usage

### Basic Example

```typescript
import { enqueueNotification } from '@/utils/notificationsQueue'

// In a Payload hook
await enqueueNotification('user.welcome', {
  first_name: 'John',
  email: 'john@example.com',
  confirm_url: 'https://unevent.com/confirm?token=abc123',
})
```

### Available Email Types

All email types must be registered in the worker's `EMAIL_TEMPLATES` registry. Currently available:

**User-facing:**
- `user.welcome` - Welcome email with confirmation link
- `event.reminder.24h` - Event reminder 24h before
- `event.participation.reminder` - Reminder for event participants
- `event.participation.confirmed` - Confirmation of participation
- `listing.approved` - Listing was approved
- `listing.rejected` - Listing was rejected
- `review.new` - New review received
- ... (see worker's `EMAIL_TEMPLATES` for full list)

**Admin:**
- `admin.listing.pending` - New listing needs moderation
- `admin.review.pending` - New review needs moderation
- `admin.user.new` - New user registered
- ... (see worker's `EMAIL_TEMPLATES` for full list)

### Example: User Welcome Email

```typescript
import { enqueueNotification } from '@/utils/notificationsQueue'
import type { CollectionAfterChangeHook } from 'payload'

export const sendWelcomeEmail: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return

  const confirmToken = doc.confirmToken // Generate this during user creation
  const confirmUrl = `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/confirm-email?token=${confirmToken}`

  try {
    await enqueueNotification('user.welcome', {
      first_name: doc.displayName || doc.email.split('@')[0],
      email: doc.email,
      confirm_url: confirmUrl,
      support_email: 'support@unevent.com',
    })
  } catch (error) {
    req.payload.logger.error('Failed to enqueue welcome email:', error)
    // Don't throw - email failure shouldn't break user creation
  }
}
```

### Example: Event Reminder

```typescript
await enqueueNotification('event.reminder.24h', {
  first_name: user.firstName,
  userEmail: user.email,
  event_title: event.title,
  city: event.city,
  start_date: '2024-12-15', // YYYY-MM-DD
  start_time: '18:00', // HH:mm
  eventId: String(event.id),
  eventUrl: `https://unevent.com/events/${event.id}`,
})
```

### Example: Listing Approved

```typescript
export const notifyListingApproved: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
}) => {
  if (
    operation !== 'update' ||
    previousDoc?.moderationStatus === doc.moderationStatus ||
    doc.moderationStatus !== 'approved'
  ) {
    return
  }

  const ownerEmail = doc.owner?.email
  if (!ownerEmail) return

  await enqueueNotification('listing.approved', {
    first_name: doc.owner?.firstName || '',
    listing_title: doc.title,
    listing_id: String(doc.id),
    listing_url: `https://unevent.com/listings/${doc.id}`,
  })
}
```

### Example: Admin Notification

```typescript
export const notifyAdminNewListing: CollectionAfterChangeHook = async ({
  doc,
  operation,
}) => {
  if (operation !== 'create' || doc.moderationStatus !== 'pending') {
    return
  }

  await enqueueNotification('admin.listing.pending', {
    listing_title: doc.title,
    listing_id: String(doc.id),
    listing_type: doc.type,
    created_by: doc.createdBy?.email || 'unknown',
    dashboard_url: `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/admin/collections/listings/${doc.id}`,
  })
}
```

### Advanced Options

```typescript
await enqueueNotification(
  'user.welcome',
  { /* payload */ },
  {
    jobId: 'unique-job-id', // Optional: custom job ID
    delay: 5000, // Optional: delay in milliseconds
    priority: 10, // Optional: higher priority = processed first
  },
)
```

## Payload Shapes

Each email type expects a specific payload shape. Check the worker's `src/emails/registry.ts` for the exact interface for each type.

Common patterns:
- `first_name?: string` - User's first name
- `email: string` - Recipient email
- `*_url: string` - URLs for CTAs
- `dashboard_url: string` - Link to admin/user dashboard
- `*_id: string` - IDs of related entities

## Error Handling

The queue will retry failed jobs automatically (3 attempts with exponential backoff). However, you should still handle errors in your hooks:

```typescript
try {
  await enqueueNotification('user.welcome', payload)
} catch (error) {
  // Log but don't throw - email failure shouldn't break the main operation
  req.payload.logger.error('Failed to enqueue email:', error)
}
```

## Testing

In development, you can check the worker logs to see if jobs are being processed. You can also use the worker's seed script to test:

```bash
cd apps/worker
pnpm seed
```

## See Also

- Worker email registry: `apps/worker/src/emails/registry.ts`
- Example hooks: `apps/backend/src/utils/notificationsQueue.example.ts`
- Worker README: `apps/worker/README.md`

