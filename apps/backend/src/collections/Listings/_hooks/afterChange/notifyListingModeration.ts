import type { CollectionAfterChangeHook } from 'payload'
import * as Sentry from '@sentry/nextjs'
import { enqueueNotification } from '@/utils/notificationsQueue'
import { Profile, User } from '@/payload-types'
import { collectionToAccountPageSlug, collectionToPageSlug } from '@/utils/collectionToPageSlug'

/**
 * Notify listing owner when moderation status changes (approved/rejected)
 */
export const notifyListingModeration: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
  collection,
}) => {
  // Only trigger on update when moderationStatus changes
  if (operation !== 'update') {
    return
  }

  // Check if moderationStatus changed
  const previousStatus = previousDoc?.moderationStatus
  const currentStatus = doc.moderationStatus

  if (previousStatus === currentStatus) {
    return
  }

  if (currentStatus === 'pending') {
    return
  }

  // Only notify on approved or rejected
  if (currentStatus !== 'approved' && currentStatus !== 'rejected') {
    return
  }

  try {
    // Get owner profile ID
    const ownerId = typeof doc.owner === 'number' ? doc.owner : doc.owner?.id || doc.owner

    if (!ownerId) {
      req.payload.logger.warn(`[notifyListingModeration] No owner found for listing ${doc.id}`)
      return
    }

    let profile: Profile
    let user: User | null
    let email: string
    let firstName: string
    try {
      profile = await req.payload.findByID({
        collection: 'profiles',
        id: ownerId,
      })
      if (!profile) {
        req.payload.logger.warn(`[notifyListingModeration] No user found for profile ${ownerId}`)
        return
      }

      const userRef = profile.user as User | number | null

      if (typeof userRef === 'number') {
        const userDoc = await req.payload.findByID({
          collection: 'users',
          id: userRef,
        })
        user = userDoc as User | null
      } else {
        user = userRef
      }

      if (!user?.email) {
        req.payload.logger.warn(`[notifyListingModeration] No email found for user ${user?.id}`)
        return
      }
      email = user.email
      firstName = profile.displayName || profile.name || email?.split('@')[0]
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      req.payload.logger.error(
        `[notifyListingModeration] Failed to fetch profile/user data for owner ${ownerId} (listing ${doc.id}):`,
        errorMessage,
      )
      if (err instanceof Error) {
        Sentry.withScope((scope) => {
          scope.setTag('hook', 'notifyListingModeration')
          scope.setTag('operation', 'fetch_profile_user')
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
      return
    }

    // Validate email before proceeding
    if (!email || !email.includes('@')) {
      const error = new Error(`Invalid email for listing ${doc.id}: ${email}`)
      req.payload.logger.error(
        `[notifyListingModeration] Invalid email for listing ${doc.id}: ${email}`,
      )
      Sentry.withScope((scope) => {
        scope.setTag('hook', 'notifyListingModeration')
        scope.setTag('operation', 'validate_email')
        scope.setTag('listing_id', String(doc.id))
        scope.setTag('listing_type', collection.slug)
        scope.setTag('owner_id', String(ownerId))
        scope.setContext('listing', {
          id: doc.id,
          title: doc.title,
          ownerId,
          status: currentStatus,
          previousStatus,
          invalidEmail: email,
        })
        Sentry.captureException(error)
      })
      return
    }
    // Build listing URL
    const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
    const listingType = collectionToPageSlug(collection.slug) as
      | 'evenimente'
      | 'locatii'
      | 'servicii'
    const listingUrl = `${frontendUrl}/${listingType}/${doc.slug}`

    if (currentStatus === 'approved') {
      const result = await enqueueNotification('listing.approved', {
        first_name: firstName,
        userEmail: email,
        listing_title: doc.title,
        listing_type: listingType,
        listing_id: String(doc.id),
        listing_url: listingUrl,
      })

      if (result.id) {
        req.payload.logger.info(
          `[notifyListingModeration] ✅ Enqueued listing.approved for listing ${doc.id} (job: ${result.id})`,
        )
      } else {
        req.payload.logger.warn(
          `[notifyListingModeration] ⚠️ Skipped listing.approved for listing ${doc.id} - Redis unavailable`,
        )
      }
    } else if (currentStatus === 'rejected') {
      const accountListingType = collectionToAccountPageSlug(collection.slug) as
        | 'evenimentele-mele'
        | 'locatiile-mele'
        | 'serviciile-mele'
      const accountListingUrl = `${frontendUrl}/cont/${accountListingType}/${doc.id}/editeaza`
      const result = await enqueueNotification('listing.rejected', {
        first_name: firstName,
        userEmail: email,
        listing_title: doc.title,
        listing_type: listingType,
        listing_url: accountListingUrl,
        listing_id: String(doc.id),
        reason: doc.rejectionReason || undefined,
        support_email: process.env.SUPPORT_EMAIL || 'contact@unevent.ro',
      })

      if (result.id) {
        req.payload.logger.info(
          `[notifyListingModeration] ✅ Enqueued listing.rejected for listing ${doc.id} (job: ${result.id})`,
        )
      } else {
        req.payload.logger.warn(
          `[notifyListingModeration] ⚠️ Skipped listing.rejected for listing ${doc.id} - Redis unavailable`,
        )
      }
    }
  } catch (error) {
    // Don't throw - email failure shouldn't break listing update
    const errorMessage = error instanceof Error ? error.message : String(error)
    req.payload.logger.error(
      `[notifyListingModeration] ❌ Failed to enqueue notification for listing ${doc.id}:`,
      errorMessage,
    )
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('hook', 'notifyListingModeration')
        scope.setTag('operation', 'enqueue_notification')
        scope.setTag('listing_id', String(doc.id))
        scope.setTag('listing_type', collection.slug)
        scope.setTag('status', currentStatus)
        scope.setContext('listing', {
          id: doc.id,
          title: doc.title,
          ownerId: typeof doc.owner === 'number' ? doc.owner : doc.owner?.id || 'unknown',
          status: currentStatus,
          previousStatus,
        })
        Sentry.captureException(error)
      })
    }
  }
}
