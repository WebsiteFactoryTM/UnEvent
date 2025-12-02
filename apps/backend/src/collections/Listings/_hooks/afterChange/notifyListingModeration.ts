import type { CollectionAfterChangeHook } from 'payload'
import { enqueueNotification } from '@/utils/notificationsQueue'

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
      req.payload.logger.warn(`[notifyListingModeration] No user found for profile ${ownerId}`)
      return
    }

    const user = users.docs[0]

    if (!user?.email) {
      req.payload.logger.warn(`[notifyListingModeration] No email found for user ${user.id}`)
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
        `[notifyListingModeration] Could not fetch profile for display name: ${err}`,
      )
    }

    // Build listing URL
    const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
    const listingType = collection.slug // 'events', 'locations', or 'services'
    const listingUrl = `${frontendUrl}/${listingType}/${doc.slug || doc.id}`

    if (currentStatus === 'approved') {
      await enqueueNotification('listing.approved', {
        first_name: firstName,
        userEmail: user.email,
        listing_title: doc.title,
        listing_type: listingType,
        listing_id: String(doc.id),
        listing_url: listingUrl,
      })

      req.payload.logger.info(
        `[notifyListingModeration] ✅ Enqueued listing.approved for listing ${doc.id}`,
      )
    } else if (currentStatus === 'rejected') {
      await enqueueNotification('listing.rejected', {
        first_name: firstName,
        userEmail: user.email,
        listing_title: doc.title,
        listing_type: listingType,
        listing_id: String(doc.id),
        reason: doc.rejectionReason || undefined,
        support_email: process.env.SUPPORT_EMAIL || 'support@unevent.com',
      })

      req.payload.logger.info(
        `[notifyListingModeration] ✅ Enqueued listing.rejected for listing ${doc.id}`,
      )
    }
  } catch (error) {
    // Don't throw - email failure shouldn't break listing update
    req.payload.logger.error(
      `[notifyListingModeration] ❌ Failed to enqueue notification for listing ${doc.id}:`,
      error,
    )
  }
}
