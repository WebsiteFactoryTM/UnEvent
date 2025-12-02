/**
 * Example: How to enqueue email notifications from Payload hooks
 *
 * This file shows examples - you can delete it once you've integrated
 * the notificationsQueue into your actual hooks.
 */

import { enqueueNotification, type EmailEventType } from './notificationsQueue.js'
import type { CollectionAfterChangeHook } from 'payload'

/**
 * Example 1: Send welcome email when a user is created
 */
export const sendWelcomeEmailExample: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  // Only send on create
  if (operation !== 'create') {
    return
  }

  // Assuming you have a way to generate the confirmation URL
  const confirmToken = doc.confirmToken || 'generate-token-here'
  const confirmUrl = `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/confirm-email?token=${confirmToken}`

  try {
    await enqueueNotification('user.welcome', {
      first_name: doc.firstName || doc.name || '',
      email: doc.email,
      confirm_url: confirmUrl,
      support_email: process.env.SUPPORT_EMAIL || 'support@unevent.com',
    })

    req.payload.logger.info(`[Welcome Email] Enqueued for user ${doc.id}`)
  } catch (error) {
    req.payload.logger.error(`[Welcome Email] Failed to enqueue:`, error)
    // Don't throw - email failure shouldn't break user creation
  }
}

/**
 * Example 2: Send event reminder 24h before event
 * This would typically be scheduled, but you can also trigger it from a hook
 */
export const scheduleEventReminderExample = async (eventDoc: {
  id: string
  title: string
  startDate: string
  startTime: string
  city?: string
  participants?: Array<{ user: { email: string; firstName?: string } }>
}) => {
  if (!eventDoc.participants || eventDoc.participants.length === 0) {
    return
  }

  // Enqueue reminder for each participant
  for (const participant of eventDoc.participants) {
    const user = participant.user
    if (!user?.email) continue

    try {
      await enqueueNotification(
        'event.reminder.24h',
        {
          first_name: user.firstName || '',
          userEmail: user.email,
          event_title: eventDoc.title,
          city: eventDoc.city || '',
          start_date: eventDoc.startDate, // YYYY-MM-DD
          start_time: eventDoc.startTime, // HH:mm
          eventId: String(eventDoc.id),
          eventUrl: `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/events/${eventDoc.id}`,
        },
        {
          // Optional: delay the job by 24 hours before the event
          // delay: calculateDelayUntil24hBefore(eventDoc.startDate, eventDoc.startTime),
        },
      )
    } catch (error) {
      console.error(`[Event Reminder] Failed to enqueue for ${user.email}:`, error)
    }
  }
}

/**
 * Example 3: Notify admin when a new listing needs moderation
 */
export const notifyAdminNewListingExample: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  // Only on create, and only if it needs moderation
  if (operation !== 'create' || doc.moderationStatus !== 'pending') {
    return
  }

  try {
    await enqueueNotification('admin.listing.pending', {
      listing_title: doc.title || doc.name || 'Untitled',
      listing_id: String(doc.id),
      listing_type: doc.type || 'unknown',
      created_by: doc.createdBy
        ? typeof doc.createdBy === 'object'
          ? doc.createdBy.email || doc.createdBy.id
          : String(doc.createdBy)
        : 'unknown',
      dashboard_url: `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/admin/collections/listings/${doc.id}`,
    })

    req.payload.logger.info(`[Admin Notification] Enqueued for listing ${doc.id}`)
  } catch (error) {
    req.payload.logger.error(`[Admin Notification] Failed to enqueue:`, error)
  }
}

/**
 * Example 4: Notify user when their listing is approved
 */
export const notifyListingApprovedExample: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // Only on update, and only if status changed to approved
  if (
    operation !== 'update' ||
    previousDoc?.moderationStatus === doc.moderationStatus ||
    doc.moderationStatus !== 'approved'
  ) {
    return
  }

  // Get user email from the listing's owner
  const ownerEmail = doc.owner?.email || doc.createdBy?.email
  if (!ownerEmail) {
    return
  }

  try {
    await enqueueNotification('listing.approved', {
      first_name: doc.owner?.firstName || doc.createdBy?.firstName || '',
      listing_title: doc.title || doc.name || 'Your listing',
      listing_id: String(doc.id),
      listing_url: `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/listings/${doc.id}`,
    })

    req.payload.logger.info(`[Listing Approved] Enqueued notification for ${ownerEmail}`)
  } catch (error) {
    req.payload.logger.error(`[Listing Approved] Failed to enqueue:`, error)
  }
}
