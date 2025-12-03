import type { CollectionBeforeChangeHook } from 'payload'

const polyRef = (k: 'locations' | 'events' | 'services', id: string | number) => ({
  relationTo: k,
  value: typeof id === 'number' ? id : Number(id),
})

export const preventDuplicateReview: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  // Only check on create operations
  if (operation !== 'create') {
    return data
  }

  // Get the user's profile ID
  const profileId = typeof req.user?.profile === 'number' ? req.user.profile : req.user?.profile?.id

  if (!profileId) {
    // If no profile, let other hooks handle the error
    return data
  }

  // Get the listing reference
  const listingRef = data.listing
  if (!listingRef) {
    return data
  }

  // Normalize listing reference - it should be an object with relationTo and value
  let listingType: 'locations' | 'events' | 'services'
  let listingId: number

  if (typeof listingRef === 'object' && 'relationTo' in listingRef && 'value' in listingRef) {
    listingType = listingRef.relationTo as 'locations' | 'events' | 'services'
    listingId =
      typeof listingRef.value === 'object' && 'id' in listingRef.value
        ? listingRef.value.id
        : (listingRef.value as number)
  } else {
    // Fallback: try to get from listingType field
    listingType = data.listingType as 'locations' | 'events' | 'services'
    listingId =
      typeof listingRef === 'object' && 'id' in listingRef ? listingRef.id : (listingRef as number)
  }

  if (!listingId || !listingType) {
    return data
  }

  // Check if user already has a review for this listing (any status)
  const existingReview = await req.payload.find({
    collection: 'reviews',
    where: {
      and: [
        { user: { equals: profileId } },
        {
          listing: {
            equals: polyRef(listingType, listingId),
          },
        },
      ],
    },
    limit: 1,
  })

  if (existingReview.totalDocs > 0) {
    throw new Error('You have already submitted a review for this listing')
  }

  return data
}
