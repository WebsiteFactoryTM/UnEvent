import cron from 'node-cron'
import { Payload } from 'payload'

let isRunning = false

/**
 * Efficient recount of listing type usage counters.
 * Strategy: Calculate accurate counts using aggregation queries, then batch update.
 * Much faster than zero-then-rebuild approach.
 */
export const syncListingTypeCounters = async (payload: Payload) => {
  if (isRunning) {
    console.warn('[syncListingTypeCounters] skipped: job already running')
    return
  }
  isRunning = true
  const started = Date.now()

  try {
    console.log('[syncListingTypeCounters] start efficient recount')

    // Get accurate counts using aggregation queries
    const typeCounts = new Map<number, { total: number; public: number }>()

    // Count listings per type for each collection
    const collections = ['locations', 'services', 'events'] as const

    for (const collection of collections) {
      console.log(`[syncListingTypeCounters] counting ${collection}...`)

      let page = 1
      const batchSize = 1000 // Process in larger batches for efficiency

      for (;;) {
        const listings = await payload.find({
          collection,
          page,
          limit: batchSize,
          depth: 0,
          where: {
            type: { exists: true }, // Only listings with types
          },
        })

        // Aggregate counts for this batch
        for (const listing of listings.docs) {
          const typeIds = Array.isArray(listing.type) ? listing.type : [listing.type]
          const isPublic = listing.moderationStatus === 'approved'

          for (const typeRef of typeIds) {
            if (!typeRef) continue

            const typeId = typeof typeRef === 'object' ? typeRef.id : typeRef
            if (!typeId) continue

            const current = typeCounts.get(typeId) || { total: 0, public: 0 }
            current.total += 1
            if (isPublic) current.public += 1
            typeCounts.set(typeId, current)
          }
        }

        if (!listings.hasNextPage) break
        page++
      }
    }

    console.log(`[syncListingTypeCounters] found ${typeCounts.size} types with listings`)

    // Batch update listing type counters
    let updateCount = 0
    const batchSize = 50 // Update in batches to avoid overwhelming the database

    for (const [typeId, counts] of typeCounts) {
      try {
        await payload.update({
          collection: 'listing-types',
          id: typeId,
          data: {
            usageCount: counts.total,
            usageCountPublic: counts.public,
            usageUpdatedAt: new Date().toISOString(),
          },
          depth: 0,
        })
        updateCount++
      } catch (e) {
        console.error(`[syncListingTypeCounters] update failed for type ${typeId}:`, e)
      }

      // Small delay every batch to be gentle on the database
      if (updateCount % batchSize === 0) {
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    }

    // Reset counters for types with no listings to 0
    console.log('[syncListingTypeCounters] resetting types with no listings...')
    let resetCount = 0
    let page = 1

    for (;;) {
      const types = await payload.find({
        collection: 'listing-types',
        page,
        limit: 1000,
        depth: 0,
        where: {
          $or: [{ usageCount: { greater_than: 0 } }, { usageCountPublic: { greater_than: 0 } }],
        },
      })

      for (const type of types.docs) {
        if (!typeCounts.has(type.id)) {
          try {
            await payload.update({
              collection: 'listing-types',
              id: type.id,
              data: {
                usageCount: 0,
                usageCountPublic: 0,
                usageUpdatedAt: new Date().toISOString(),
              },
              depth: 0,
            })
            resetCount++
          } catch (e) {
            console.error(`[syncListingTypeCounters] reset failed for type ${type.id}:`, e)
          }
        }
      }

      if (!types.hasNextPage) break
      page++
    }

    const duration = Math.round((Date.now() - started) / 1000)
    console.log(
      `[syncListingTypeCounters] completed in ${duration}s: ${updateCount} types updated, ${resetCount} types reset`,
    )
  } catch (e) {
    console.error('[syncListingTypeCounters] failed:', e)
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
