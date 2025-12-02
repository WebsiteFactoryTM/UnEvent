import type { CollectionAfterChangeHook } from 'payload'
import { enqueueNotification } from '@/utils/notificationsQueue'

/**
 * Notify reviewer when their review status changes (approved/rejected)
 */
export const notifyReviewModeration: CollectionAfterChangeHook = async ({
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
    // Get reviewer profile ID
    const reviewerId = typeof doc.user === 'number' ? doc.user : doc.user?.id || doc.user

    if (!reviewerId) {
      req.payload.logger.warn(`[notifyReviewModeration] No reviewer found for review ${doc.id}`)
      return
    }

    // Query user directly by profile ID
    const users = await req.payload.find({
      collection: 'users',
      where: {
        profile: {
          equals: reviewerId,
        },
      },
      limit: 1,
    })

    if (users.docs.length === 0) {
      req.payload.logger.warn(`[notifyReviewModeration] No user found for profile ${reviewerId}`)
      return
    }

    const user = users.docs[0]

    if (!user?.email) {
      req.payload.logger.warn(`[notifyReviewModeration] No email found for user ${user.id}`)
      return
    }

    // Get reviewer's display name (try profile name, then user displayName, then email)
    let firstName = user.displayName || user.email.split('@')[0]

    try {
      const profile = await req.payload.findByID({
        collection: 'profiles',
        id: reviewerId,
      })
      firstName = profile?.name || profile?.displayName || firstName
    } catch (err) {
      // Profile fetch failed, use user data we already have
      req.payload.logger.debug(
        `[notifyReviewModeration] Could not fetch profile for display name: ${err}`,
      )
    }

    // Get listing info
    const listingId = typeof doc.listing === 'number' ? doc.listing : doc.listing?.id || doc.listing

    if (!listingId) {
      req.payload.logger.warn(`[notifyReviewModeration] No listing found for review ${doc.id}`)
      return
    }

    // Fetch listing to get title and type
    const listingType = doc.listingType // 'locations', 'events', or 'services'
    let listingTitle = 'Unknown Listing'

    try {
      const listing = await req.payload.findByID({
        collection: listingType,
        id: typeof listingId === 'number' ? listingId : Number(listingId),
      })
      listingTitle = listing?.title || 'Unknown Listing'
    } catch (err) {
      req.payload.logger.warn(
        `[notifyReviewModeration] Could not fetch listing ${listingId}: ${err}`,
      )
    }

    // Build listing URL
    const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
    const listingUrl = `${frontendUrl}/${listingType}/${listingId}`

    if (currentStatus === 'approved') {
      await enqueueNotification('review.approved', {
        first_name: firstName,
        userEmail: user.email,
        listing_title: listingTitle,
        listing_type: listingType,
        listing_url: listingUrl,
      })

      req.payload.logger.info(
        `[notifyReviewModeration] ✅ Enqueued review.approved for review ${doc.id}`,
      )
    } else if (currentStatus === 'rejected') {
      await enqueueNotification('review.rejected', {
        first_name: firstName,
        userEmail: user.email,
        listing_title: listingTitle,
        listing_type: listingType,
        reason: doc.rejectionReason || undefined,
        support_email: process.env.SUPPORT_EMAIL || 'support@unevent.com',
      })

      req.payload.logger.info(
        `[notifyReviewModeration] ✅ Enqueued review.rejected for review ${doc.id}`,
      )
    }
  } catch (error) {
    // Don't throw - email failure shouldn't break review update
    req.payload.logger.error(
      `[notifyReviewModeration] ❌ Failed to enqueue notification for review ${doc.id}:`,
      error,
    )
  }
}
