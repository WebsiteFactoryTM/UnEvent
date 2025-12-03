import type { CollectionAfterChangeHook } from 'payload'
import * as Sentry from '@sentry/nextjs'
import { enqueueNotification } from '@/utils/notificationsQueue'
import { Profile, Review, User } from '@/payload-types'

/**
 * Notify admins when a review is created or updated to pending status
 */
export const notifyAdminNewReview: CollectionAfterChangeHook<Review> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // Only trigger on create or update
  if (operation !== 'create' && operation !== 'update') {
    return
  }

  const currentStatus = doc.status
  const previousStatus = previousDoc?.status

  // Only notify if status is pending
  if (currentStatus !== 'pending') {
    return
  }

  // For updates, only notify if status changed TO pending (was not pending before)
  if (operation === 'update' && previousStatus === 'pending') {
    return
  }

  try {
    // Get listing info - fetch listing to get title
    const listingId = doc.listing.value as number
    let listingTitle = 'Unknown Listing'
    const listingType = doc.listingType

    if (listingId && listingType) {
      try {
        const listing = await req.payload.findByID({
          collection: listingType,
          id: typeof listingId === 'number' ? listingId : Number(listingId),
        })
        listingTitle = listing?.title || 'Unknown Listing'
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        req.payload.logger.warn(
          `[notifyAdminNewReview] Could not fetch listing ${listingId}: ${errorMessage}`,
        )
        // Don't report to Sentry for non-critical listing fetch (we have fallback)
      }
    }

    // Get reviewer info - profile should already be populated (maxDepth: 1)
    const reviewerProfile = doc.user as Profile | number | null
    let reviewerName: string

    if (!reviewerProfile) {
      req.payload.logger.warn(
        `[notifyAdminNewReview] No reviewer found for review ${doc.id} - skipping admin notification`,
      )
      reviewerName = 'Unknown Reviewer'
    } else if (typeof reviewerProfile === 'number') {
      // Profile is just an ID, need to fetch it
      try {
        const profile = await req.payload.findByID({
          collection: 'profiles',
          id: reviewerProfile,
        })
        reviewerName = profile?.displayName || profile?.name || `Profile ID: ${reviewerProfile}`
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        req.payload.logger.error(
          `[notifyAdminNewReview] Failed to fetch profile ${reviewerProfile} (review ${doc.id}):`,
          errorMessage,
        )
        if (err instanceof Error) {
          Sentry.withScope((scope) => {
            scope.setTag('hook', 'notifyAdminNewReview')
            scope.setTag('operation', 'fetch_profile')
            scope.setTag('review_id', String(doc.id))
            scope.setTag('reviewer_id', String(reviewerProfile))
            scope.setContext('review', {
              id: doc.id,
              rating: doc.rating,
              reviewerId: reviewerProfile,
              listingId: listingId ? String(listingId) : 'unknown',
              listingType: listingType || 'unknown',
            })
            Sentry.captureException(err)
          })
        }
        reviewerName = `Profile ID: ${reviewerProfile}`
      }
    } else {
      // Profile is already populated, use it directly
      const user = reviewerProfile.user as User | number | null
      if (user && typeof user !== 'number' && user?.email) {
        reviewerName = user.email
      } else if (user && typeof user !== 'number' && user?.displayName) {
        reviewerName = user.displayName
      } else {
        reviewerName =
          reviewerProfile.displayName || reviewerProfile.name || `Profile ID: ${reviewerProfile.id}`
      }
    }

    const reviewerId = typeof doc.user === 'number' ? doc.user : doc.user?.id
    // Validate we have a meaningful reviewer name
    if (!reviewerName || reviewerName === 'Unknown') {
      reviewerName = reviewerId ? `Reviewer ID: ${reviewerId}` : 'Unknown Reviewer'
    }

    // Build admin dashboard URL
    const adminUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:4000'
    const dashboardUrl = `${adminUrl}/admin/collections/reviews/${doc.id}`

    const result = await enqueueNotification('admin.review.pending', {
      listing_title: listingTitle,
      listing_type: listingType || 'unknown',
      reviewer_name: reviewerName,
      rating: doc.rating,
      review_id: String(doc.id),
      dashboard_url: dashboardUrl,
    })

    if (result.id) {
      req.payload.logger.info(
        `[notifyAdminNewReview] ✅ Enqueued admin.review.pending for review ${doc.id} (reviewer: ${reviewerName || reviewerId || 'Unknown'}, job: ${result.id})`,
      )
    } else {
      req.payload.logger.warn(
        `[notifyAdminNewReview] ⚠️ Skipped admin.review.pending for review ${doc.id} - Redis unavailable`,
      )
    }
  } catch (error) {
    // Don't throw - email failure shouldn't break review creation/update
    const errorMessage = error instanceof Error ? error.message : String(error)
    req.payload.logger.error(
      `[notifyAdminNewReview] ❌ Failed to enqueue notification for review ${doc.id} (status: ${previousStatus || 'new'} → ${currentStatus}):`,
      errorMessage,
    )
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('hook', 'notifyAdminNewReview')
        scope.setTag('operation', 'enqueue_notification')
        scope.setTag('review_id', String(doc.id))
        scope.setTag('status', currentStatus)
        scope.setContext('review', {
          id: doc.id,
          rating: doc.rating,
          reviewerId:
            typeof doc.user === 'number'
              ? doc.user
              : typeof doc.user === 'object'
                ? doc.user?.id || 'unknown'
                : 'unknown',
          listingId:
            typeof doc.listing.value === 'number'
              ? doc.listing.value
              : doc.listing?.value?.id || 'unknown',
          listingType: doc.listingType || 'unknown',
          status: currentStatus,
          previousStatus: previousStatus || 'new',
          operation,
        })
        Sentry.captureException(error)
      })
    }
  }
}
