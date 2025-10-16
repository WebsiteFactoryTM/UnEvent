import type { SanitizedConfig } from 'payload'

import payload from 'payload'
import seedListingTypes from './seed-listing-types'

// Script must define a "script" function export that accepts the sanitized config
export const script = async (config: SanitizedConfig) => {
  await payload.init({ config })
  await seedListingTypes()
  payload.logger.info('Successfully seeded!')
  process.exit(0)
}
