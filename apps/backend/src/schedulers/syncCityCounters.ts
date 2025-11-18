import type { Payload } from 'payload'
import cron from 'node-cron'
import { syncCityUsage } from '@/utils/cityUsage'

let isRunning = false

/**
 * Full recount of city usage counters.
 * Strategy: zero all -> scan listings -> re-apply increments via syncCityUsage.
 * Note: current city schema updates only `usageCount` (no public split).
 */
export const syncCityCounters = async (payload: Payload) => {
  if (isRunning) {
    console.warn('[syncCityCounters] skipped: job already running')
    return
  }
  isRunning = true
  const started = Date.now()

  try {
    console.log('[syncCityCounters] start recount')

    // 1) Zero all city counters
    let page = 1
    for (;;) {
      const cities = await payload.find({ collection: 'cities', page, limit: 15000, depth: 0 })
      for (const c of cities.docs) {
        try {
          await payload.update({
            collection: 'cities',
            id: c.id,
            data: { usageCount: 0 },
            depth: 0,
          })
        } catch (e) {
          console.error('[syncCityCounters] zero city failed', c.id, e)
        }
      }
      if (!cities.hasNextPage) break
      page++
    }

    // 2) Re-scan each domain (locations/services/events) and apply increments
    const domains = ['locations', 'services', 'events'] as const
    for (const domain of domains) {
      let p = 1
      for (;;) {
        const res = await payload.find({ collection: domain, page: p, limit: 100, depth: 0 })
        for (const doc of res.docs) {
          // prevDoc undefined -> treated as an add for the current city (if any)
          try {
            await syncCityUsage(payload, doc as any, undefined)
          } catch (e) {
            console.error(`[syncCityCounters] apply for ${domain} doc`, (doc as any)?.id, e)
          }
        }
        if (!res.hasNextPage) break
        p++
      }
    }

    console.log('[syncCityCounters] done in', Math.round((Date.now() - started) / 1000), 's')
  } catch (e) {
    console.error('[syncCityCounters] failed', e)
  } finally {
    isRunning = false
  }
}

/**
 * Register daily cron at 02:23 server time.
 * Only runs when SCHEDULER_IS_PRIMARY=true to avoid duplicate runs across replicas.
 */
export const registerSyncCityCountersScheduler = (payload: Payload) => {
  if (process.env.SCHEDULER_IS_PRIMARY !== 'true') {
    console.log('[syncCityCounters] scheduler disabled (SCHEDULER_IS_PRIMARY != true)')
    return
  }
  cron.schedule('23 2 * * *', () => syncCityCounters(payload))
  console.log('[syncCityCounters] daily cron registered: 23 2 * * *')
}
