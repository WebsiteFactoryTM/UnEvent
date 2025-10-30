import type { Payload } from 'payload'
import seedLocations from './seed-locations'
import seedEvents from './seed-events'
import seedServices from './seed-services'
import { seedMedia } from './seed-media'

export default async function seedListings(payload: Payload) {
  // Ensure media exist before attaching to listings
  await seedMedia(payload)
  await seedLocations(payload)
  await seedEvents(payload)
  await seedServices(payload)
}
