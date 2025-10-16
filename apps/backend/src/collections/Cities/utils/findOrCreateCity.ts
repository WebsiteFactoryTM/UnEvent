import { Payload } from 'payload'
import slugify from 'slugify'

export type CityInput = {
  name: string
  country?: string
  geo?: {
    lat: number
    lng: number
  } | null
  source?: 'seeded' | 'google' | 'user'
}

export const findOrCreateCity = async (payload: Payload, cityData: CityInput) => {
  const { name, country = 'Romania', geo, source = 'user' } = cityData

  // Generate the base slug
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  })

  // Add country code to slug if not Romania
  const slug =
    country.toLowerCase() !== 'romania'
      ? `${baseSlug}-${slugify(country, { lower: true, strict: true, trim: true })}`
      : baseSlug

  try {
    // Try to find existing city
    const existingCity = await payload.find({
      collection: 'cities',
      where: {
        slug: { equals: slug },
      },
      limit: 1,
    })

    if (existingCity.docs.length > 0) {
      const city = existingCity.docs[0]

      // Update usage count
      await payload.update({
        collection: 'cities',
        id: city.id,
        data: {
          usageCount: (city.usageCount || 0) + 1,
        },
      })

      return city
    }

    // Create new city if not found
    const newCity = await payload.create({
      collection: 'cities',
      data: {
        name,
        country,
        geo: geo ? [geo.lat, geo.lng] : [0, 0],
        source,
        usageCount: 1,
      },
    })

    return newCity
  } catch (error) {
    console.error('Error in findOrCreateCity:', error)
    throw error
  }
}
