import { CollectionAfterOperationHook } from 'payload'
import { rankSingle } from '../../../Feed/workers/rankSegments'
import { Kind } from '../..'

import { Event, Favorite, Location, Service } from '@/payload-types'

type Listing = Location | Event | Service

export const retractAggregatesFavorites: CollectionAfterOperationHook = async ({
  req,
  operation,
  result,
}) => {
  if (operation !== 'delete') {
    return
  }
  try {
    const favorite = result as unknown as Favorite

    const rel = favorite.target as { relationTo: Kind; value: number | Listing }
    const kind = favorite.kind as Kind
    const targetId = typeof rel.value === 'number' ? rel.value : rel.value.id

    const count = await req.payload.count({
      collection: 'favorites',
      where: { targetKey: { equals: favorite.targetKey } },
    })

    const countResult = (count.totalDocs ?? count) - 1

    await rankSingle(req.payload, kind, targetId)
    req.payload.update({
      collection: kind,
      id: targetId,
      data: { favoritesCount: countResult },
    })
  } catch (e) {
    console.error('[Favorites] post-delete hook for aggregates failed', e)
    req.payload.logger.error('[Favorites] post-delete hook for aggregates failed', e)
  }
}
