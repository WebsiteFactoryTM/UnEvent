// rankSegments.ts - Worker to compute ranking scores per segment

import type { Payload } from 'payload'
import type { Aggregate, Location, Event, Service } from '@/payload-types'
import { computeScore, type ListingSignals, type NormBounds, defaultWeights } from '../scoring'

// Helper to build a polymorphic relationship reference for Payload filters/values
const polyRef = (k: 'locations' | 'events' | 'services', id: string | number) => ({
  relationTo: k,
  value: typeof id === 'number' ? id : Number(id),
})

type Listing = Location | Event | Service
type Kind = 'locations' | 'events' | 'services'

/**
 * Compute ranking scores for all listings in all segments
 * A segment is defined as city + type (e.g., "timisoara|locatii")
 */
export async function rankSegments(payload: Payload): Promise<void> {
  const startTime = Date.now()

  try {
    console.log('[Feed] Starting rankSegments worker...')

    const collections: Kind[] = ['locations', 'events', 'services']

    // Process each collection type
    for (const kind of collections) {
      await rankCollectionSegments(payload, kind)
    }

    const duration = Date.now() - startTime
    console.log(`[Feed] ✅ rankSegments completed in ${duration}ms`)
  } catch (error) {
    console.error('[Feed] Error in rankSegments worker:', error)
  }
}

/**
 * Rank all listings in a specific collection by segments
 */
async function rankCollectionSegments(payload: Payload, kind: Kind): Promise<void> {
  console.log(`[Feed] Ranking ${kind}...`)
  // console.log('[Feed] rankCollectionSegments start', { kind });

  // Get all listings with their aggregates
  const listings = await payload.find({
    collection: kind,
    limit: 10000,
    depth: 0,
    pagination: false,
  })

  if (listings.docs.length === 0) {
    console.log(`[Feed] No ${kind} to rank, skipping...`)
    return
  }

  // Get all aggregates for this kind
  const aggregates = await payload.find({
    collection: 'aggregates',
    where: { kind: { equals: kind } },
    limit: 10000,
    depth: 0,
    pagination: false,
  })

  // Map aggregates by listing ID
  const aggregateMap = new Map<string, Aggregate>()
  for (const agg of aggregates.docs as Aggregate[]) {
    const targetId =
      typeof agg.target === 'object' && 'value' in agg.target
        ? String(agg.target.value)
        : String(agg.target)
    aggregateMap.set(targetId, agg)
  }

  // Group listings by segment (city + type)
  const segments = new Map<string, Array<{ listing: Listing; aggregate: Aggregate }>>()

  for (const listing of listings.docs as Listing[]) {
    // Skip listings without cities - segments require city+type
    if (!listing.city) {
      console.warn(`[Feed] Skipping ${kind} ${listing.id} - no city assigned`)
      continue
    }

    const cityId =
      typeof listing.city === 'object' && listing.city !== null && 'id' in listing.city
        ? String(listing.city.id)
        : String(listing.city)

    // Get type(s) - handle both single and hasMany
    const types = Array.isArray(listing.type) ? listing.type : [listing.type]

    for (const typeRaw of types) {
      // Skip listings without types
      if (!typeRaw) {
        console.warn(`[Feed] Skipping ${kind} ${listing.id} - no type assigned`)
        continue
      }

      const typeId =
        typeof typeRaw === 'object' && typeRaw !== null && 'id' in typeRaw
          ? String(typeRaw.id)
          : String(typeRaw)

      const segmentKey = `${cityId}|${typeId}`
      const aggregate = aggregateMap.get(String(listing.id))

      if (!aggregate) {
        console.warn(`[Feed] No aggregate found for ${kind} ${listing.id}, skipping...`)
        continue
      }

      if (!segments.has(segmentKey)) {
        segments.set(segmentKey, [])
      }

      segments.get(segmentKey)!.push({ listing, aggregate })
    }
  }

  console.log(`[Feed] Found ${segments.size} segments for ${kind}`)

  // Process each segment
  let totalProcessed = 0
  for (const [segmentKey, items] of segments) {
    try {
      await rankSegment(payload, kind, segmentKey, items)
      totalProcessed += items.length
    } catch (error) {
      console.error(`[Feed] Error ranking segment ${segmentKey}:`, error)
    }
  }

  console.log(`[Feed] Ranked ${totalProcessed} ${kind} across ${segments.size} segments`)
}

