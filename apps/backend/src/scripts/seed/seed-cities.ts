import { Payload } from 'payload'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { City } from '../../payload-types'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const BATCH_SIZE = 500 // Process cities in batches to reduce memory pressure

/**
 * Yield cities in batches from the parsed array
 */
function* batchCities(
  cities: Omit<City, 'id' | 'updatedAt' | 'createdAt'>[],
  batchSize: number,
): Generator<Omit<City, 'id' | 'updatedAt' | 'createdAt'>[], void, unknown> {
  for (let i = 0; i < cities.length; i += batchSize) {
    yield cities.slice(i, i + batchSize)
  }
}

async function seedCities(payload: Payload) {
  try {
    console.log('Loading city data from JSON file...')
    const filePath = path.resolve(dirname, `../../data/seed/cities.json`)

    // Load and parse JSON
    // Note: JSON.parse loads entire file into memory. For very large files (>100k items),
    // consider using NODE_OPTIONS="--max-old-space-size=4096" or a streaming JSON parser
    const content = await fs.readFile(filePath, 'utf-8')
    const allCities: Omit<City, 'id' | 'updatedAt' | 'createdAt'>[] = JSON.parse(content)
    console.log(`Found ${allCities.length} cities`)

    // Clear existing data in batches
    console.log('Clearing existing city data...')
    let deleted = 0
    while (true) {
      const existing = await payload.find({
        collection: 'cities',
        limit: 1000,
        overrideAccess: true,
      })

      if (existing.docs.length === 0) break

      const ids = existing.docs.map((doc) => doc.id)
      await payload.delete({
        collection: 'cities',
        where: { id: { in: ids } },
        overrideAccess: true,
      })
      deleted += ids.length

      if (deleted % 5000 === 0) {
        console.log(`Deleted ${deleted} cities...`)
      }
    }
    console.log(`Cleared ${deleted} existing cities`)

    // Process cities in batches
    let totalCreated = 0
    let batchNumber = 0

    for (const batch of batchCities(allCities, BATCH_SIZE)) {
      batchNumber++
      console.log(
        `Processing batch ${batchNumber} (${batch.length} cities, ${totalCreated} total created)...`,
      )

      for (const item of batch) {
        try {
          await payload.create({
            collection: 'cities',
            data: {
              ...item,
              geo: [item.geo[1], item.geo[0]],
            },
            overrideAccess: true,
          })
          totalCreated++
        } catch (error) {
          console.error(`Failed to create city "${item.name}":`, error)
        }
      }

      // Clear processed batch from memory
      batch.length = 0
    }

    // Clear the main array reference
    allCities.length = 0

    console.log(`Successfully created ${totalCreated} city items`)
  } catch (error) {
    console.error('Cities seeding failed:', error)
    throw error
  }
}

export default seedCities
