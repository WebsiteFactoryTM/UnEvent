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

    const favorites = await req.payload.count({
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
    })

    return {
      ...doc,
      isFavoritedByViewer: favorites.totalDocs > 0 ? true : false,
    }
  } catch {
    return doc
  }
}
