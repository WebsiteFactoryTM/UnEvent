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

// Script must define a "script" function export that accepts the sanitized config
export const seed: PayloadHandler = async (req) => {
  if (!req.user && isAdmin({ req })) {
    return new Response('Unauthorized', { status: 401 })
  }
  const redis = getRedis()
  const lockKey = 'locks:seed-cities'
  // try to acquire lock for 15 minutes
  const locked = await redis.set(lockKey, String(Date.now()), 'EX', 15 * 60, 'NX')
  if (!locked) {
    return new Response('Seed already running', { status: 409 })
  }

  // Listings-only seeding (media -> locations -> events -> services)
  // await seedListings(req.payload)
  try {
    console.log('seeding...')
    await seedListings(req.payload)
    // await seedCities(req.payload)
    return new Response('Successfully seeded!', { status: 200 })
  } finally {
    await redis.del(lockKey)
  }
}
