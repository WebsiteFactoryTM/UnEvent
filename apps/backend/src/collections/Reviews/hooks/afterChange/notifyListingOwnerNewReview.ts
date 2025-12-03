import type { CollectionAfterChangeHook } from 'payload'
import * as Sentry from '@sentry/nextjs'
import { enqueueNotification } from '@/utils/notificationsQueue'
import { collectionToPageSlug } from '@/utils/collectionToPageSlug'
import { Profile, Review, User } from '@/payload-types'

/**
 * Notify listing owner when a new review is created and approved
 */
export const notifyListingOwnerNewReview: CollectionAfterChangeHook<Review> = async ({
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
    // Get listing info - fetch to get owner and title
    const listingId = doc.listing.value as number
    const listingType = doc.listingType

    if (!listingId || !listingType) {
      req.payload.logger.warn(`[notifyListingOwnerNewReview] No listing found for review ${doc.id}`)
      return
    }

    // Fetch listing to get owner and title
    const listing = await req.payload.findByID({
      collection: listingType,
      id: typeof listingId === 'number' ? listingId : Number(listingId),
      depth: 1, // Get owner profile relationship
    })

    if (!listing || !listing.owner) {
      req.payload.logger.warn(
        `[notifyListingOwnerNewReview] No owner found for listing ${listingId} (review ${doc.id})`,
      )
      return
    }

    // Get owner info from listing.owner (should be populated with depth: 1)
    const ownerProfile = listing.owner as Profile | number
    const ownerId = typeof listing.owner === 'number' ? listing.owner : listing.owner?.id

    if (!ownerId) {
      req.payload.logger.warn(
        `[notifyListingOwnerNewReview] No owner ID found for listing ${listingId} (review ${doc.id})`,
      )
      return
    }

    let email: string
    let firstName: string
    let profile: Profile | null = null

    if (typeof ownerProfile === 'number') {
      // Owner profile is just an ID, need to fetch it
      try {
        profile = await req.payload.findByID({
          collection: 'profiles',
          id: ownerProfile,
        })

        if (!profile) {
          req.payload.logger.warn(
            `[notifyListingOwnerNewReview] No profile found for owner ${ownerId} (review ${doc.id})`,
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
            `[notifyListingOwnerNewReview] No email found for owner ${ownerId} (review ${doc.id})`,
          )
      return
    }

        email = user.email
        firstName = profile.displayName || profile.name || user.displayName || email.split('@')[0]
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        req.payload.logger.error(
          `[notifyListingOwnerNewReview] Failed to fetch owner profile/user ${ownerId} (review ${doc.id}):`,
          errorMessage,
        )
        if (err instanceof Error) {
          Sentry.withScope((scope) => {
            scope.setTag('hook', 'notifyListingOwnerNewReview')
            scope.setTag('operation', 'fetch_owner_profile_user')
            scope.setTag('review_id', String(doc.id))
            scope.setTag('owner_id', String(ownerId))
            scope.setTag('listing_id', String(listingId))
            scope.setContext('review', {
              id: doc.id,
              rating: doc.rating,
              ownerId,
              listingId,
              listingType,
            })
            Sentry.captureException(err)
          })
        }
        return
      }
    } else {
      // Owner profile is already populated
      profile = ownerProfile
      const user = profile.user as User | number | null

      if (!user || typeof user === 'number' || !user?.email) {
        req.payload.logger.warn(
          `[notifyListingOwnerNewReview] No email found for owner ${ownerId} (review ${doc.id})`,
        )
        return
      }

      email = user.email
      firstName = profile.displayName || profile.name || user.displayName || email.split('@')[0]
    }

    // Validate email
    if (!email || !email.includes('@')) {
      const error = new Error(`Invalid email for owner ${ownerId}: ${email}`)
      req.payload.logger.error(
        `[notifyListingOwnerNewReview] Invalid email for owner ${ownerId} (review ${doc.id}): ${email}`,
      )
      Sentry.withScope((scope) => {
        scope.setTag('hook', 'notifyListingOwnerNewReview')
        scope.setTag('operation', 'validate_email')
        scope.setTag('review_id', String(doc.id))
        scope.setTag('owner_id', String(ownerId))
        scope.setTag('listing_id', String(listingId))
        scope.setContext('review', {
          id: doc.id,
          ownerId,
          listingId,
          invalidEmail: email,
        })
        Sentry.captureException(error)
      })
      return
    }

    // Get reviewer info - profile should already be populated (maxDepth: 1)
    const reviewerProfile = doc.user as Profile | number | null
    let reviewerName = 'Un utilizator'

    if (reviewerProfile) {
      if (typeof reviewerProfile === 'number') {
        // Need to fetch reviewer profile
      try {
          const reviewer = await req.payload.findByID({
          collection: 'profiles',
            id: reviewerProfile,
        })
          reviewerName = reviewer?.displayName || reviewer?.name || 'Un utilizator'
      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err)
          req.payload.logger.debug(
            `[notifyListingOwnerNewReview] Could not fetch reviewer profile ${reviewerProfile}: ${errorMessage}`,
        )
          // Non-critical, use fallback
        }
      } else {
        // Reviewer profile is already populated
        reviewerName = reviewerProfile.displayName || reviewerProfile.name || 'Un utilizator'
      }
    }

    // Build listing URL
    const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
    const listingTypeSlug = collectionToPageSlug(listingType) || listingType
    const listingUrl = `${frontendUrl}/${listingTypeSlug}/${listing.slug || listing.id}`

    // Get comment snippet (first 100 chars)
    const commentSnippet = doc.comment
      ? doc.comment.length > 100
        ? doc.comment.substring(0, 100) + '...'
        : doc.comment
      : undefined

    const result = await enqueueNotification('review.new', {
      first_name: firstName,
      userEmail: email,
      listing_title: listing.title,
      listing_type: listingTypeSlug || 'unknown',
      reviewer_name: reviewerName,
      rating: doc.rating,
      comment_snippet: commentSnippet,
      listing_url: listingUrl,
    })

    if (result.id) {
      req.payload.logger.info(
        `[notifyListingOwnerNewReview] ✅ Enqueued review.new for review ${doc.id} (owner: ${ownerId}, job: ${result.id})`,
      )
    } else {
      req.payload.logger.warn(
        `[notifyListingOwnerNewReview] ⚠️ Skipped review.new for review ${doc.id} - Redis unavailable`,
      )
    }
  } catch (error) {
    // Don't throw - email failure shouldn't break review creation
    const errorMessage = error instanceof Error ? error.message : String(error)
    req.payload.logger.error(
      `[notifyListingOwnerNewReview] ❌ Failed to enqueue notification for review ${doc.id}:`,
      errorMessage,
    )
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('hook', 'notifyListingOwnerNewReview')
        scope.setTag('operation', 'enqueue_notification')
        scope.setTag('review_id', String(doc.id))
        scope.setContext('review', {
          id: doc.id,
          rating: doc.rating,
          reviewerId: typeof doc.user === 'number' ? doc.user : doc.user?.id || 'unknown',
          listingId:
            typeof doc.listing.value === 'number'
              ? doc.listing.value
              : doc.listing?.value?.id || 'unknown',
          listingType: doc.listingType || 'unknown',
          operation,
        })
        Sentry.captureException(error)
      })
    }
  }
}
