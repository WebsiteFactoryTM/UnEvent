import type { CollectionAfterChangeHook } from 'payload'
import { enqueueNotification } from '@/utils/notificationsQueue'

/**
 * Notify admins when a new claim is submitted
 */
export const notifyAdminNewClaim: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  // Only notify on create
  if (operation !== 'create') {
    return
  }

  try {
    // Get listing info - fetch listing to get title
    // Handle polymorphic relationship: could be { relationTo: 'services', value: 60 } or { relationTo: 'services', value: { id: 60, title: '...', ... } }
    let listingId: number | null = null
    let listingTitle = 'Unknown Listing'

    if (typeof doc.listing === 'number') {
      listingId = doc.listing
    } else if (doc.listing && typeof doc.listing === 'object') {
      if ('value' in doc.listing) {
        // Handle polymorphic format: { relationTo: 'services', value: 60 } or { relationTo: 'services', value: { id: 60, title: '...' } }
        const value = (
          doc.listing as { relationTo: string; value: number | { id: number; title?: string } }
        ).value
        if (typeof value === 'number') {
          listingId = value
        } else if (value && typeof value === 'object' && 'id' in value) {
          listingId = typeof value.id === 'number' ? value.id : Number(value.id)
          // If listing is already populated with title, use it
          if ('title' in value && value.title) {
            listingTitle = value.title
          }
        }
      } else if ('id' in doc.listing) {
        // Handle populated object: { id: 60, title: '...', ... }
        listingId = typeof doc.listing.id === 'number' ? doc.listing.id : Number(doc.listing.id)
        if ('title' in doc.listing && doc.listing.title) {
          listingTitle = doc.listing.title
        }
      }
    }

    const listingType = doc.listingType as 'locations' | 'events' | 'services'

    // Only fetch if we don't already have the title and we have a valid listingId
    if (listingId && listingType && listingTitle === 'Unknown Listing') {
      try {
        const listing = await req.payload.findByID({
          collection: listingType,
          id: listingId,
        })
        listingTitle = listing?.title || 'Unknown Listing'
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        req.payload.logger.warn(
          `[notifyAdminNewClaim] Could not fetch listing ${listingId}: ${errorMessage}`,
        )
        listingTitle = `Listing ID: ${listingId}`
      }
    }

    // Build admin dashboard URL
    const adminUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:4000'
    const dashboardUrl = `${adminUrl}/admin/collections/claims/${doc.id}`

    const result = await enqueueNotification('admin.claim.pending', {
      claim_id: String(doc.id),
      claim_token: doc.claimToken,
      listing_title: listingTitle,
      listing_type: doc.listingType,
      listing_id: String(listingId),
      claimant_email: doc.claimantEmail,
      claimant_name: doc.claimantName || undefined,
      dashboard_url: dashboardUrl,
    })

    if (!result.id) {
      req.payload.logger.warn(
        `[notifyAdminNewClaim] Skipped admin.claim.pending for claim ${doc.id} - Redis unavailable`,
      )
    }
  } catch (error) {
    // Don't throw - email failure shouldn't break claim creation
    const errorMessage = error instanceof Error ? error.message : String(error)
    req.payload.logger.error(
      `[notifyAdminNewClaim] ❌ Failed to enqueue notification for claim ${doc.id}:`,
      errorMessage,
    )
  }
}
