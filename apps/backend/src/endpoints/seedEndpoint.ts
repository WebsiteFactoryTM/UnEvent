import seedListingTypes from '@/scripts/seed/seed-listing-types'
import seedFacilities from '@/scripts/seed/seed-facilities'
import type { PayloadHandler } from 'payload'
import { isAdmin } from '@/collections/_access/roles'
import seedLocations from '@/scripts/seed/seed-locations'
import seedCities from '@/scripts/seed/seed-cities'
import seedEvents from '@/scripts/seed/seed-events'
import seedServices from '@/scripts/seed/seed-services'
import seedListings from '@/scripts/seed/seed-listings'

// Script must define a "script" function export that accepts the sanitized config
export const seed: PayloadHandler = async (req) => {
  console.log('seeding...')

  if (!req.user && isAdmin({ req })) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Listings-only seeding (media -> locations -> events -> services)
  await seedListings(req.payload)
  return new Response('Successfully seeded!', { status: 200 })
}
