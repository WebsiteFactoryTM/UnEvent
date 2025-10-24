import { PayloadRequest } from 'payload'
import { Kind } from '../index'

// Helpers (put these in a shared file if you prefer)
export const upsertAggregatesFavorites = async (
  req: PayloadRequest,
  kind: Kind,
  targetId: number,
  favorites: number,
): Promise<void> => {
  try {
    const poly = { relationTo: kind, value: targetId }
    const existing = await req.payload.find({
      collection: 'aggregates',
      where: { and: [{ kind: { equals: kind } }, { target: { equals: poly } }] },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length) {
      await req.payload.update({
        collection: 'aggregates',
        id: existing.docs[0].id,
        data: { favorites },
      })
    } else {
      await req.payload.create({
        collection: 'aggregates',
        data: {
          target: poly,
          kind,
          favorites,
          views7d: 0,
          views30d: 0,
          bookings7d: 0,
          bookings30d: 0,
          reviewsCount: 0,
          avgRating: 0,
          bayesRating: 0,
        },
      })
    }
  } catch (e) {
    console.error('[Favorites] upsertAggregatesFavorites failed', e)
    req.payload.logger.error('[Favorites] upsertAggregatesFavorites failed', e)
  }
}
