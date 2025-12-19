// tasks/buildHubSnapshot.ts
import { City, HubSnapshot, ListingType } from '@/payload-types'
import type { Payload } from 'payload'
import { toCardItem } from '@/utils/toCardItem'
import cron from 'node-cron'
import { revalidate } from '@/utils/revalidate'
import { buildPopularSearchCombos } from '@/utils/popularSearchCombos'
import { tag } from '@unevent/shared'
import { getSchedulerIntervalHours, hoursToCron } from '../utils/schedulerConfig'
import * as Sentry from '@sentry/nextjs'

// Fallback cities if DB query returns nothing
const TOP_CITIES_FALLBACK = [
  {
    slug: 'municipiul-bucuresti-bucuresti',
    label: 'București',
  },
  {
    slug: 'cluj-napoca-cluj',
    label: 'Cluj-Napoca',
  },
  {
    slug: 'timisoara-timis',
    label: 'Timișoara',
  },
  {
    slug: 'iasi-iasi',
    label: 'Iași',
  },
  {
    slug: 'brasov-brasov',
    label: 'Brașov',
  },
  {
    slug: 'constanta-constanta',
    label: 'Constanța',
  },
] as const

export async function buildHubSnapshot(
  payload: Payload,
  collection: 'locations' | 'services' | 'events',
) {
  console.log(`[HubSnapshot] Building snapshot for ${collection}`)

  // 0) Top 6 cities (dynamic, fallback to static list)
  const citiesRes = await payload.find({
    collection: 'cities',
    sort: ['-usageCount'],
    depth: 0,
    where: {
      featured: { equals: true },
    },
    limit: 100,
  })

  const typeaheadCities =
    citiesRes.docs.length > 0
      ? citiesRes.docs.slice(0, 6).map((c: City) => ({
          slug: (c as City).slug as string,
          label: (c as City).name as string,
        }))
      : (TOP_CITIES_FALLBACK as readonly { slug: string; label: string }[]).map((c) => ({
          slug: c.slug,
          label: c.label,
        }))

  const topCities = typeaheadCities.slice(0, 6)
  // 0.b) Top 10 listing types for this domain
  const topTypesRes = await payload.find({
    collection: 'listing-types',
    where: {
      type: { equals: collection },
      isActive: { equals: true },
    },
    sort: ['-usageCount', '-updatedAt'],
    limit: 10,
    depth: 0,
  })

  const topTypes = topTypesRes.docs.map((t: ListingType) => ({
    slug: t.slug as string,
    label: (t.title as string) || (t.slug as string),
  }))

  // 1) Featured nationwide (adjust filters to your schema)
  const featuredWhere: any = {
    moderationStatus: { equals: 'approved' },
    tier: { in: ['recommended', 'sponsored'] },
  }

  // For events, exclude finished events and events that have ended
  if (collection === 'events') {
    featuredWhere.eventStatus = { not_equals: 'finished' }
    featuredWhere.endDate = { greater_than_equal: new Date().toISOString() }
  }

  const featured = await payload.find({
    collection,
    where: featuredWhere,
    sort: ['-rating', '-reviewsCount', '-updatedAt'],
    limit: 12,
    depth: 1, // keep snapshots light & fast
  })
  console.log(`[HubSnapshot] Found ${featured.docs.length} featured nationwide`)

  // 2) City rows (use dynamic topCities)
  const popularCityRows: Array<{
    citySlug: string
    cityLabel: string
    items: Array<Omit<ReturnType<typeof toCardItem>, 'id'> & { listingId: number }>
  }> = []

  console.log('top cities', topCities)

  for (const c of topCities) {
    const citySlug = c.slug
    const cityWhere: any = {
      'city.slug': { equals: citySlug }, // adapt to your city field path
      moderationStatus: { equals: 'approved' },
      tier: { in: ['recommended', 'sponsored'] },
    }

    // For events, exclude finished events and events that have ended
    if (collection === 'events') {
      cityWhere.eventStatus = { not_equals: 'finished' }
      cityWhere.endDate = { greater_than_equal: new Date().toISOString() }
    }

    const top = await payload.find({
      collection,
      where: cityWhere,
      sort: ['-rating', '-reviewsCount', '-updatedAt'],
      limit: 9,
      depth: 1,
    })

    if (top.docs.length) {
      popularCityRows.push({
        citySlug,
        cityLabel: c.label,
        items: top.docs.map((doc) => {
          const { id, ...rest } = toCardItem(collection, doc)
          return { listingId: id, ...rest }
        }),
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

  // 5) Upsert snapshot with new fields
  const data: Omit<HubSnapshot, 'id' | 'updatedAt' | 'createdAt'> = {
    listingType: collection,
    typeaheadCities, // for UI autocomplete
    topCities, // NEW: dynamic top cities used for rows/chips
    topTypes, // NEW: top 10 listing types for this domain
    popularCityRows,
    featured: featured.docs.map((doc) => {
      const { id, ...rest } = toCardItem(collection, doc)
      return { listingId: id, ...rest }
    }),
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
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('scheduler', 'buildHubSnapshot')
        scope.setContext('scheduler', {
          collection,
        })
        Sentry.captureException(error)
      })
    }
    throw error
  }
  // Revalidate both specific hub snapshot and the general hub:any tag
  revalidate({
    tags: [tag.hubSnapshot(collection), tag.hubAny()],
    payload,
  })
}

/** Helpers — adapt to your real field names / media */

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
  console.log('[registerBuildHubSnapshotScheduler] registering cron jobs')

  // Hub snapshots run 2x daily (every 12 hours) by default
  // Configurable via SCHEDULER_HUB_SNAPSHOT_INTERVAL_HOURS
  // Default increased from 6h to 12h for MVP/low-traffic scenarios
  // For high-traffic sites, set SCHEDULER_HUB_SNAPSHOT_INTERVAL_HOURS=6
  // In production: 12 hours (2x daily)
  // In staging: 36 hours (3x slower)
  // In dev: 72 hours (6x slower)
  const snapshotIntervalHours = getSchedulerIntervalHours('hub_snapshot', 12, {
    envVarName: 'SCHEDULER_HUB_SNAPSHOT_INTERVAL_HOURS',
  })

  // For intervals >= 24 hours, use daily schedule
  // For intervals < 24 hours, use hourly schedule
  let locationsCron: string
  let servicesCron: string
  let eventsCron: string

  if (snapshotIntervalHours >= 24) {
    // Daily schedule
    locationsCron = `5 2 * * *` // Daily at 02:05
    servicesCron = `7 2 * * *` // Daily at 02:07
    eventsCron = `9 2 * * *` // Daily at 02:09
  } else if (snapshotIntervalHours >= 1) {
    // Use hours interval
    locationsCron = hoursToCron(snapshotIntervalHours, 5)
    servicesCron = hoursToCron(snapshotIntervalHours, 7)
    eventsCron = hoursToCron(snapshotIntervalHours, 9)
  } else {
    // Less than 1 hour - use minutes (fallback, shouldn't happen normally)
    const minutes = Math.floor(snapshotIntervalHours * 60)
    locationsCron = `${5} */${minutes} * * *`
    servicesCron = `${7} */${minutes} * * *`
    eventsCron = `${9} */${minutes} * * *`
  }

  console.log(
    `[HubSnapshot] locations scheduled: ${locationsCron} (${snapshotIntervalHours}h interval)`,
  )
  cron.schedule(locationsCron, () => buildHubSnapshot(payload, 'locations'))

  console.log(
    `[HubSnapshot] services scheduled: ${servicesCron} (${snapshotIntervalHours}h interval)`,
  )
  cron.schedule(servicesCron, () => buildHubSnapshot(payload, 'services'))

  console.log(`[HubSnapshot] events scheduled: ${eventsCron} (${snapshotIntervalHours}h interval)`)
  cron.schedule(eventsCron, () => buildHubSnapshot(payload, 'events'))

  // Build snapshots at init if they don't exist (non-blocking, fire-and-forget)
  // This ensures snapshots are available immediately on fresh deployments
  // without blocking server startup
  Promise.all([
    payload
      .find({
        collection: 'hub-snapshots',
        where: { listingType: { equals: 'locations' } },
        limit: 1,
      })
      .then((res) => {
        if (res.docs.length === 0) {
          console.log('[HubSnapshot] No locations snapshot found, building at init...')
          return buildHubSnapshot(payload, 'locations').catch((err) => {
            console.error('[HubSnapshot] Error building locations snapshot at init:', err)
          })
        }
      }),
    payload
      .find({
        collection: 'hub-snapshots',
        where: { listingType: { equals: 'services' } },
        limit: 1,
      })
      .then((res) => {
        if (res.docs.length === 0) {
          console.log('[HubSnapshot] No services snapshot found, building at init...')
          return buildHubSnapshot(payload, 'services').catch((err) => {
            console.error('[HubSnapshot] Error building services snapshot at init:', err)
          })
        }
      }),
    payload
      .find({
        collection: 'hub-snapshots',
        where: { listingType: { equals: 'events' } },
        limit: 1,
      })
      .then((res) => {
        if (res.docs.length === 0) {
          console.log('[HubSnapshot] No events snapshot found, building at init...')
          return buildHubSnapshot(payload, 'events').catch((err) => {
            console.error('[HubSnapshot] Error building events snapshot at init:', err)
          })
        }
      }),
  ]).catch((err) => {
    console.error('[HubSnapshot] Error checking snapshots at init:', err)
  })
}
