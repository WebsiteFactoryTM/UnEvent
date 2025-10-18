import { Payload } from 'payload'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { City } from '../../payload-types'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function loadCityData(): Promise<Omit<City, 'id' | 'updatedAt' | 'createdAt'>[]> {
  const filePath = path.resolve(dirname, `../../data/seed/cities.json`)
  const content = await fs.readFile(filePath, 'utf-8')
  const data: Omit<City, 'id' | 'updatedAt' | 'createdAt'>[] = JSON.parse(content)
  return data
}

async function seedCities(payload: Payload) {
  try {
    console.log('Loading city data from JSON file...')

    const cityItems = await loadCityData()

    console.log(`Found ${cityItems.length} cities`)

    // Clear existing data
    await payload.delete({
      collection: 'cities',
      where: {},
    })

    console.log('Cleared existing city data')

    // Insert new data
    let created = 0
    for (const item of cityItems) {
      try {
        await payload.create({
          collection: 'cities',
          data: item,
        })
        created++
        console.log(`Created city: ${item.name}`)
      } catch (error) {
        console.error(`Failed to create city "${item.name}":`, error)
      }
    }

    console.log(`Successfully created ${created} city items`)
  } catch (error) {
    console.error('Cities seeding failed:', error)
    throw error
  }
}

export default seedCities
