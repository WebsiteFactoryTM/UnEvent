import type { CollectionBeforeChangeHook } from 'payload'
import { randomUUID } from 'crypto'

/**
 * Generate a unique claim token if not provided
 * Token format: UUID v4 (e.g., 550e8400-e29b-41d4-a716-446655440000)
 */
export const generateClaimToken: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  // Debug logging
  req.payload.logger.info(
    `[generateClaimToken] Operation: ${operation}, listing field: ${JSON.stringify(data.listing)}, listingType: ${data.listingType}`,
  )

  // Only generate token on create
  if (operation === 'create' && !data.claimToken) {
    data.claimToken = randomUUID()
    req.payload.logger.info(`[generateClaimToken] Generated token: ${data.claimToken}`)
  }
  return data
}
