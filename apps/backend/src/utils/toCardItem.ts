import type { City, Event, Location, ListingType, Media, Service } from '@/payload-types'

/**
 * Shared utility to convert Payload listing documents to CardItem format
 * Used by feedEndpoint and buildHubSnapshot
 */
export function toCardItem(
  listingType: 'locations' | 'services' | 'events',
  doc: Location | Service | Event,
  options?: { includeGeo?: boolean },
): {
  listingId: number
  slug: string
  title: string
  cityLabel: string
  imageUrl: string | undefined
  verified: boolean
  ratingAvg: number | undefined
  ratingCount: number | undefined
  type: string
  startDate: string | undefined
  capacity: number
  tier: 'new' | 'standard' | 'sponsored' | 'recommended' | null | undefined
  geo?: [number, number] | null | undefined
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
    type: doc.type?.map((t: number | ListingType) => (t as ListingType).title).join(', ') ?? '',
    startDate: ((doc as Event)?.startDate as string | undefined) || undefined,
    capacity: capacity,
    tier: doc.tier,
    // Include geo only if requested (for feedEndpoint, not for buildHubSnapshot)
    ...(options?.includeGeo && { geo: doc.geo ? [doc.geo[0], doc.geo[1]] : null }),
  }
}

/**
 * Helper to extract image URL from listing document
 * Prefers featuredImage, falls back to first gallery image
 */
export function getImageURL(doc: Location | Service | Event): string | undefined {
  // Prefer featuredImage.url; fallback to first gallery image; adjust to your schema
  const file = doc.featuredImage ?? (doc.gallery?.[0] as number | Media | undefined)
  if (!file) return undefined
  // When depth:0, uploads are IDs; if you store full URL on create, use that.
  return typeof file === 'number' ? undefined : ((file.url ?? undefined) as string | undefined)
}
