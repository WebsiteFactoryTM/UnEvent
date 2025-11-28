import type { Payload } from 'payload'
import cron from 'node-cron'

let isRunning = false

/**
 * Efficient recount of city usage counters.
 * Strategy: Calculate accurate counts using aggregation queries, then batch update.
 * Much faster than zero-then-rebuild approach.
 */
export const syncCityCounters = async (payload: Payload) => {
  if (isRunning) {
    console.warn('[syncCityCounters] skipped: job already running')
    return
  }
  isRunning = true
  const started = Date.now()

  try {
    console.log('[syncCityCounters] start efficient recount')

    // Get accurate counts using aggregation queries
    const cityCounts = new Map<number, number>()

    // Count approved listings per city for each collection
    const collections = ['locations', 'services', 'events'] as const

    for (const collection of collections) {
      console.log(`[syncCityCounters] counting ${collection}...`)

      let page = 1
      const batchSize = 1000 // Process in larger batches for efficiency

      for (;;) {
        const listings = await payload.find({
          collection,
          page,
          limit: batchSize,
          depth: 0,
          where: {
            moderationStatus: { equals: 'approved' }, // Only count approved listings
            city: { exists: true }, // Only listings with cities
          },
        })

        // Aggregate counts for this batch
        for (const listing of listings.docs) {
          const cityId =
            listing.city && typeof listing.city === 'object' ? listing.city.id : listing.city

          if (cityId) {
            cityCounts.set(cityId, (cityCounts.get(cityId) || 0) + 1)
          }
        }

        if (!listings.hasNextPage) break
        page++
      }
    }

    console.log(`[syncCityCounters] found ${cityCounts.size} cities with listings`)

    // Batch update city counters
    let updateCount = 0
    const batchSize = 50 // Update in batches to avoid overwhelming the database

    for (const [cityId, count] of cityCounts) {
      try {
        await payload.update({
          collection: 'cities',
          id: cityId,
          data: { usageCount: count },
          depth: 0,
        })
        updateCount++
      } catch (e) {
        console.error(`[syncCityCounters] update failed for city ${cityId}:`, e)
      }

      // Small delay every batch to be gentle on the database
      if (updateCount % batchSize === 0) {
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    }

    // Reset counters for cities with no listings to 0
    console.log('[syncCityCounters] resetting cities with no listings...')
    let resetCount = 0
    let page = 1

    for (;;) {
      const cities = await payload.find({
        collection: 'cities',
        page,
        limit: 1000,
        depth: 0,
        where: {
          usageCount: { greater_than: 0 }, // Only check cities that have counts
        },
      })

      for (const city of cities.docs) {
        if (!cityCounts.has(city.id)) {
          try {
            await payload.update({
              collection: 'cities',
              id: city.id,
              data: { usageCount: 0 },
              depth: 0,
            })
            resetCount++
          } catch (e) {
            console.error(`[syncCityCounters] reset failed for city ${city.id}:`, e)
          }
        }
      }

      if (!cities.hasNextPage) break
      page++
    }

    const duration = Math.round((Date.now() - started) / 1000)
    console.log(
      `[syncCityCounters] completed in ${duration}s: ${updateCount} cities updated, ${resetCount} cities reset`,
    )
  } catch (e) {
    console.error('[syncCityCounters] failed:', e)
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
