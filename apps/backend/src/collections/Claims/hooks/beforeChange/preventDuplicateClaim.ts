import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Prevent duplicate pending claims for the same listing and email
 */
export const preventDuplicateClaim: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  // Only check on create operations
  if (operation !== 'create') {
    return data
  }

  const listingId =
    typeof data.listing === 'object' && data.listing !== null
      ? (data.listing as { relationTo: string; value: number }).value
      : typeof data.listing === 'number'
        ? data.listing
        : null

  const listingType = data.listingType as 'locations' | 'events' | 'services'
  const claimantEmail = data.claimantEmail

  if (!listingId || !listingType || !claimantEmail) {
    return data
  }

  try {
    // Check for existing pending claims
    // Use listingType + claimantEmail + status to find duplicates
    // Note: We can't directly query polymorphic listing field, so we use listingType instead
    const existingClaims = await req.payload.find({
      collection: 'claims',
      where: {
        and: [
          {
            listingType: {
              equals: listingType,
            },
          },
          {
            claimantEmail: {
              equals: claimantEmail,
            },
          },
          {
            status: {
              equals: 'pending',
            },
          },
        ],
      },
      limit: 100, // Get more to filter by listing ID in memory
    })

    // Filter by listing ID in memory (since polymorphic relationships are hard to query)
    const matchingClaims = existingClaims.docs?.filter((claim) => {
      const claimListingId =
        typeof claim.listing === 'object' && claim.listing !== null
          ? (claim.listing as { relationTo: string; value: number }).value
          : typeof claim.listing === 'number'
            ? claim.listing
            : null
      return claimListingId === listingId
    })

    if (matchingClaims && matchingClaims.length > 0) {
      throw new Error('A pending claim already exists for this listing and email address')
    }
  } catch (error) {
    // Re-throw validation errors
    if (error instanceof Error && error.message.includes('already exists')) {
      throw error
    }
    // Log other errors but don't block creation
    req.payload.logger.warn(
      `[preventDuplicateClaim] Error checking for duplicates: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return data
}
