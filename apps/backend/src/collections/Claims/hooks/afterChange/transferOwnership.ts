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
    // Extract listing ID from polymorphic relationship
    let listingId: number | undefined
    if (typeof doc.listing === 'number') {
      listingId = doc.listing
    } else if (doc.listing && typeof doc.listing === 'object') {
      // Handle polymorphic relationship format: { relationTo: 'locations', value: 96 }
      if ('value' in doc.listing) {
        listingId =
          typeof doc.listing.value === 'number'
            ? doc.listing.value
            : typeof doc.listing.value === 'object' &&
                doc.listing.value !== null &&
                'id' in doc.listing.value
              ? doc.listing.value.id
              : undefined
      } else if ('id' in doc.listing) {
        // Handle populated relationship object
        listingId = typeof doc.listing.id === 'number' ? doc.listing.id : undefined
      }
    }

    const listingType = doc.listingType as 'locations' | 'events' | 'services'
    const claimantProfileId =
      typeof doc.claimantProfile === 'number' ? doc.claimantProfile : doc.claimantProfile?.id

    if (!listingId || !listingType || !claimantProfileId) {
      return
    }

    try {
      // Update the listing: transfer ownership and mark as claimed
      // Use overrideAccess to ensure update succeeds even if access control would block it
      // Set context flag to skip sitemap regeneration (ownership changes don't affect sitemap)
      await req.payload.update({
        collection: listingType,
        id: listingId,
        data: {
          owner: claimantProfileId,
          claimStatus: 'claimed',
        },
        overrideAccess: true, // Bypass access control for ownership transfer
        req: {
          ...req,
          context: {
            ...req.context,
            skipSitemapRegeneration: true,
          },
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      req.payload.logger.error(
        `[transferOwnership] ❌ Failed to transfer ownership for claim ${doc.id}:`,
        errorMessage,
        errorStack,
      )
      // Don't throw - allow the claim update to succeed even if ownership transfer fails
      // Admin can manually fix this
    }
  }
}