/**
 * Rank a single segment (compute scores and update listing_rank)
 */
async function rankSegment(
  payload: Payload,
  kind: Kind,
  segmentKey: string,
  items: Array<{ listing: Listing; aggregate: Aggregate }>,
): Promise<void> {
  if (items.length === 0) return

  // Step 1: Collect all signals and compute normalization bounds
  const signals: Array<ListingSignals & { id: string }> = []

  for (const { listing, aggregate } of items) {
    const createdAt = new Date(listing.createdAt!)
    const ageDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

    signals.push({
      id: String(listing.id),
      avgRating: aggregate.avgRating || 0,
      reviewsCount: aggregate.reviewsCount || 0,
      views7d: aggregate.views7d || 0,
      views30d: aggregate.views30d || 0,
      favoritesCount: aggregate.favorites || 0,
      bookings7d: aggregate.bookings7d || 0,
      bookings30d: aggregate.bookings30d || 0,
      ageDays,
      tier: (listing.tier as 'new' | 'standard' | 'recommended' | 'sponsored') || 'standard',
    })
  }

  // Step 2: Compute normalization bounds (min/max for this segment)
  const bounds = computeNormBounds(signals)

  // Step 3: Compute scores
  const today = new Date().toISOString().slice(0, 10)
  const scores: Array<{ id: string; score: number }> = []

  for (const s of signals) {
    const score = computeScore(s, bounds, { weights: defaultWeights, dateIso: today })
    scores.push({ id: s.id, score })
  }

  // Step 4: Upsert into listing_rank
  const calculatedAt = new Date()

  for (const { id, score } of scores) {
    const existing = await payload.find({
      collection: 'listing-rank',
      where: {
        and: [
          { segmentKey: { equals: segmentKey } },
          { kind: { equals: kind } },
          { target: { equals: polyRef(kind, id) } },
        ],
      },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'listing-rank',
        id: existing.docs[0].id,
        data: {
          score,
          calculatedAt: calculatedAt.toISOString(),
        },
      })
    } else {
      await payload.create({
        collection: 'listing-rank',
        data: {
          target: polyRef(kind, id),
          kind,
          segmentKey,
          score,
          calculatedAt: calculatedAt.toISOString(),
        },
      })
    }
  }
}

/**
 * Compute normalization bounds from signals
 */
function computeNormBounds(signals: ListingSignals[]): NormBounds {
  if (signals.length === 0) {
    // Return neutral bounds if no signals
    return {
      ratingMin: 0,
      ratingMax: 5,
      revMin: 0,
      revMax: 1,
      vwMin: 0,
      vwMax: 1,
      favMin: 0,
      favMax: 1,
      bkMin: 0,
      bkMax: 1,
      globalMeanRating: 4.5,
      bayesM: 10,
    }
  }

  // Apply transforms first
  const transformed = signals.map((s) => ({
    rating: s.avgRating,
    rev: Math.log1p(s.reviewsCount),
    vw: Math.log1p(0.7 * s.views7d + 0.3 * s.views30d),
    fav: Math.sqrt(Math.max(0, s.favoritesCount)),
    bk: Math.log1p(0.7 * s.bookings7d + 0.3 * s.bookings30d),
  }))

  // Find min/max for each transformed signal
  const ratingMin = Math.min(...transformed.map((t) => t.rating))
  const ratingMax = Math.max(...transformed.map((t) => t.rating))
  const revMin = Math.min(...transformed.map((t) => t.rev))
  const revMax = Math.max(...transformed.map((t) => t.rev))
  const vwMin = Math.min(...transformed.map((t) => t.vw))
  const vwMax = Math.max(...transformed.map((t) => t.vw))
  const favMin = Math.min(...transformed.map((t) => t.fav))
  const favMax = Math.max(...transformed.map((t) => t.fav))
  const bkMin = Math.min(...transformed.map((t) => t.bk))
  const bkMax = Math.max(...transformed.map((t) => t.bk))

  return {
    ratingMin,
    ratingMax,
    revMin,
    revMax,
    vwMin,
    vwMax,
    favMin,
    favMax,
    bkMin,
    bkMax,
    globalMeanRating: 4.5, // Could compute from all reviews
    bayesM: 10, // Prior weight for Bayesian rating
  }
}
