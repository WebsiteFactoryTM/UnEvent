// aggregateDaily.ts - Worker to compute rolling windows and aggregates

import type { Payload } from 'payload'
import { bayesianRating } from '../scoring'
import { Location, Event, Service, MetricsDaily } from '@/payload-types'

// Helper to build a polymorphic relationship filter/value
const polyRef = (k: 'locations' | 'events' | 'services', id: string | number) => ({
  relationTo: k,
  value: typeof id === 'number' ? id : Number(id),
})

/**
 * Compute 7d and 30d rolling windows from metrics_daily
 * and update the aggregates collection
 */

type Listing = Location | Event | Service

export async function aggregateDaily(payload: Payload): Promise<void> {
  const startTime = Date.now()

  try {
    console.log('[Feed] Starting aggregateDaily worker...')

    const now = new Date()
    const date7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const date30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get all unique listings from all three collections
    const collections = ['locations', 'events', 'services'] as const
    const listingsToProcess: Array<{
      id: string | number
      kind: 'locations' | 'events' | 'services'
    }> = []

    for (const kind of collections) {
      const listings = await payload.find({
        collection: kind,
        limit: 10000, // Adjust based on your scale
        depth: 0,
        pagination: false,
      })

      for (const listing of listings.docs) {
        listingsToProcess.push({ id: listing.id, kind })
      }
    }

    console.log(`[Feed] Processing ${listingsToProcess.length} listings...`)

    // Process each listing
    let processed = 0
    for (const { id: listingId, kind } of listingsToProcess) {
      try {
        // Get metrics for last 7 and 30 days
        const metrics7d = await payload.find({
          collection: 'metrics-daily',
          where: {
            and: [
              { target: { equals: polyRef(kind, listingId) } },
              { kind: { equals: kind } },
              { date: { greater_than_equal: date7d.toISOString().split('T')[0] } },
            ],
          },
          limit: 1000,
          depth: 0,
        })

        const metrics30d = await payload.find({
          collection: 'metrics-daily',
          where: {
            and: [
              { target: { equals: polyRef(kind, listingId) } },
              { kind: { equals: kind } },
              { date: { greater_than_equal: date30d.toISOString().split('T')[0] } },
            ],
          },
          limit: 1000,
          depth: 0,
        })

        // Sum up views and bookings
        const views7d = metrics7d.docs.reduce((sum, m: MetricsDaily) => sum + (m.views || 0), 0)
        const views30d = metrics30d.docs.reduce((sum, m: MetricsDaily) => sum + (m.views || 0), 0)
        const bookings7d = metrics7d.docs.reduce(
          (sum, m: MetricsDaily) => sum + (m.bookings || 0),
          0,
        )
        const bookings30d = metrics30d.docs.reduce(
          (sum, m: MetricsDaily) => sum + (m.bookings || 0),
          0,
        )

        // Get favorites count from the listing itself
        const listing: Listing = await payload.findByID({
          collection: kind,
          id: listingId,
          depth: 0,
        })

        const favorites = listing?.favoritesCount || 0
        const safeFavorites = typeof favorites === 'number' && isFinite(favorites) ? favorites : 0

        // Get review stats from reviews collection
        const reviews = await payload.find({
          collection: 'reviews',
          where: {
            and: [
              { listing: { equals: polyRef(kind, listingId) } },
              { status: { equals: 'approved' } }, // Only approved reviews
            ],
          },
          limit: 1000,
          depth: 0,
        })

        const reviewsCount = reviews.totalDocs
        let avgRating = 0

        if (reviewsCount > 0) {
          const totalRating = reviews.docs.reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sum: number, r: any) => sum + (r.rating || 0),
            0,
          )
          avgRating = totalRating / reviewsCount
        }

        // Calculate Bayesian rating
        const globalMeanRating = 4.5 // Default, could be computed dynamically
        const bayesM = 10 // Prior weight
        const bayesRating_ = bayesianRating(avgRating, reviewsCount, globalMeanRating, bayesM)

        // Upsert into aggregates collection
        const existing = await payload.find({
          collection: 'aggregates',
          where: {
            and: [{ kind: { equals: kind } }, { target: { equals: polyRef(kind, listingId) } }],
          },
          limit: 1,
          depth: 0,
        })

        if (existing.docs.length > 0) {
          await payload.update({
            collection: 'aggregates',
            id: existing.docs[0].id,
            data: {
              kind,
              views7d,
              views30d,
              bookings7d,
              bookings30d,
              favorites: safeFavorites,
              reviewsCount,
              avgRating,
              bayesRating: bayesRating_,
            },
          })
        } else {
          await payload.create({
            collection: 'aggregates',
            data: {
              target: polyRef(kind, listingId),
              kind,
              views7d,
              views30d,
              bookings7d,
              bookings30d,
              favorites: safeFavorites,
              reviewsCount,
              avgRating,
              bayesRating: bayesRating_,
            },
          })
        }

        processed++
        if (processed % 100 === 0) {
          console.log(`[Feed] Aggregated ${processed}/${listingsToProcess.length} listings...`)
        }
      } catch (error) {
        console.error(`[Feed] Error aggregating listing ${listingId}:`, error)
      }
    }

    const duration = Date.now() - startTime
    console.log(`[Feed] ✅ aggregateDaily completed in ${duration}ms (${processed} listings)`)
  } catch (error) {
    console.error('[Feed] Error in aggregateDaily worker:', error)
  }
}
