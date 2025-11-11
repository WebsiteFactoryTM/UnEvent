import type { CollectionAfterChangeHook } from 'payload'

export const markListingMediaPermanent: CollectionAfterChangeHook = async ({ doc, req }) => {
  const ids: Array<string | number> = []
  // featuredImage
  if (doc?.featuredImage) {
    if (typeof doc.featuredImage === 'object' && 'id' in doc.featuredImage) {
      ids.push((doc.featuredImage as { id: number | string }).id)
    } else {
      ids.push(doc.featuredImage as number | string)
    }
  }
  // gallery
  if (Array.isArray(doc?.gallery)) {
    for (const item of doc.gallery) {
      if (item && typeof item === 'object' && 'id' in item) {
        ids.push((item as { id: number | string }).id)
      } else if (item) {
        ids.push(item as number | string)
      }
    }
  }
  if (!ids.length) return
  await Promise.all(
    ids.map((id) =>
      req.payload.update({
        // Cast until generated types include temp/context
        collection: 'media',
        id,
        data: { temp: false, context: 'listing' },
      }),
    ),
  )
}
