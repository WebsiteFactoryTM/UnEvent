import cron from 'node-cron'
import { syncListingTypeUsage } from '../utils/listingTypeUsage'
import { Payload } from 'payload'

let isRunning = false

export const syncListingTypeCounters = async (payload: Payload) => {
  if (isRunning) {
    console.warn('[syncListingTypeCounters] skipped: job already running')
    return
  }
  isRunning = true
  const started = Date.now()
  try {
    console.log('[syncListingTypeCounters] start recount')

    // 1) zero all counters
    const allTypes = await payload.find({ collection: 'listing-types', limit: 10000, depth: 0 })
    for (const t of allTypes.docs) {
      await payload.update({
        collection: 'listing-types',
        id: t.id,
        data: { usageCount: 0, usageCountPublic: 0, usageUpdatedAt: new Date().toISOString() },
        depth: 0,
      })
    }

    // 2) Re-scan each domain (locations/services/events)
    const domains = ['locations', 'services', 'events'] as const
    for (const domain of domains) {
      let page = 1
      for (;;) {
        const res = await payload.find({ collection: domain, page, limit: 100, depth: 0 })
        for (const doc of res.docs) {
          await syncListingTypeUsage(payload, doc, undefined) // prev undefined, so it will add
        }
        if (!res.hasNextPage) break
        page++
      }
    }

    console.log('[syncListingTypeCounters] done in', Math.round((Date.now() - started) / 1000), 's')
  } catch (e) {
    console.error('[syncListingTypeCounters] failed', e)
  } finally {
    isRunning = false
  }
}

export const registerSyncListingTypeCountersScheduler = (payload: Payload) => {
  // Run this scheduler only on a designated instance to avoid duplicates in multi-replica deploys
  if (process.env.SCHEDULER_IS_PRIMARY !== 'true') {
    console.log('[syncListingTypeCounters] scheduler disabled (SCHEDULER_IS_PRIMARY != true)')
    return
  }

  // Every day at 02:17
  cron.schedule('17 2 * * *', () => syncListingTypeCounters(payload))
  console.log('[syncListingTypeCounters] daily cron registered: 17 2 * * *')
}
