// src/hooks/afterRead/withIsFavoritedByViewer.ts
import type { CollectionAfterReadHook } from 'payload'

export const withIsFavoritedByViewer: CollectionAfterReadHook = async ({
  req,
  doc,
  collection,
}) => {
  try {
    const user = req.user
    if (!user) return doc
    const profileId = typeof user.profile === 'number' ? user.profile : user.profile?.id
    if (!profileId) return doc

    const favorites = await req.payload.find({
      collection: 'favorites',
      where: {
        and: [
          { user: { equals: profileId } },
          {
            targetKey: {
              equals: `${collection.slug as 'locations' | 'events' | 'services'}:${doc.id}`,
            },
          },
        ],
      },
      limit: 1,
      depth: 0,
    })

    return {
      ...doc,
      isFavoritedByViewer: favorites.docs.length > 0,
    }
  } catch {
    return doc
  }
}
