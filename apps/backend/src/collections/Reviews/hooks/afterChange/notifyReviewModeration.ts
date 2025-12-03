import type { CollectionAfterChangeHook } from 'payload'
import * as Sentry from '@sentry/nextjs'
import { enqueueNotification } from '@/utils/notificationsQueue'
import { collectionToPageSlug } from '@/utils/collectionToPageSlug'
import { Profile, Review, User } from '@/payload-types'

/**
 * Notify reviewer when their review status changes (approved/rejected)
 */
export const notifyReviewModeration: CollectionAfterChangeHook<Review> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // Only trigger on update when status changes
  if (operation !== 'update') {
    return
  }

  // Check if status changed
  const previousStatus = previousDoc?.status
  const currentStatus = doc.status

  if (previousStatus === currentStatus) {
    return
  }

  // Only notify on approved or rejected
  if (currentStatus !== 'approved' && currentStatus !== 'rejected') {
    return
  }

  try {
    // Get reviewer info - profile should already be populated (maxDepth: 1)
    const reviewerProfile = doc.user as Profile | number | null
    const reviewerId = typeof doc.user === 'number' ? doc.user : doc.user?.id

    if (!reviewerId) {
      req.payload.logger.warn(`[notifyReviewModeration] No reviewer found for review ${doc.id}`)
      return
    }

    let email: string
    let firstName: string
    let profile: Profile | null = null

    if (typeof reviewerProfile === 'number') {
      // Profile is just an ID, need to fetch it and user
      try {
        profile = await req.payload.findByID({
          collection: 'profiles',
          id: reviewerProfile,
        })

        if (!profile) {
          req.payload.logger.warn(
            `[notifyReviewModeration] No profile found for reviewer ${reviewerId} (review ${doc.id})`,
          )
          return
        }

        // Get user from profile
        const userRef = profile.user as User | number | null
        let user: User | null = null

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
          req.payload.logger.warn(
            `[notifyReviewModeration] No email found for reviewer ${reviewerId} (review ${doc.id})`,
          )
          return
        }

        email = user.email
        firstName = profile.displayName || profile.name || user.displayName || email.split('@')[0]
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        req.payload.logger.error(
          `[notifyReviewModeration] Failed to fetch profile/user for reviewer ${reviewerId} (review ${doc.id}):`,
          errorMessage,
        )
        if (err instanceof Error) {
          Sentry.withScope((scope) => {
            scope.setTag('hook', 'notifyReviewModeration')
            scope.setTag('operation', 'fetch_profile_user')
            scope.setTag('review_id', String(doc.id))
            scope.setTag('reviewer_id', String(reviewerId))
            scope.setContext('review', {
              id: doc.id,
              rating: doc.rating,
              reviewerId,
              status: currentStatus,
              previousStatus,
            })
            Sentry.captureException(err)
          })
        }
        return
      }
    } else {
      // Profile is already populated
      profile = reviewerProfile

      if (!profile) {
        req.payload.logger.warn(
          `[notifyReviewModeration] Profile is null for reviewer ${reviewerId} (review ${doc.id})`,
        )
        return
      }

      const user = profile.user as User | number | null

      if (!user || typeof user === 'number' || !user?.email) {
        req.payload.logger.warn(
          `[notifyReviewModeration] No email found for reviewer ${reviewerId} (review ${doc.id})`,
        )
        return
      }

      email = user.email
      firstName = profile.displayName || profile.name || user.displayName || email.split('@')[0]
    }

    // Validate email
    if (!email || !email.includes('@')) {
      const error = new Error(`Invalid email for reviewer ${reviewerId}: ${email}`)
      req.payload.logger.error(
        `[notifyReviewModeration] Invalid email for reviewer ${reviewerId} (review ${doc.id}): ${email}`,
      )
      Sentry.withScope((scope) => {
        scope.setTag('hook', 'notifyReviewModeration')
        scope.setTag('operation', 'validate_email')
        scope.setTag('review_id', String(doc.id))
        scope.setTag('reviewer_id', String(reviewerId))
        scope.setContext('review', {
          id: doc.id,
          reviewerId,
          invalidEmail: email,
          status: currentStatus,
          previousStatus,
        })
        Sentry.captureException(error)
      })
      return
    }

    // Get listing info
    const listingId = doc.listing.value as number
    const listingType = doc.listingType
    let listingTitle = 'Unknown Listing'
    let listingSlug: string | null | undefined

    if (listingId && listingType) {
      try {
        const listing = await req.payload.findByID({
          collection: listingType,
          id: typeof listingId === 'number' ? listingId : Number(listingId),
        })
        listingTitle = listing?.title || 'Unknown Listing'
        listingSlug = listing?.slug
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        req.payload.logger.warn(
          `[notifyReviewModeration] Could not fetch listing ${listingId}: ${errorMessage}`,
        )
        // Don't report to Sentry for non-critical listing fetch (we have fallback)
      }
    }

    // Build listing URL
    const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
    const listingTypeSlug = collectionToPageSlug(listingType) || listingType
    const listingUrl = `${frontendUrl}/${listingTypeSlug}/${listingSlug || listingId}`

    if (currentStatus === 'approved') {
      const result = await enqueueNotification('review.approved', {
        first_name: firstName,
        userEmail: email,
        listing_title: listingTitle,
        listing_type: listingTypeSlug || 'unknown',
        listing_url: listingUrl,
      })

      if (result.id) {
        req.payload.logger.info(
          `[notifyReviewModeration] ✅ Enqueued review.approved for review ${doc.id} (reviewer: ${reviewerId}, job: ${result.id})`,
        )
      } else {
        req.payload.logger.warn(
          `[notifyReviewModeration] ⚠️ Skipped review.approved for review ${doc.id} - Redis unavailable`,
        )
      }
    } else if (currentStatus === 'rejected') {
      const result = await enqueueNotification('review.rejected', {
        first_name: firstName,
        userEmail: email,
        listing_title: listingTitle,
        listing_type: listingTypeSlug || 'unknown',
        reason: doc.rejectionReason || undefined,
        support_email: process.env.SUPPORT_EMAIL || 'contact@unevent.ro',
      })

      if (result.id) {
        req.payload.logger.info(
          `[notifyReviewModeration] ✅ Enqueued review.rejected for review ${doc.id} (reviewer: ${reviewerId}, job: ${result.id})`,
        )
      } else {
        req.payload.logger.warn(
          `[notifyReviewModeration] ⚠️ Skipped review.rejected for review ${doc.id} - Redis unavailable`,
        )
      }
    }
  } catch (error) {
    // Don't throw - email failure shouldn't break review update
    const errorMessage = error instanceof Error ? error.message : String(error)
    req.payload.logger.error(
      `[notifyReviewModeration] ❌ Failed to enqueue notification for review ${doc.id} (status: ${previousStatus} → ${currentStatus}):`,
      errorMessage,
    )
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('hook', 'notifyReviewModeration')
        scope.setTag('operation', 'enqueue_notification')
        scope.setTag('review_id', String(doc.id))
        scope.setTag('status', currentStatus)
        scope.setContext('review', {
          id: doc.id,
          rating: doc.rating,
          reviewerId: typeof doc.user === 'number' ? doc.user : doc.user?.id || 'unknown',
          listingId:
            typeof doc.listing.value === 'number'
              ? doc.listing.value
              : doc.listing?.value?.id || 'unknown',
          listingType: doc.listingType || 'unknown',
          status: currentStatus,
          previousStatus,
          operation,
        })
        Sentry.captureException(error)
      })
    }
  }
}
