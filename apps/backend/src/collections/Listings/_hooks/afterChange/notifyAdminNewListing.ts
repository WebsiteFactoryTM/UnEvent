import type { CollectionAfterChangeHook } from 'payload'
import * as Sentry from '@sentry/nextjs'
import { enqueueNotification } from '@/utils/notificationsQueue'
import { User } from '@/payload-types'

/**
 * Notify admins when a listing is created or updated to pending status
 */
export const notifyAdminNewListing: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
  collection,
}) => {
  // Only trigger on create or update
  if (operation !== 'create' && operation !== 'update') {
    return
  }

  const currentStatus = doc.moderationStatus
  const previousStatus = previousDoc?.moderationStatus

  // Only notify if status is pending
  if (currentStatus !== 'pending') {
    return
  }

  // For updates, only notify if status changed TO pending (was not pending before)
  if (operation === 'update' && previousStatus === 'pending') {
    return
  }

  try {
    // Get owner profile ID
    const ownerId = typeof doc.owner === 'number' ? doc.owner : doc.owner?.id || doc.owner

    if (!ownerId) {
      req.payload.logger.warn(
        `[notifyAdminNewListing] No owner found for listing ${doc.id} - skipping admin notification`,
      )
      return
    }

    // Fetch creator info (user email/name or profile name)
    let createdBy: string

    try {
      // First, try to get the profile to access user relationship
          const profile = await req.payload.findByID({
            collection: 'profiles',
            id: ownerId,
          })

      if (!profile) {
        req.payload.logger.warn(
          `[notifyAdminNewListing] No profile found for owner ${ownerId} (listing ${doc.id})`,
        )
        // Continue with fallback name
        createdBy = `Profile ID: ${ownerId}`
      } else {
        // Try to get user email/displayName from profile's user relationship
        let user: User | null = null
        const userRef = profile.user as User | number | null

        if (typeof userRef === 'number') {
          try {
            const userDoc = await req.payload.findByID({
              collection: 'users',
              id: userRef,
            })
            user = userDoc as User | null
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err)
            req.payload.logger.debug(
              `[notifyAdminNewListing] Could not fetch user ${userRef} for profile ${ownerId}:`,
              errorMessage,
            )
            // Don't report to Sentry for debug-level issues (non-critical fallback)
          }
        } else {
          user = userRef
        }

        // Prefer user email/displayName, fallback to profile name
        if (user?.email) {
          createdBy = user.email
        } else if (user?.displayName) {
          createdBy = user.displayName
        } else {
          createdBy = profile.displayName || profile.name || `Profile ID: ${ownerId}`
        }
        }
      } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      req.payload.logger.error(
        `[notifyAdminNewListing] Failed to fetch creator info for owner ${ownerId} (listing ${doc.id}):`,
        errorMessage,
      )
      if (err instanceof Error) {
        Sentry.withScope((scope) => {
          scope.setTag('hook', 'notifyAdminNewListing')
          scope.setTag('operation', 'fetch_creator_info')
          scope.setTag('listing_id', String(doc.id))
          scope.setTag('listing_type', collection.slug)
          scope.setTag('owner_id', String(ownerId))
          scope.setContext('listing', {
            id: doc.id,
            title: doc.title,
            ownerId,
            status: currentStatus,
            previousStatus,
          })
          Sentry.captureException(err)
        })
      }
      // Use fallback instead of returning - admin should still be notified
      createdBy = `Owner ID: ${ownerId}`
    }

    // Validate we have a meaningful creator name
    if (!createdBy || createdBy === 'Unknown') {
      createdBy = `Owner ID: ${ownerId}`
    }

    // Build admin dashboard URL
    const adminUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:4000'
    const dashboardUrl = `${adminUrl}/admin/collections/${collection.slug}/${doc.id}`

    const result = await enqueueNotification('admin.listing.pending', {
      listing_title: doc.title,
      listing_type: collection.slug, // 'events', 'locations', or 'services'
      listing_id: String(doc.id),
      created_by: createdBy,
      dashboard_url: dashboardUrl,
    })

    if (result.id) {
      req.payload.logger.info(
        `[notifyAdminNewListing] ✅ Enqueued admin.listing.pending for listing ${doc.id} (owner: ${ownerId}, job: ${result.id})`,
      )
    } else {
      req.payload.logger.warn(
        `[notifyAdminNewListing] ⚠️ Skipped admin.listing.pending for listing ${doc.id} - Redis unavailable`,
      )
    }
  } catch (error) {
    // Don't throw - email failure shouldn't break listing creation/update
    const errorMessage = error instanceof Error ? error.message : String(error)
    req.payload.logger.error(
      `[notifyAdminNewListing] ❌ Failed to enqueue notification for listing ${doc.id} (status: ${previousStatus || 'new'} → ${currentStatus}):`,
      errorMessage,
    )
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('hook', 'notifyAdminNewListing')
        scope.setTag('operation', 'enqueue_notification')
        scope.setTag('listing_id', String(doc.id))
        scope.setTag('listing_type', collection.slug)
        scope.setTag('status', currentStatus)
        scope.setContext('listing', {
          id: doc.id,
          title: doc.title,
          ownerId: typeof doc.owner === 'number' ? doc.owner : doc.owner?.id || 'unknown',
          status: currentStatus,
          previousStatus: previousStatus || 'new',
          operation,
        })
        Sentry.captureException(error)
      })
    }
  }
}
