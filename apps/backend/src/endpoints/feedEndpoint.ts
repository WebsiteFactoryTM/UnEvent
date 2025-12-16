// feedEndpoint.ts - Main feed API endpoint for ranked listings

import type { PayloadRequest, Where } from 'payload'
import { z } from 'zod'
import { dailyJitter } from '../collections/Feed/scoring'
import type { PayloadHandler } from 'payload'
import * as Sentry from '@sentry/nextjs'
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

/**
 * Create a GeoJSON polygon representing a circle
 * Used for geo queries that need to avoid ORDER BY (which conflicts with DISTINCT)
 */
function createCirclePolygon(lng: number, lat: number, radiusMeters: number, points = 32) {
  const coords: number[][] = []
  const earthRadius = 6371000 // Earth's radius in meters

  for (let i = 0; i <= points; i++) {
    const angle = (i * 360) / points
    const rad = (angle * Math.PI) / 180

    // Calculate latitude and longitude offsets for each point on the circle
    const latOffset = (radiusMeters / earthRadius) * (180 / Math.PI) * Math.sin(rad)
    const lngOffset =
      (radiusMeters / (earthRadius * Math.cos((lat * Math.PI) / 180))) *
      (180 / Math.PI) *
      Math.cos(rad)

    const pointLat = lat + latOffset
    const pointLng = lng + lngOffset

    coords.push([pointLng, pointLat])
  }

  return {
    type: 'Polygon',
    coordinates: [coords],
  }
}

