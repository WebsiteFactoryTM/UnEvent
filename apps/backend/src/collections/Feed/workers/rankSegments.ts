// rankSegments.ts - Worker to compute ranking scores per segment

import type { Payload } from 'payload'
import type { Aggregate, Location, Event, Service, City } from '@/payload-types'
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
    depth: 1,
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

  // Group listings by segment (city + type, city + all, city + suitableFor)
  const segments = new Map<string, Array<{ listing: Listing; aggregate: Aggregate }>>()

  for (const listing of listings.docs as Listing[]) {
    // Skip listings without cities - segments require city+type
    if (!listing.city) {
      console.warn(`[Feed] Skipping ${kind} ${listing.id} - no city assigned`)
      continue
    }
    const citySlug =
      typeof listing.city === 'object' && listing.city !== null && 'slug' in listing.city
        ? String(listing.city.slug)
        : String(listing.city)

    const aggregate = aggregateMap.get(String(listing.id))

    if (!aggregate) {
      console.warn(`[Feed] No aggregate found for ${kind} ${listing.id}, skipping...`)
      continue
    }

    // 1. City + Type segments
    // Get type(s) - handle both single and hasMany
    const types = Array.isArray(listing.type) ? listing.type : [listing.type]

    for (const typeRaw of types) {
      // Skip listings without types
      if (!typeRaw) {
        console.warn(`[Feed] Skipping ${kind} ${listing.id} - no type assigned`)
        continue
      }

      const typeSlug =
        typeof typeRaw === 'object' && typeRaw !== null && 'slug' in typeRaw
          ? String(typeRaw.slug)
          : String(typeRaw)

      const segmentKey = `${citySlug}|${typeSlug}`

      if (!segments.has(segmentKey)) {
        segments.set(segmentKey, [])
      }

      segments.get(segmentKey)!.push({ listing, aggregate })
    }

    // 2. City + All segment (rank all listings in the city regardless of type)
    const allSegmentKey = `${citySlug}|all`
    if (!segments.has(allSegmentKey)) {
      segments.set(allSegmentKey, [])
    }
    segments.get(allSegmentKey)!.push({ listing, aggregate })

    // 3. City + SuitableFor segments (only for locations/services)
    if (kind !== 'events' && 'suitableFor' in listing && listing.suitableFor) {
      const suitableForList = Array.isArray(listing.suitableFor)
        ? listing.suitableFor
        : [listing.suitableFor]

      for (const sfRaw of suitableForList) {
        if (!sfRaw) continue

        const sfSlug =
          typeof sfRaw === 'object' && sfRaw !== null && 'slug' in sfRaw
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              String((sfRaw as any).slug)
            : String(sfRaw)

        const sfSegmentKey = `${citySlug}|${sfSlug}`

        if (!segments.has(sfSegmentKey)) {
          segments.set(sfSegmentKey, [])
        }

        segments.get(sfSegmentKey)!.push({ listing, aggregate })
      }
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
 * Rank a single listing across all its segments (city|type) for a given kind.
 * This recomputes the *entire* segment(s) so normalization bounds are correct.
 */
export async function rankSingle(
  payload: Payload,
  kind: Kind,
  targetId: number | string,
): Promise<void> {
  try {
    // Load the target listing with depth 1 to get city and type slugs
    const listing = (await payload.findByID({
      collection: kind,
      id: String(targetId),
      depth: 1,
    })) as Listing | null

    if (!listing) {
      console.warn(`[Feed] rankSingle: ${kind} ${String(targetId)} not found`)
      return
    }

    if (!listing.city) {
      console.warn(`[Feed] rankSingle: ${kind} ${listing.id} has no city; skipping`)
      return
    }

    // Resolve city slug (matching rankCollectionSegments)
    const citySlug =
      typeof listing.city === 'object' && listing.city !== null && 'slug' in listing.city
        ? String(listing.city.slug)
        : String(listing.city)

    // Resolve city id for querying
    const cityId =
      typeof listing.city === 'object' && listing.city !== null && 'id' in listing.city
        ? String((listing.city as City).id)
        : String(listing.city)

    // Resolve type slugs and ids (supports hasMany)
    // Handle optional type field (can be null/undefined for drafts)
    if (!listing.type) {
      console.warn(`[Feed] rankSingle: ${kind} ${listing.id} has no type; skipping`)
      return
    }

    const rawTypes = Array.isArray(listing.type) ? listing.type : [listing.type]

    const typeSlugs: string[] = []
    const typeIds: string[] = []

    for (const typeRaw of rawTypes) {
      if (!typeRaw) continue

      const typeSlug =
        typeof typeRaw === 'object' && typeRaw !== null && 'slug' in typeRaw
          ? String(typeRaw.slug)
          : String(typeRaw)
      typeSlugs.push(typeSlug)

      const typeId =
        typeof typeRaw === 'object' && typeRaw !== null && 'id' in typeRaw
          ? String((typeRaw as { id: string | number }).id)
          : String(typeRaw)
      typeIds.push(typeId)
    }

    if (!typeSlugs.length) {
      console.warn(`[Feed] rankSingle: ${kind} ${listing.id} has no type; skipping`)
      return
    }

    // Preload aggregates for this kind and map by target id
    const aggsRes = await payload.find({
      collection: 'aggregates',
      where: { kind: { equals: kind } },
      limit: 10000,
      depth: 0,
      pagination: false,
    })
    const aggregateMap = new Map<string, Aggregate>()
    for (const agg of aggsRes.docs as Aggregate[]) {
      const targetIdStr =
        typeof agg.target === 'object' && agg.target !== null && 'value' in agg.target
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            String((agg.target as any).value)
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            String((agg as any).target)
      aggregateMap.set(targetIdStr, agg)
    }

    // 1. Re-rank City + Type segments
    for (let i = 0; i < typeSlugs.length; i++) {
      const typeSlug = typeSlugs[i]
      const typeId = typeIds[i]
      const segmentKey = `${citySlug}|${typeSlug}`

      // Fetch all listings in this segment (query by IDs, but segment key uses slugs)
      const segmentListingsRes = await payload.find({
        collection: kind,
        where: {
          and: [{ city: { equals: cityId } }, { type: { equals: typeId } }],
        },
        limit: 10000,
        depth: 1, // Need depth 1 to get city and type slugs for segment key consistency
        pagination: false,
      })

      const items: Array<{ listing: Listing; aggregate: Aggregate }> = []
      for (const l of segmentListingsRes.docs as Listing[]) {
        const agg = aggregateMap.get(String(l.id))
        if (!agg) continue
        items.push({ listing: l, aggregate: agg })
      }

      if (!items.length) {
        console.warn(
          `[Feed] rankSingle: segment ${segmentKey} has no items with aggregates; skipping`,
        )
        continue
      }

      await rankSegment(payload, kind, segmentKey, items)
    }

    // 2. Re-rank City + All segment
    const allSegmentKey = `${citySlug}|all`
    const allListingsRes = await payload.find({
      collection: kind,
      where: { city: { equals: cityId } },
      limit: 10000,
      depth: 1,
      pagination: false,
    })

    const allItems: Array<{ listing: Listing; aggregate: Aggregate }> = []
    for (const l of allListingsRes.docs as Listing[]) {
      const agg = aggregateMap.get(String(l.id))
      if (!agg) continue
      allItems.push({ listing: l, aggregate: agg })
    }

    if (allItems.length > 0) {
      await rankSegment(payload, kind, allSegmentKey, allItems)
    }

    // 3. Re-rank City + SuitableFor segments (if applicable)
    if (kind !== 'events' && 'suitableFor' in listing && listing.suitableFor) {
      const sfList = Array.isArray(listing.suitableFor)
        ? listing.suitableFor
        : [listing.suitableFor]

      const sfIds: string[] = []
      const sfSlugs: string[] = []

      for (const sfRaw of sfList) {
        if (!sfRaw) continue
        const sfSlug =
          typeof sfRaw === 'object' && sfRaw !== null && 'slug' in sfRaw
            ? String((sfRaw as any).slug) // eslint-disable-line @typescript-eslint/no-explicit-any
            : String(sfRaw)
        sfSlugs.push(sfSlug)

        const sfId =
          typeof sfRaw === 'object' && sfRaw !== null && 'id' in sfRaw
            ? String((sfRaw as any).id) // eslint-disable-line @typescript-eslint/no-explicit-any
            : String(sfRaw)
        sfIds.push(sfId)
      }

      for (let i = 0; i < sfSlugs.length; i++) {
        const sfSlug = sfSlugs[i]
        const sfId = sfIds[i]
        const sfSegmentKey = `${citySlug}|${sfSlug}`

        const sfListingsRes = await payload.find({
          collection: kind,
          where: {
            and: [{ city: { equals: cityId } }, { suitableFor: { equals: sfId } }],
          },
          limit: 10000,
          depth: 1,
          pagination: false,
        })

        const sfItems: Array<{ listing: Listing; aggregate: Aggregate }> = []
        for (const l of sfListingsRes.docs as Listing[]) {
          const agg = aggregateMap.get(String(l.id))
          if (!agg) continue
          sfItems.push({ listing: l, aggregate: agg })
        }

        if (sfItems.length > 0) {
          await rankSegment(payload, kind, sfSegmentKey, sfItems)
        }
      }
    }
  } catch (e) {
    console.error(`[Feed] rankSingle error for ${kind} ${String(targetId)}:`, e)
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
