import seedListingTypes from '@/scripts/seed/seed-listing-types'
import seedFacilities from '@/scripts/seed/seed-facilities'
import type { PayloadHandler } from 'payload'
import { isAdmin } from '@/collections/_access/roles'
import seedLocations from '@/scripts/seed/seed-locations'
import seedCities from '@/scripts/seed/seed-cities'
import seedEvents from '@/scripts/seed/seed-events'
import seedServices from '@/scripts/seed/seed-services'
import seedListings from '@/scripts/seed/seed-listings'
import { getRedis } from '@/utils/redis'
import * as Sentry from '@sentry/nextjs'

// Map of option values to their corresponding seed functions
const seedFunctions = {
  cities: seedCities,
  facilities: seedFacilities,
  listingTypes: seedListingTypes,
  locations: seedLocations,
  events: seedEvents,
  services: seedServices,
  listings: seedListings,
} as const

type SeedOption = keyof typeof seedFunctions

// Script must define a "script" function export that accepts the sanitized config
export const seed: PayloadHandler = async (req) => {
  if (!req.user || !isAdmin({ req })) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Extract option from query parameters
  const option = (req.query?.option as SeedOption | undefined) || null

  if (!option) {
    return new Response(
      JSON.stringify({
        error: 'Missing required query parameter: option',
        availableOptions: Object.keys(seedFunctions),
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  if (!seedFunctions[option]) {
    return new Response(
      JSON.stringify({
        error: `Invalid option: ${option}`,
        availableOptions: Object.keys(seedFunctions),
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const redis = getRedis()
  const lockKey = `locks:seed-${option}`
  // try to acquire lock for 15 minutes
  const locked = await redis.set(lockKey, String(Date.now()), 'EX', 15 * 60, 'NX')
  if (!locked) {
    return new Response(JSON.stringify({ error: `Seed for "${option}" already running` }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    console.log(`Seeding ${option}...`)
    const seedFunction = seedFunctions[option]
    await seedFunction(req.payload)
    return new Response(JSON.stringify({ message: `Successfully seeded ${option}!` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(`Error seeding ${option}:`, error)

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', 'seed')
        scope.setTag('seed_option', option)
        scope.setContext('request', {
          option,
          method: 'GET',
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

    return new Response(
      JSON.stringify({
        error: `Failed to seed ${option}`,
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } finally {
    await redis.del(lockKey)
  }
}
