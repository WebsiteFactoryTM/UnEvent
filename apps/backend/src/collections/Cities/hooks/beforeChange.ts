import type { CollectionBeforeChangeHook } from 'payload'
import slugify from 'slugify'

export const beforeChange: CollectionBeforeChangeHook = async ({ data, operation }) => {
  // Only generate slug for new documents or if name has changed
  if (operation === 'create' || (operation === 'update' && data.name)) {
    const baseSlug = slugify(data.name, {
      lower: true,
      strict: true,
      trim: true,
    })

    // If country is not Romania, append country code to slug
    if (data.country && data.country.toLowerCase() !== 'romania') {
      const countryCode = slugify(data.country, {
        lower: true,
        strict: true,
        trim: true,
      })
      data.slug = `${baseSlug}-${countryCode}`
    } else {
      data.slug = baseSlug
    }
  }

  return data
}
