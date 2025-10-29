// src/hooks/afterRead/withHasReviewedByViewer.ts
import type { CollectionAfterReadHook } from 'payload'

export const withHasReviewedByViewer: CollectionAfterReadHook = async ({
  req,
  doc,
  collection,
}) => {
  try {
    const user = req.user
    if (!user) return doc

    const profileId = typeof user.profile === 'number' ? user.profile : user.profile?.id
    if (!profileId) return doc

    // Look up review by this user for this listing
    const reviews = await req.payload.find({
      collection: 'reviews',
      where: {
        and: [
          { user: { equals: profileId } },
          { 'listing.relationTo': { equals: collection.slug } },
          { 'listing.value': { equals: doc.id } },
        ],
      },
      limit: 1,
      depth: 0,
    })

    return {
      ...doc,
      hasReviewedByViewer: reviews.docs.length > 0,
    }
  } catch (err) {
    console.error('withHasReviewedByViewer error', err)
    return doc
  }
}
