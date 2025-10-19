import seedListingTypes from '@/scripts/seed/seed-listing-types'
import seedFacilities from '@/scripts/seed/seed-facilities'
import seedCities from '@/scripts/seed/seed-cities'
import seedLocations from '@/scripts/seed/seed-locations'
import seedEvents from '@/scripts/seed/seed-events'
import seedServices from '@/scripts/seed/seed-services'
import type { SanitizedConfig } from 'payload'
import payload from 'payload'

console.log('seeding...')

// Script must define a "script" function export that accepts the sanitized config
export const script = async (config: SanitizedConfig) => {
  console.log('seeding...')

  const payloadInstance = await payload.init({ config })
  await seedFacilities(payloadInstance)
  await seedListingTypes(payloadInstance)
  await seedCities(payloadInstance)
  await seedLocations(payloadInstance)
  await seedEvents(payloadInstance)
  await seedServices(payloadInstance)

  payload.logger.info('Successfully seeded!')
  process.exit(0)
}
