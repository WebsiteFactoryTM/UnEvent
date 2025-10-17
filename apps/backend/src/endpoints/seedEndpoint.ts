import seedListingTypes from '@/scripts/seed/seed-listing-types'
import seedFacilities from '@/scripts/seed/seed-facilities'
import type { PayloadHandler } from 'payload'
import { isAdmin } from '@/access/roles'

// Script must define a "script" function export that accepts the sanitized config
export const seed: PayloadHandler = async (req) => {
  console.log('seeding...')

  if (!req.user && isAdmin({ req })) {
    return new Response('Unauthorized', { status: 401 })
  }

  await seedFacilities(req.payload)
  await seedListingTypes(req.payload)

  return new Response('Successfully seeded!', { status: 200 })
}
