import type { CollectionAfterChangeHook } from 'payload'
import { enqueueNotification } from '@/utils/notificationsQueue'

/**
 * Notify admins when a new review is created with pending status
 */
export const notifyAdminNewReview: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  // Only trigger on create
  if (operation !== 'create') {
    return
  }

  // Only notify if status is pending
  if (doc.status !== 'pending') {
    return
  }

  try {
    // Get listing info
    const listingId =
      typeof doc.listing === 'number' ? doc.listing : doc.listing?.id || doc.listing
    const listingType = doc.listingType // 'locations', 'events', or 'services'

    let listingTitle = 'Unknown Listing'

    if (listingId && listingType) {
      try {
        const listing = await req.payload.findByID({
          collection: listingType,
          id: typeof listingId === 'number' ? listingId : Number(listingId),
        })
        listingTitle = listing?.title || 'Unknown Listing'
      } catch (err) {
        req.payload.logger.warn(
          `[notifyAdminNewReview] Could not fetch listing ${listingId}: ${err}`,
        )
      }
    }

    // Get reviewer info
    const reviewerId =
      typeof doc.user === 'number' ? doc.user : doc.user?.id || doc.user

    let reviewerName = 'Unknown'

    if (reviewerId) {
      try {
        const reviewerProfile = await req.payload.findByID({
          collection: 'profiles',
          id: reviewerId,
        })
        reviewerName = reviewerProfile?.name || 'Unknown'
      } catch (err) {
        req.payload.logger.warn(
          `[notifyAdminNewReview] Could not fetch reviewer info: ${err}`,
        )
      }
    }

    // Build admin dashboard URL
    const adminUrl =
      process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:4000'
    const dashboardUrl = `${adminUrl}/admin/collections/reviews/${doc.id}`

    await enqueueNotification('admin.review.pending', {
      listing_title: listingTitle,
      listing_type: listingType || 'unknown',
      reviewer_name: reviewerName,
      rating: doc.rating,
      review_id: String(doc.id),
      dashboard_url: dashboardUrl,
    })

    req.payload.logger.info(
      `[notifyAdminNewReview] ✅ Enqueued admin.review.pending for review ${doc.id}`,
    )
  } catch (error) {
    // Don't throw - email failure shouldn't break review creation
    req.payload.logger.error(
      `[notifyAdminNewReview] ❌ Failed to enqueue notification for review ${doc.id}:`,
      error,
    )
  }
}

