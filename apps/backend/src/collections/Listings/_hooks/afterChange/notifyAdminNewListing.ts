import type { CollectionAfterChangeHook } from 'payload'
import { enqueueNotification } from '@/utils/notificationsQueue'

/**
 * Notify admins when a new listing is created with pending status
 */
export const notifyAdminNewListing: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
  collection,
}) => {
  // Only trigger on create
  if (operation !== 'create') {
    return
  }

  // Only notify if status is pending
  if (doc.moderationStatus !== 'pending') {
    return
  }

  try {
    // Get creator info
    const ownerId = typeof doc.owner === 'number' ? doc.owner : doc.owner?.id || doc.owner

    let createdBy = 'Unknown'

    if (ownerId) {
      try {
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

        if (users.docs.length > 0) {
          const user = users.docs[0]
          createdBy = user.email || user.displayName || 'Unknown'
        } else {
          // Fallback: try to get profile name if user not found
          const profile = await req.payload.findByID({
            collection: 'profiles',
            id: ownerId,
          })
          createdBy = profile?.name || profile?.displayName || 'Unknown'
        }
      } catch (err) {
        req.payload.logger.warn(`[notifyAdminNewListing] Could not fetch creator info: ${err}`)
      }
    }

    // Build admin dashboard URL
    const adminUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:4000'
    const dashboardUrl = `${adminUrl}/admin/collections/${collection.slug}/${doc.id}`

    await enqueueNotification('admin.listing.pending', {
      listing_title: doc.title,
      listing_type: collection.slug, // 'events', 'locations', or 'services'
      listing_id: String(doc.id),
      created_by: createdBy,
      dashboard_url: dashboardUrl,
    })

    req.payload.logger.info(
      `[notifyAdminNewListing] ✅ Enqueued admin.listing.pending for listing ${doc.id}`,
    )
  } catch (error) {
    // Don't throw - email failure shouldn't break listing creation
    req.payload.logger.error(
      `[notifyAdminNewListing] ❌ Failed to enqueue notification for listing ${doc.id}:`,
      error,
    )
  }
}
