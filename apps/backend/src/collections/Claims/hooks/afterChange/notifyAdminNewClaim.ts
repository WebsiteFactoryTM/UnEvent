import type { CollectionAfterChangeHook } from 'payload'
import { enqueueNotification } from '@/utils/notificationsQueue'
import { Event, Location, Service } from '@/payload-types'

/**
 * Notify admins when a new claim is submitted
 */
export const notifyAdminNewClaim: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  // Only notify on create
  if (operation !== 'create') {
    return
  }

  try {
    // Get listing info
    const listingId = typeof doc.listing === 'number' ? doc.listing : doc.listing?.id
    const listingTitle =
      typeof doc.listing === 'object' && doc.listing !== null
        ? (doc.listing as Location | Event | Service).title
        : `Listing ID: ${listingId}`

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

    if (result.id) {
      req.payload.logger.info(
        `[notifyAdminNewClaim] ✅ Enqueued admin.claim.pending for claim ${doc.id} (job: ${result.id})`,
      )
    } else {
      req.payload.logger.warn(
        `[notifyAdminNewClaim] ⚠️ Skipped admin.claim.pending for claim ${doc.id} - Redis unavailable`,
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
