import type { Payload, PayloadHandler, PayloadRequest } from 'payload'

import { isAdmin } from '../collections/_access/roles'

export const fixCities: PayloadHandler = async (req: PayloadRequest) => {
  try {
    // Temporarily bypass auth for testing - TODO: remove this
    if (!req.user || !isAdmin({ req })) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Get payload instance from the request context
    const payload = req.payload as Payload

    console.log('Starting cities coordinate fix...')

    // Get all cities with geo coordinates
    const cities = await payload.find({
      collection: 'cities',
      where: {
        geo: {
          exists: true,
        },
      },
      limit: 0,
      overrideAccess: true,
    })

    console.log(`Found ${cities.docs.length} cities with geo coordinates`)

    let updatedCount = 0

    for (const city of cities.docs) {
      if (city.geo && Array.isArray(city.geo) && city.geo.length === 2) {
        const [coord1, coord2] = city.geo

        // Check if first coordinate starts with 2 (longitude) or 4 (latitude)
        const coord1Str = coord1.toString()
        const isLngFirst = coord1Str.startsWith('2')
        const isLatFirst = coord1Str.startsWith('4')

        let correctedGeo: [number, number]
        let needsUpdate = false

        if (isLngFirst) {
          // Already [lng, lat], no change needed
          correctedGeo = [coord1, coord2]
          console.log(`✅ ${city.name}: Already correct [${coord1}, ${coord2}] (lng, lat)`)
        } else if (isLatFirst) {
          // Currently [lat, lng], swap to [lng, lat]
          correctedGeo = [coord2, coord1]
          needsUpdate = true
          console.log(
            `🔄 Fixing ${city.name}: [${coord1}, ${coord2}] → [${coord2}, ${coord1}] (lat,lng → lng,lat)`,
          )
        } else {
          // Unclear which is which, but assume it's already [lng, lat] for safety
          correctedGeo = [coord1, coord2]
          console.log(
            `⚠️ ${city.name}: Unclear coordinate type [${coord1}, ${coord2}], keeping as-is`,
          )
        }

        if (needsUpdate) {
          await payload.update({
            collection: 'cities',
            id: city.id,
            data: {
              geo: correctedGeo,
            },
            overrideAccess: true,
          })

          updatedCount++
        }
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} cities`)
    console.log('Cities coordinate fix completed!')

    return Response.json({
      success: true,
      message: `Fixed coordinates for ${updatedCount} cities`,
      updatedCount,
    })
  } catch (error) {
    console.error('❌ Error fixing cities coordinates:', error)
    return Response.json(
      {
        error: 'Failed to fix cities coordinates',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
