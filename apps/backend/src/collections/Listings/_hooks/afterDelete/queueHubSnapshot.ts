import type { CollectionAfterDeleteHook } from 'payload'

import { isHubSnapshotCandidate, queueHubSnapshotBuild } from '@/utils/hubSnapshotScheduler'

export const queueHubSnapshotAfterDelete: CollectionAfterDeleteHook = async ({
  collection,
  doc,
  req,
}) => {
  if (!doc) return
  if (!['locations', 'services', 'events'].includes(collection.slug)) return

  if (isHubSnapshotCandidate(doc)) {
    queueHubSnapshotBuild(
      req.payload,
      collection.slug as 'locations' | 'services' | 'events',
      'listing-deleted',
    )
  }
}
