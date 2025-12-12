import type { CollectionBeforeValidateHook } from 'payload'

/**
 * Normalize the listing field format for polymorphic relationships
 * Payload REST API may send listing as ID number, but we need to ensure
 * it's properly formatted for polymorphic relationship
 */
export const normalizeListingField: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  // Debug logging - log the entire data object to see what we're receiving
  req.payload.logger.info(
    `[normalizeListingField] Operation: ${operation}, received data: ${JSON.stringify(data, null, 2)}`,
  )

  if (!data) {
    req.payload.logger.warn('[normalizeListingField] No data provided, skipping')
    return data
  }

  // Only process on create
  if (operation !== 'create') {
    return data
  }

  const listingType = data.listingType as 'locations' | 'events' | 'services'

  if (!listingType) {
    req.payload.logger.warn(
      '[normalizeListingField] No listingType provided, cannot normalize listing field',
    )
    return data
  }

  // If listing is a number, convert to polymorphic format
  if (typeof data.listing === 'number') {
    req.payload.logger.info(
      `[normalizeListingField] Converting listing ID ${data.listing} to polymorphic format with type ${listingType}`,
    )
    data.listing = {
      relationTo: listingType,
      value: data.listing,
    }
  }
  // If listing is already an object but missing relationTo, add it
  else if (
    typeof data.listing === 'object' &&
    data.listing !== null &&
    'value' in data.listing &&
    !('relationTo' in data.listing)
  ) {
    req.payload.logger.info(
      `[normalizeListingField] Adding relationTo ${listingType} to existing listing object`,
    )
    ;(data.listing as any).relationTo = listingType
  }
  // If listing is an object with relationTo and value, ensure types are correct
  else if (
    typeof data.listing === 'object' &&
    data.listing !== null &&
    'relationTo' in data.listing &&
    'value' in data.listing
  ) {
    const listingObj = data.listing as { relationTo: string; value: any }
    // Ensure value is a number
    if (typeof listingObj.value !== 'number') {
      req.payload.logger.info(
        `[normalizeListingField] Converting listing value from ${typeof listingObj.value} to number`,
      )
      listingObj.value = Number(listingObj.value)
    }
    // Ensure relationTo matches listingType
    if (listingObj.relationTo !== listingType) {
      req.payload.logger.info(
        `[normalizeListingField] Updating relationTo from ${listingObj.relationTo} to ${listingType}`,
      )
      listingObj.relationTo = listingType
    }
  }
  // If listing is undefined or null, we can't fix it here - validation will catch it
  else if (data.listing === undefined || data.listing === null) {
    req.payload.logger.warn(
      '[normalizeListingField] Listing field is undefined/null, cannot normalize',
    )
  }

  req.payload.logger.info(
    `[normalizeListingField] Final listing field: ${JSON.stringify(data.listing)}`,
  )

  return data
}
