import { CollectionAfterOperationHook } from 'payload'
import { rankSingle } from '../../../Feed/workers/rankSegments'
import { Kind } from '../..'
import { Event, Favorite, Location, Service } from '@/payload-types'

type Listing = Location | Event | Service

export const bumpAggregatesFavorites: CollectionAfterOperationHook = async ({
  req,
  operation,
  result,
}) => {
  if (operation !== 'create') {
    return
  }
  try {
    const favorite = result as Favorite
    const rel = favorite.target as { relationTo: Kind; value: number | Listing }
    const kind = favorite.kind as Kind
    const targetId = typeof rel.value === 'number' ? rel.value : rel.value.id

    // recompute count = SELECT COUNT(*) FROM favorites WHERE targetKey = ...
    const count = await req.payload.count({
      collection: 'favorites',
      where: { targetKey: { equals: favorite.targetKey } },
    })

    const countResult = (count.totalDocs ?? count) + 1

    await rankSingle(req.payload, kind, targetId)
    req.payload.update({
      collection: kind,
      id: targetId,
      data: { favoritesCount: countResult },
    })
  } catch (e) {
    console.error('[Favorites] post-change hook for aggregates failed', e)
    req.payload.logger.error('[Favorites] post-change hook for aggregates failed', e)
  }
}
