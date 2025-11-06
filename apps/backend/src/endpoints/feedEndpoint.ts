// feedEndpoint.ts - Main feed API endpoint for ranked listings

import type { PayloadRequest, Where } from 'payload'
import { z } from 'zod'
import { dailyJitter } from '../collections/Feed/scoring'
import type { PayloadHandler } from 'payload'
import type {
  Location,
  Event,
  Service,
  ListingRank,
  City,
  Media,
  ListingType,
} from '@/payload-types'

type Listing = Location | Event | Service

// Query schema validation
const FeedQuerySchema = z.object({
  entity: z.enum(['locations', 'events', 'services']),
  city: z.string().min(1).optional(), // Optional - browse all cities
  type: z.string().min(1).optional(), // Optional - browse all types
  suitableFor: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(24),
  ratingMin: z.coerce.number().min(0).max(5).optional(),
  facilities: z.string().optional(), // CSV: "wifi,parking" (only for locations)
  facilitiesMode: z.enum(['all', 'any']).default('all'),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  capacityMin: z.coerce.number().optional(), // Only for locations (indoor capacity)
  capacityMax: z.coerce.number().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().max(100000).default(10000).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

type FeedQuery = z.infer<typeof FeedQuerySchema>

/**
 * Feed endpoint handler
 * GET /api/feed?entity=locations&city=timisoara&type=restaurante&page=1&limit=24
 */
export const feedHandler: PayloadHandler = async (req: PayloadRequest) => {
  try {
    // Parse and validate query parameters
    const query: FeedQuery = FeedQuerySchema.parse({
      entity: req.query.entity,
      city: req.query.city,
      type: req.query.type,
      suitableFor: req.query.suitableFor,
      page: req.query.page,
      limit: req.query.limit,
      ratingMin: req.query.ratingMin,
      facilities: req.query.facilities,
      facilitiesMode: req.query.facilitiesMode,
      priceMin: req.query.priceMin,
      priceMax: req.query.priceMax,
      capacityMin: req.query.capacityMin,
      capacityMax: req.query.capacityMax,
      lat: req.query.lat,
      lng: req.query.lng,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    })

    // Create segment key for ranking (optional filters)
    const segmentKey = query.city && query.type ? `${query.city}|${query.type}` : null
    const pinnedLimit = 3 // Reserve first 3 slots for sponsored
    const today = new Date().toISOString().slice(0, 10)

    // Step 1: Build entity filters (facets)
    const whereEntity: Where = {
      and: [
        { status: { equals: 'approved' } }, // Only approved listings
      ],
    }

    // Add optional city or geo filter
    if (query.lat && query.lng) {
      whereEntity.and?.push({
        geo: { near: [query.lat, query.lng, query.radius] },
      })
    } else if (query.city) {
      whereEntity.and?.push({ 'city.slug': { equals: query.city } })
    }

    // Add optional type filter (can be hasMany relationship)
    if (query.type) {
      whereEntity.and?.push({ type: { in: query.type.split(',').map((s) => s.trim()) } })
    }
    if (query.entity !== 'events' && query.suitableFor) {
      whereEntity.and?.push({
        suitableFor: { in: query.suitableFor.split(',').map((s) => s.trim()) },
      })
    }

    // Rating filter
    if (query.ratingMin !== undefined) {
      whereEntity.and?.push({ rating: { greater_than_equal: query.ratingMin } })
    }

    // Facilities filter (only for locations)
    if (query.entity === 'locations' && query.facilities) {
      const facilitiesList = query.facilities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      if (facilitiesList.length > 0) {
        if (query.facilitiesMode === 'all') {
          // All facilities must match
          whereEntity.and?.push({ facilities: { all: facilitiesList } })
        } else {
          // Any facility matches
          whereEntity.and?.push({ facilities: { in: facilitiesList } })
        }
      }
    }

    // Price filters (nested in pricing.amount)
    if (query.priceMin !== undefined) {
      whereEntity.and?.push({ 'pricing.amount': { greater_than_equal: query.priceMin } })
    }
    if (query.priceMax !== undefined) {
      whereEntity.and?.push({ 'pricing.amount': { less_than_equal: query.priceMax } })
    }

    // Capacity filter (only for locations, using indoor capacity)
    if (query.entity === 'locations' && query.capacityMin !== undefined) {
      whereEntity.and?.push({ 'capacity.indoor': { greater_than_equal: query.capacityMin } })
    }
    if (query.entity === 'locations' && query.capacityMax !== undefined) {
      whereEntity.and?.push({ 'capacity.indoor': { less_than_equal: query.capacityMax } })
    }

    // Date filters (only for events)
    if (query.entity === 'events' && query.startDate) {
      whereEntity.and?.push({ startDate: { greater_than_equal: query.startDate } })
    }
    if (query.entity === 'events' && query.endDate) {
      whereEntity.and?.push({ endDate: { less_than_equal: query.endDate } })
    }
    // Step 2: Get candidate pool from the entity collection
    const candidatePool = await req.payload.find({
      collection: query.entity,
      where: whereEntity,
      limit: 2000, // Large pool for filtering
      depth: 0,
    })

    const candidateIds = new Set(candidatePool.docs.map((d: Listing) => String(d.id)))

    if (candidateIds.size === 0) {
      // No results - return empty response with cache headers
      return new Response(
        JSON.stringify({
          entity: query.entity,
          segmentKey,
          pinnedSponsored: [],
          organic: [],
          meta: { page: query.page, total: 0, limit: query.limit },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 's-maxage=120, stale-while-revalidate=60',
          },
        },
      )
    }

    // Step 3: Get ranked candidates by precomputed score (if segment exists)
    let rankedIds: string[]

    if (segmentKey) {
      // Use segment-based ranking
      const rankPool = await req.payload.find({
        collection: 'listing-rank',
        where: {
          and: [
            { segmentKey: { equals: segmentKey } },
            { kind: { equals: query.entity } },
            { target: { in: Array.from(candidateIds) } },
          ],
        },
        sort: '-score', // Sort by score descending
        limit: 2000,
        depth: 0,
      })

      // Extract ranked IDs (already sorted by score)
      rankedIds = rankPool.docs
        .map((r: ListingRank) => {
          const targetId =
            typeof r.target === 'object' && 'value' in r.target
              ? String(r.target.value)
              : String(r.target)
          return targetId
        })
        .filter((id) => candidateIds.has(id))
    } else {
      // No segment - use default ordering (by creation date)
      rankedIds = Array.from(candidateIds)
    }

    if (rankedIds.length === 0) {
      // No candidates found
      return new Response(
        JSON.stringify({
          entity: query.entity,
          segmentKey,
          pinnedSponsored: [],
          organic: [],
          meta: { page: query.page, total: 0, limit: query.limit },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
          },
        },
      )
    }

    // Step 4: Compose pinned sponsored + organic lists
    const todayJitter = (id: string) => 1 + dailyJitter(id, today)

    // Get top candidates for pinning
    const pinnedCandidateIds = rankedIds.slice(0, 200)

    const pinnedDocs = await req.payload.find({
      collection: query.entity,
      where: { id: { in: pinnedCandidateIds } },
      limit: pinnedCandidateIds.length,
      depth: 1,
    })

    // Extract sponsored and apply daily rotation
    const pinnedSponsored = pinnedDocs.docs
      .filter((l: Listing) => l.tier === 'sponsored')
      .sort((a: Listing, b: Listing) => todayJitter(String(b.id)) - todayJitter(String(a.id)))
      .slice(0, pinnedLimit)

    const pinnedIdSet = new Set(pinnedSponsored.map((l: Listing) => String(l.id)))

    // Organic list (remaining ranked items, excluding pinned)
    const organicIds = rankedIds.filter((id) => !pinnedIdSet.has(id))
    const start = (query.page - 1) * query.limit
    const organicPageIds = organicIds.slice(start, start + query.limit)

    const organicDocs =
      organicPageIds.length > 0
        ? await req.payload.find({
            collection: query.entity,
            where: { id: { in: organicPageIds } },
            limit: organicPageIds.length,
            depth: 1,
          })
        : { docs: [] }

    // Step 6: Return response with cache headers
    return new Response(
      JSON.stringify({
        entity: query.entity,
        segmentKey,
        meta: {
          page: query.page,
          total: organicIds.length,
          limit: query.limit,
          hasMore: start + query.limit < organicIds.length,
        },
        pinnedSponsored: pinnedSponsored.map((listing) => toCardItem(query.entity, listing)),
        organic: organicDocs.docs.map((listing) => toCardItem(query.entity, listing)),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
        },
      },
    )
  } catch (error: unknown) {
    console.error('[Feed] Error in feed endpoint:', error)

    // Return validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid query parameters',
          details: error.message,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: errMsg || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}

function toCardItem(
  listingType: 'locations' | 'services' | 'events',
  doc: Location | Service | Event,
): {
  listingId: number
  slug: string
  title: string
  cityLabel: string
  imageUrl: string | undefined
  verified: boolean
  ratingAvg: number | undefined
  ratingCount: number | undefined
  description: string
  type: string
  startDate: string | undefined
  capacity: number
  tier: 'new' | 'standard' | 'sponsored' | 'recommended' | null | undefined
} {
  let capacity = 0
  if (listingType === 'locations') {
    capacity = (doc as Location)?.capacity?.indoor ?? 0
  } else if (listingType === 'events') {
    capacity = (doc as Event)?.capacity?.total ?? 0
  }
  return {
    listingId: doc.id,
    slug: doc.slug as string,
    title: doc.title as string,
    cityLabel: (doc.city as City)?.name ?? '',
    imageUrl: getImageURL(doc),
    verified: doc.status === 'approved',
    ratingAvg: doc.rating as number | undefined,
    ratingCount: doc.reviewCount as number | undefined,
    description: doc.description as string,
    type: doc.type?.map((t: number | ListingType) => (t as ListingType).title).join(', ') ?? '',
    startDate: ((doc as Event)?.startDate as string | undefined) || undefined,
    capacity: capacity,
    tier: doc.tier,
  }
}
function getImageURL(doc: Location | Service | Event): string | undefined {
  // Prefer featuredImage.url; fallback to first gallery image; adjust to your schema
  const file = doc.featuredImage ?? (doc.gallery?.[0] as number | Media | undefined)
  if (!file) return undefined
  // When depth:0, uploads are IDs; if you store full URL on create, use that.
  return typeof file === 'number' ? undefined : ((file.url ?? undefined) as string | undefined)
}
