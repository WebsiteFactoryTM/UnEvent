import type { CollectionBeforeValidateHook } from 'payload'

/**
 * Normalize the listing field format for polymorphic relationships
 * Payload REST API may send listing as ID number, but we need to ensure
 * it's properly formatted for polymorphic relationship
 */
export const normalizeListingField: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (!data) {
    return data
  }

  // Only process on create
  if (operation !== 'create') {
    return data
  }

  const listingType = data.listingType as 'locations' | 'events' | 'services'

  if (!listingType) {
    return data
  }

  // If listing is a number, convert to polymorphic format
  if (typeof data.listing === 'number') {
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
      listingObj.value = Number(listingObj.value)
    }
    // Ensure relationTo matches listingType
    if (listingObj.relationTo !== listingType) {
      listingObj.relationTo = listingType
    }
  }

  return data
}
