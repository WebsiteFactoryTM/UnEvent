import type { CollectionBeforeChangeHook } from 'payload'
import slugify from 'slugify'

export const beforeChange: CollectionBeforeChangeHook = async ({ data, operation }) => {
  // Only generate slug for new documents or if name has changed
  if (operation === 'create' || (operation === 'update' && data.name)) {
    let slug = ''
    const baseSlug = slugify(data.name, {
      lower: true,
      strict: true,
      trim: true,
    })

    const countryCode = ''
    let countyCode = ''
    // If country is not Romania, append country code to slug
    if (data.county) {
      countyCode = slugify(data.county, {
        lower: true,
        strict: true,
        trim: true,
      })
      slug = `${baseSlug}-${countyCode}`
    }
    if (data.country && data.country.toLowerCase() !== 'romania') {
      slug = `${slug}-${countryCode}`
    }
    console.log('slug for ', data.name, data.county, slug)

    data.slug = slug
  }
  return data
}
