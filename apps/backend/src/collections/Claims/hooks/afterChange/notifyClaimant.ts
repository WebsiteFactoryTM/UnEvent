import type { CollectionAfterChangeHook } from 'payload'
import { enqueueNotification } from '@/utils/notificationsQueue'
import { Event, Location, Service } from '@/payload-types'

/**
 * Notify claimant when claim is approved or rejected
 */
export const notifyClaimant: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // Only process on update when status changes
  if (operation !== 'update') return

  const previousStatus = previousDoc?.status
  const currentStatus = doc.status

  // Only notify when status changes from pending to approved/rejected
  if (
    previousStatus !== 'pending' ||
    (currentStatus !== 'approved' && currentStatus !== 'rejected')
  ) {
    return
  }

  try {
    // Get listing info
    const listingId = typeof doc.listing === 'number' ? doc.listing : doc.listing?.id
    const listingTitle =
      typeof doc.listing === 'object' && doc.listing !== null
        ? (doc.listing as Location | Event | Service).title
        : `Listing ID: ${listingId}`

    const listingType = doc.listingType
    const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
    const listingUrl = `${frontendUrl}/${listingType}/${typeof doc.listing === 'object' && doc.listing !== null ? (doc.listing as Location | Event | Service).slug : listingId}`

    if (currentStatus === 'approved') {
      // Notify claimant of approval
      const result = await enqueueNotification('claim.approved', {
        first_name: doc.claimantName || undefined,
        userEmail: doc.claimantEmail,
        listing_title: listingTitle,
        listing_type: listingType,
        listing_id: String(listingId),
        listing_url: listingUrl,
        claim_id: String(doc.id),
      })

      if (result.id) {
        req.payload.logger.info(
          `[notifyClaimant] ✅ Enqueued claim.approved for claim ${doc.id} (job: ${result.id})`,
        )
      }
    } else if (currentStatus === 'rejected') {
      // Notify claimant of rejection
      const result = await enqueueNotification('claim.rejected', {
        first_name: doc.claimantName || undefined,
        userEmail: doc.claimantEmail,
        listing_title: listingTitle,
        listing_type: listingType,
        listing_id: String(listingId),
        reason: doc.rejectionReason || undefined,
        support_email: process.env.SUPPORT_EMAIL || 'contact@unevent.ro',
        claim_id: String(doc.id),
      })

      if (result.id) {
        req.payload.logger.info(
          `[notifyClaimant] ✅ Enqueued claim.rejected for claim ${doc.id} (job: ${result.id})`,
        )
      }
    }
  } catch (error) {
    // Don't throw - email failure shouldn't break claim update
    const errorMessage = error instanceof Error ? error.message : String(error)
    req.payload.logger.error(
      `[notifyClaimant] ❌ Failed to enqueue notification for claim ${doc.id}:`,
      errorMessage,
    )
  }
}
