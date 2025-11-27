import type { Payload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
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
      limit: 1000, // Process in batches if needed
    })

    console.log(`Found ${cities.docs.length} cities with geo coordinates`)

    let updatedCount = 0

    for (const city of cities.docs) {
      if (city.geo && Array.isArray(city.geo) && city.geo.length === 2) {
        const [lat, lng] = city.geo // Currently [lat, lng]

        // Swap to [lng, lat] (GeoJSON standard)
        const correctedGeo: [number, number] = [lng, lat]

        console.log(`Fixing ${city.name}: [${lat}, ${lng}] → [${lng}, ${lat}]`)

        await payload.update({
          collection: 'cities',
          id: city.id,
          data: {
            geo: correctedGeo,
          },
        })

        updatedCount++
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} cities`)
    console.log('Cities coordinate fix completed!')

    return NextResponse.json({
      success: true,
      message: `Fixed coordinates for ${updatedCount} cities`,
      updatedCount
    })

  } catch (error) {
    console.error('❌ Error fixing cities coordinates:', error)
    return NextResponse.json(
      { error: 'Failed to fix cities coordinates', details: error.message },
      { status: 500 }
    )
  }
}
