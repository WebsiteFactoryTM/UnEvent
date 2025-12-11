import type { CollectionAfterChangeHook } from 'payload'

/**
 * Transfer listing ownership when claim is approved
 */
export const transferOwnership: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // Only process on update when status changes to approved
  if (operation !== 'update') return

  const previousStatus = previousDoc?.status
  const currentStatus = doc.status

  // Only transfer ownership when status changes from pending to approved
  if (previousStatus === 'pending' && currentStatus === 'approved') {
    const listingId = typeof doc.listing === 'number' ? doc.listing : doc.listing?.id
    const listingType = doc.listingType as 'locations' | 'events' | 'services'
    const claimantProfileId =
      typeof doc.claimantProfile === 'number' ? doc.claimantProfile : doc.claimantProfile?.id

    if (!listingId || !listingType || !claimantProfileId) {
      req.payload.logger.warn(
        `[transferOwnership] Missing required data: listingId=${listingId}, listingType=${listingType}, claimantProfileId=${claimantProfileId}`,
      )
      return
    }

    try {
      // Update the listing: transfer ownership and mark as claimed
      await req.payload.update({
        collection: listingType,
        id: listingId,
        data: {
          owner: claimantProfileId,
          claimStatus: 'claimed',
        },
      })

      // Set reviewedBy if admin is reviewing
      if (req.user?.id && !doc.reviewedBy) {
        await req.payload.update({
          collection: 'claims',
          id: doc.id,
          data: {
            reviewedBy: req.user.id,
          },
        })
      }

      req.payload.logger.info(
        `[transferOwnership] ✅ Transferred ownership of ${listingType} ${listingId} to profile ${claimantProfileId}`,
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      req.payload.logger.error(
        `[transferOwnership] ❌ Failed to transfer ownership for claim ${doc.id}:`,
        errorMessage,
      )
      // Don't throw - allow the claim update to succeed even if ownership transfer fails
      // Admin can manually fix this
    }
  }
}
