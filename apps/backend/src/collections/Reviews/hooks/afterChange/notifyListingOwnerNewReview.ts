import type { CollectionAfterChangeHook } from 'payload'
import { enqueueNotification } from '@/utils/notificationsQueue'

/**
 * Notify listing owner when a new review is created and approved
 */
export const notifyListingOwnerNewReview: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  // Only trigger on create
  if (operation !== 'create') {
    return
  }

  // Only notify if review is approved (or auto-approved on create)
  if (doc.status !== 'approved') {
    return
  }

  try {
    // Get listing info
    const listingId = typeof doc.listing === 'number' ? doc.listing : doc.listing?.id || doc.listing
    const listingType = doc.listingType // 'locations', 'events', or 'services'

    if (!listingId || !listingType) {
      req.payload.logger.warn(`[notifyListingOwnerNewReview] No listing found for review ${doc.id}`)
      return
    }

    // Fetch listing to get owner and title
    const listing = await req.payload.findByID({
      collection: listingType,
      id: typeof listingId === 'number' ? listingId : Number(listingId),
      depth: 1, // Get owner relationship
    })

    if (!listing || !listing.owner) {
      req.payload.logger.warn(
        `[notifyListingOwnerNewReview] No owner found for listing ${listingId}`,
      )
      return
    }

    // Get owner profile ID
    const ownerId =
      typeof listing.owner === 'number' ? listing.owner : listing.owner?.id || listing.owner

    // Query user directly by profile ID
    const users = await req.payload.find({
      collection: 'users',
      where: {
        profile: {
          equals: ownerId,
        },
      },
      limit: 1,
    })

    if (users.docs.length === 0) {
      req.payload.logger.warn(`[notifyListingOwnerNewReview] No user found for profile ${ownerId}`)
      return
    }

    const user = users.docs[0]

    if (!user?.email) {
      req.payload.logger.warn(`[notifyListingOwnerNewReview] No email found for user ${user.id}`)
      return
    }

    // Get owner's display name (try profile name, then user displayName, then email)
    let firstName = user.displayName || user.email.split('@')[0]

    try {
      const profile = await req.payload.findByID({
        collection: 'profiles',
        id: ownerId,
      })
      firstName = profile?.name || profile?.displayName || firstName
    } catch (err) {
      // Profile fetch failed, use user data we already have
      req.payload.logger.debug(
        `[notifyListingOwnerNewReview] Could not fetch profile for display name: ${err}`,
      )
    }

    // Get reviewer info
    const reviewerId = typeof doc.user === 'number' ? doc.user : doc.user?.id || doc.user

    let reviewerName = 'Un utilizator'

    if (reviewerId) {
      try {
        const reviewerProfile = await req.payload.findByID({
          collection: 'profiles',
          id: reviewerId,
        })
        reviewerName = reviewerProfile?.name || 'Un utilizator'
      } catch (err) {
        req.payload.logger.warn(
          `[notifyListingOwnerNewReview] Could not fetch reviewer info: ${err}`,
        )
      }
    }

    // Build listing URL
    const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
    const listingUrl = `${frontendUrl}/${listingType}/${listing.slug || listing.id}`

    // Get comment snippet (first 100 chars)
    const commentSnippet = doc.comment
      ? doc.comment.length > 100
        ? doc.comment.substring(0, 100) + '...'
        : doc.comment
      : undefined

    const result = await enqueueNotification('review.new', {
      first_name: firstName,
      userEmail: user.email,
      listing_title: listing.title,
      listing_type: listingType,
      reviewer_name: reviewerName,
      rating: doc.rating,
      comment_snippet: commentSnippet,
      listing_url: listingUrl,
    })

    if (result.id) {
      req.payload.logger.info(
        `[notifyListingOwnerNewReview] ✅ Enqueued review.new for review ${doc.id} (job: ${result.id})`,
      )
    } else {
      req.payload.logger.warn(
        `[notifyListingOwnerNewReview] ⚠️ Skipped review.new for review ${doc.id} - Redis unavailable`,
      )
    }
  } catch (error) {
    // Don't throw - email failure shouldn't break review creation
    req.payload.logger.error(
      `[notifyListingOwnerNewReview] ❌ Failed to enqueue notification for review ${doc.id}:`,
      error,
    )
  }
}
