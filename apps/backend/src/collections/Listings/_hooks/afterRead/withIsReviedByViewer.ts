// src/hooks/afterRead/withHasReviewedByViewer.ts
import type { CollectionAfterReadHook } from 'payload'
const polyRef = (k: 'locations' | 'events' | 'services', id: string | number) => ({
  relationTo: k,
  value: typeof id === 'number' ? id : Number(id),
})

export const withHasReviewedByViewer: CollectionAfterReadHook = async ({
  req,
  doc,
  collection,
}) => {
  try {
    if (!req.query?.includeReviewState) {
      return doc
    }
    const user = req.user

    if (!user) return doc

    const profileId = typeof user.profile === 'number' ? user.profile : user.profile?.id
    if (!profileId) return doc

    // Look up review by this user for this listing
    const reviews = await req.payload.count({
      collection: 'reviews',
      where: {
        and: [
          { user: { equals: profileId } },
          {
            listing: {
              equals: polyRef(collection.slug as 'locations' | 'events' | 'services', doc.id),
            },
          },
        ],
      },
    })

    return {
      ...doc,
      hasReviewedByViewer: reviews.totalDocs > 0 ? true : false,
    }
  } catch (err) {
    console.error('withHasReviewedByViewer error', err)
    return doc
  }
}