// Query schema validation
const FeedQuerySchema = z.object({
  entity: z.enum(['locations', 'events', 'services']),
  city: z.string().min(1).optional(), // Optional - browse all cities
  typeCategory: z.string().min(1).optional(), // Optional - filter by type category slug
  type: z.string().min(1).optional(), // Optional - browse all types
  suitableForCategory: z.string().min(1).optional(), // Optional - filter by suitableFor category slug
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
  radius: z.coerce
    .number()
    .transform((val) => Math.min(val, 100000)) // Clamp to max 100km
    .default(40000)
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

type FeedQuery = z.infer<typeof FeedQuerySchema>

function hasTimePart(s?: string): boolean {
  return !!s && /T\d{2}:\d{2}/.test(s)
}

function normalizeQueryBounds(start?: string, end?: string) {
  let qStartISO: string | undefined
  let qEndISO: string | undefined
  let endIsExclusive = false

  if (start) {
    // date-only -> start of day UTC, else keep provided instant
    qStartISO = hasTimePart(start)
      ? new Date(start).toISOString()
      : new Date(`${start}T00:00:00.000Z`).toISOString()
  }

  if (end) {
    if (hasTimePart(end)) {
      qEndISO = new Date(end).toISOString() // inclusive
      endIsExclusive = false
    } else {
      // date-only -> next day 00:00 UTC (exclusive upper bound)
      const d = new Date(`${end}T00:00:00.000Z`)
      d.setUTCDate(d.getUTCDate() + 1)
      qEndISO = d.toISOString()
      endIsExclusive = true
    }
  }

  return { qStartISO, qEndISO, endIsExclusive }
}

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
      typeCategory: req.query.typeCategory,
      type: req.query.type,
      suitableForCategory: req.query.suitableForCategory,
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
      radius: req.query.radius,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    })

    // Create segment key for ranking (optional filters)
    let segmentKey: string | null = null

    if (query.city) {
      if (query.type) {
        segmentKey = `${query.city}|${query.type}`
      } else if (query.suitableFor) {
        // Handle comma-separated values - just pick the first one for ranking optimization
        const firstSuitableFor = query.suitableFor.split(',')[0].trim()
        if (firstSuitableFor) {
          segmentKey = `${query.city}|${firstSuitableFor}`
        } else {
          segmentKey = `${query.city}|all`
        }
      } else {
        segmentKey = `${query.city}|all`
      }
    }
    const pinnedLimit = 6 // Reserve first 6 slots for sponsored + recommended
    const today = new Date().toISOString().slice(0, 10)

    // Step 1: Build entity filters (facets)
    const whereEntity: Where = {
      and: [
        { moderationStatus: { equals: 'approved' } }, // Only approved listings
        { deletedAt: { exists: false } }, // Exclude soft-deleted listings
      ],
    }

    // Add optional city or geo filter
    // When geo params are present, use geo filter (allows panning outside city boundaries)
    // Otherwise, use city filter
    // Note: 'near' adds ORDER BY distance which conflicts with DISTINCT when relationship joins exist
    // So we only use 'near' when there are no relationship filters (type, suitableFor, typeCategory, suitableForCategory, etc.)
    const hasRelationshipFilters = !!(
      query.type ||
      query.suitableFor ||
      query.typeCategory ||
      query.suitableForCategory
    )

    if (query.lat && query.lng && !hasRelationshipFilters) {
      // When both city and geo params are present, combine them:
      // Show listings that are either in the city OR within the geo radius
      // This allows map view to show city listings initially while still allowing geo search when panning
      if (query.city) {
        // When city is specified, use polygon intersection to avoid ORDER BY conflicts
        // This combines city filtering with geo filtering without sorting issues
        const radius = query.radius || 40000
        const circle = createCirclePolygon(query.lng, query.lat, radius)
        whereEntity.and?.push({
          or: [
            { 'city.slug': { equals: query.city } }, // All listings in the city
            {
              and: [
                { geo: { exists: true } }, // Only listings with geo coordinates
                { geo: { intersects: circle } }, // Listings within geo radius
              ],
            },
          ],
        })
      } else {
        // Pure geo filtering when no city specified
        whereEntity.and?.push({
          geo: { near: [query.lng, query.lat, query.radius || 40000] },
        })
      }
    } else if (query.lat && query.lng && hasRelationshipFilters) {
      // When relationship filters exist, use 'intersects' with a circular polygon instead of 'near'
      // This filters by distance without adding ORDER BY, avoiding DISTINCT conflict
      // Note: Results won't be sorted by distance, but will be filtered by distance
      const radius = query.radius || 40000 // Default 40km if not provided
      if (query.city) {
        whereEntity.and?.push({
          or: [
            { 'city.slug': { equals: query.city } },
            {
              and: [
                { geo: { exists: true } },
                { geo: { intersects: createCirclePolygon(query.lng, query.lat, radius) } },
              ],
            },
          ],
        })
      } else {
        whereEntity.and?.push({
          geo: { intersects: createCirclePolygon(query.lng, query.lat, radius) },
        })
      }
    } else if (query.city) {
      whereEntity.and?.push({ 'city.slug': { equals: query.city } })
    }

    // Add optional category filter for type (filters by type.categorySlug)
    if (query.typeCategory) {
      const categorySlugs = query.typeCategory.split(',').map((s) => s.trim())
      whereEntity.and?.push({ 'type.categorySlug': { in: categorySlugs } })
    }

    // Add optional type filter (can be hasMany relationship)
    if (query.type) {
      // Split comma-separated types and use 'in' for multiple values
      const typeSlugs = query.type.split(',').map((s) => s.trim())
      whereEntity.and?.push({ 'type.slug': { in: typeSlugs } })
    }

    // Add optional category filter for suitableFor (filters by suitableFor.categorySlug)
    if (query.entity !== 'events' && query.suitableForCategory) {
      const categorySlugs = query.suitableForCategory.split(',').map((s) => s.trim())
      whereEntity.and?.push({ 'suitableFor.categorySlug': { in: categorySlugs } })
    }

    if (query.entity !== 'events' && query.suitableFor) {
      const suitableForSlugs = query.suitableFor.split(',').map((s) => s.trim())
      whereEntity.and?.push({
        'suitableFor.slug': { in: suitableForSlugs },
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

    // Price filters (handle contact pricing for all entities)
    // For price filters, we need to include:
    // 1. Listings with pricing.type = 'contact' (no amount filter)
    // 2. Listings with pricing.type in ['fixed', 'from'] AND amount within range

    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      const priceConditions = []

      // Always include contact pricing listings
      priceConditions.push({ 'pricing.type': { equals: 'contact' } })

      // Add price range conditions for fixed/from pricing types
      const amountConditions = []
      if (query.priceMin !== undefined) {
        amountConditions.push({ 'pricing.amount': { greater_than_equal: query.priceMin } })
      }
      if (query.priceMax !== undefined) {
        amountConditions.push({ 'pricing.amount': { less_than_equal: query.priceMax } })
      }

      if (amountConditions.length > 0) {
        priceConditions.push({
          and: [{ 'pricing.type': { in: ['fixed', 'from'] } }, ...amountConditions],
        })
      }

      if (priceConditions.length > 1) {
        // Use OR to combine contact pricing + price range conditions
        whereEntity.and?.push({ or: priceConditions })
      } else if (priceConditions.length === 1) {
        // Only contact pricing condition
        whereEntity.and?.push(priceConditions[0])
      }
    }

    // Capacity filter (only for locations, using indoor capacity)
    if (query.entity === 'locations' && query.capacityMin !== undefined) {
      whereEntity.and?.push({ 'capacity.indoor': { greater_than_equal: query.capacityMin } })
    }
    if (query.entity === 'locations' && query.capacityMax !== undefined) {
      whereEntity.and?.push({ 'capacity.indoor': { less_than_equal: query.capacityMax } })
    }

    // Date filters (only for events) - CORRECT overlap logic
    const { qStartISO, qEndISO, endIsExclusive } = normalizeQueryBounds(
      query.startDate || new Date().toISOString(),
      query.endDate,
    )

    // Date filters (only for events) — overlap semantics with time-aware bounds
    if (query.entity === 'events') {
      const hasStart = Boolean(qStartISO)
      const hasEnd = Boolean(qEndISO)

      if (hasStart && hasEnd) {
        // Overlap: event.start < qEnd  AND  event.end >= qStart
        whereEntity.and?.push({
          and: [
            endIsExclusive
              ? { startDate: { less_than: qEndISO } } // end (date-only) => exclusive
              : { startDate: { less_than_equal: qEndISO } }, // end (with time) => inclusive
            { endDate: { greater_than_equal: qStartISO } },
          ],
        })
      } else if (hasStart) {
        // Any event ongoing at/after qStart
        whereEntity.and?.push({ endDate: { greater_than_equal: qStartISO } })
      } else if (hasEnd) {
        // Any event that has started by qEnd
        whereEntity.and?.push(
          endIsExclusive
            ? { startDate: { less_than: qEndISO } } // date-only end => exclusive
            : { startDate: { less_than_equal: qEndISO } }, // time end => inclusive
        )
      } else {
        whereEntity.and?.push({ endDate: { greater_than_equal: qStartISO } })
      }
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
          and: [{ segmentKey: { equals: segmentKey } }, { kind: { equals: query.entity } }],
        },
        sort: '-score', // Sort by score descending
        limit: 2000,
        depth: 0,
      })

      // Filter results to only include candidates we found
      const filteredRankPool = {
        ...rankPool,
        docs: rankPool.docs.filter((r: ListingRank) => {
          const targetId =
            typeof r.target === 'object' && 'value' in r.target
              ? String(r.target.value)
              : String(r.target)
          return candidateIds.has(targetId)
        }),
      }

      // Extract ranked IDs (already sorted by score)
      rankedIds = filteredRankPool.docs
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

    // If no rankings found, use candidates in default order
    if (rankedIds.length === 0) {
      rankedIds = Array.from(candidateIds)
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

    // Sort docs to match the ranked order (SQL IN doesn't preserve order)
    const pinnedDocsMap = new Map(pinnedDocs.docs.map((doc: Listing) => [String(doc.id), doc]))
    const sortedPinnedDocs = pinnedCandidateIds
      .map((id) => pinnedDocsMap.get(id))
      .filter((doc): doc is Listing => doc !== undefined)

    // Extract sponsored and recommended listings, apply daily rotation
    // Prioritize sponsored first, then recommended
    const sponsoredListings = sortedPinnedDocs
      .filter((l: Listing) => l.tier === 'sponsored')
      .sort((a: Listing, b: Listing) => todayJitter(String(b.id)) - todayJitter(String(a.id)))

    const recommendedListings = sortedPinnedDocs
      .filter((l: Listing) => l.tier === 'recommended')
      .sort((a: Listing, b: Listing) => todayJitter(String(b.id)) - todayJitter(String(a.id)))

    // Combine: sponsored first, then recommended, up to pinnedLimit
    const pinnedSponsored = [...sponsoredListings, ...recommendedListings].slice(0, pinnedLimit)

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

    // Sort organic docs to match the ranked order (SQL IN doesn't preserve order)
    const organicDocsMap = new Map(organicDocs.docs.map((doc: Listing) => [String(doc.id), doc]))
    const sortedOrganicDocs = organicPageIds
      .map((id) => organicDocsMap.get(id))
      .filter((doc): doc is Listing => doc !== undefined)

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
        organic: sortedOrganicDocs.map((listing) => toCardItem(query.entity, listing)),
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

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', 'feed')
        scope.setContext('request', {
          query: req.query,
          method: req.method,
        })
        if (req.user) {
          scope.setUser({
            id: String(req.user.id),
            email: req.user.email,
          })
        }
        Sentry.captureException(error)
      })
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
  geo: [number, number] | null | undefined
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
    verified: doc.verifiedStatus === 'approved',
    ratingAvg: doc.rating as number | undefined,
    ratingCount: doc.reviewCount as number | undefined,
    description: doc.description as string,
    type: doc.type?.map((t: number | ListingType) => (t as ListingType).title).join(', ') ?? '',
    startDate: ((doc as Event)?.startDate as string | undefined) || undefined,
    capacity: capacity,
    tier: doc.tier,
    // Reverse coordinates from [lng, lat] (GeoJSON) to [lat, lng] for frontend
    geo: doc.geo ? [doc.geo[0], doc.geo[1]] : null,
  }
}
function getImageURL(doc: Location | Service | Event): string | undefined {
  // Prefer featuredImage.url; fallback to first gallery image; adjust to your schema
  const file = doc.featuredImage ?? (doc.gallery?.[0] as number | Media | undefined)
  if (!file) return undefined
  // When depth:0, uploads are IDs; if you store full URL on create, use that.
  return typeof file === 'number' ? undefined : ((file.url ?? undefined) as string | undefined)
}
