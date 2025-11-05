// tasks/buildHubSnapshot.ts
import { City, Event, HubSnapshot, ListingType, Location, Media, Service } from '@/payload-types'
import type { Payload } from 'payload'
import cron from 'node-cron'
import { revalidate } from '@/utils/revalidate'
import { buildPopularSearchCombos } from '@/utils/popularSearchCombos'

// Fallback cities if DB query returns nothing
const TOP_CITIES_FALLBACK = [
  'bucuresti',
  'cluj-napoca',
  'timisoara',
  'iasi',
  'brasov',
  'constanta',
] as const

export async function buildHubSnapshot(
  payload: Payload,
  collection: 'locations' | 'services' | 'events',
) {
  console.log(`[HubSnapshot] Building snapshot for ${collection}`)

  // 0) Top 6 cities (dynamic, fallback to static list)
  const citiesRes = await payload.find({
    collection: 'cities',
    sort: '-usageCount,-updatedAt',
    depth: 0,
    where: { usageCount: { greater_than: 0 } },
  })
  const typeaheadCities =
    citiesRes.docs.length > 0
      ? citiesRes.docs.slice(0, 6).map((c: City) => ({
          slug: (c as City).slug as string,
          label: (c as City).name as string,
        }))
      : (TOP_CITIES_FALLBACK as readonly string[]).map((slug) => ({
          slug,
          label: toCityLabel(slug),
        }))

  const topCities = typeaheadCities.slice(0, 6)
  // 0.b) Top 10 listing types for this domain
  const topTypesRes = await payload.find({
    collection: 'listing-types',
    where: {
      type: { equals: collection },
      isActive: { equals: true },
    },
    sort: '-usageCountPublic,-usageCount,-updatedAt',
    limit: 10,
    depth: 0,
  })

  const topTypes = topTypesRes.docs.map((t: ListingType) => ({
    slug: t.slug as string,
    label: (t.title as string) || (t.slug as string),
  }))

  // 1) Featured nationwide (adjust filters to your schema)
  const featured = await payload.find({
    collection,
    where: { status: { equals: 'approved' }, tier: { in: ['recommended', 'sponsored'] } }, // adapt
    sort: '-verified,-rating,-reviewsCount,-updatedAt',
    limit: 12,
    depth: 1, // keep snapshots light & fast
  })
  console.log(`[HubSnapshot] Found ${featured.docs.length} featured nationwide`)

  // 2) City rows (use dynamic topCities)
  const popularCityRows: Array<{
    citySlug: string
    cityLabel: string
    items: ReturnType<typeof toCardItem>[]
  }> = []

  for (const c of topCities) {
    const citySlug = c.slug
    const top = await payload.find({
      collection,
      where: {
        'city.slug': { equals: citySlug }, // adapt to your city field path
        status: { equals: 'approved' },
        tier: { in: ['recommended', 'sponsored'] },
      },
      sort: '-verified,-rating,-reviewsCount,-updatedAt',
      limit: 9,
      depth: 1,
    })

    if (top.docs.length) {
      popularCityRows.push({
        citySlug,
        cityLabel: c.label,
        items: top.docs.map((doc) => toCardItem(collection, doc)),
      })
    }
  }

  // 3) Typeahead cities (use dynamic list)

  // 4) Popular search combos (static for now)
  const popularSearchCombos = await buildPopularSearchCombos(
    payload,
    collection,
    topCities,
    topTypes,
  )

  console.log(`[HubSnapshot] Found ${popularSearchCombos.length} popular search combos`)
  console.log(popularSearchCombos)

  // 5) Upsert snapshot with new fields
  const data: Omit<HubSnapshot, 'id' | 'updatedAt' | 'createdAt'> = {
    listingType: collection,
    typeaheadCities, // for UI autocomplete
    topCities, // NEW: dynamic top cities used for rows/chips
    topTypes, // NEW: top 10 listing types for this domain
    popularCityRows,
    featured: featured.docs.map((doc) => toCardItem(collection, doc)),
    popularSearchCombos,
    generatedAt: new Date().toISOString(),
    algoVersion: 'v1',
  }

  console.log(`[HubSnapshot] Upserting snapshot for ${collection}`)
  // upsert by listingType
  const existing = await payload.find({
    collection: 'hub-snapshots',
    where: { listingType: { equals: collection } },
    limit: 1,
    depth: 0,
  })
  console.log(`[HubSnapshot] Found ${existing.docs.length} existing snapshots`)
  try {
    if (existing.docs[0]) {
      await payload.update({
        collection: 'hub-snapshots',
        id: existing.docs[0].id,
        data,
      })
      console.log(`[HubSnapshot] Updated snapshot for ${collection}`)
    } else {
      await payload.create({
        collection: 'hub-snapshots',
        data,
      })
      console.log(`[HubSnapshot] Created snapshot for ${collection}`)
    }
  } catch (error) {
    console.error(`[HubSnapshot] Error upserting snapshot for ${collection}:`, error)
    throw error
  }
  revalidate({ payload, collection: 'hub', slug: collection })
}

/** Helpers — adapt to your real field names / media */
function toCardItem(
  listingType: 'locations' | 'services' | 'events',
  doc: Location | Service | Event,
) {
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
  }
}

function getImageURL(doc: Location | Service | Event): string | undefined {
  // Prefer featuredImage.url; fallback to first gallery image; adjust to your schema
  const file = doc.featuredImage ?? (doc.gallery?.[0] as number | Media | undefined)
  if (!file) return undefined
  // When depth:0, uploads are IDs; if you store full URL on create, use that.
  return typeof file === 'number' ? undefined : ((file.url ?? undefined) as string | undefined)
}

function toCityLabel(slug: string) {
  const map: Record<string, string> = {
    bucuresti: 'București',
    'cluj-napoca': 'Cluj-Napoca',
    timisoara: 'Timișoara',
    iasi: 'Iași',
    brasov: 'Brașov',
    constanta: 'Constanța',
  }
  return map[slug] ?? slug
}

export const registerBuildHubSnapshotScheduler = (payload: Payload) => {
  // locations at :05
  cron.schedule('5 6,12,18,0 * * *', () => buildHubSnapshot(payload, 'locations'))
  // services at :07
  cron.schedule('7 6,12,18,0 * * *', () => buildHubSnapshot(payload, 'services'))
  // events at :09
  cron.schedule('9 6,12,18,0 * * *', () => buildHubSnapshot(payload, 'events'))
}
