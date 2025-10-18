import { Payload } from 'payload'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Location } from '../../payload-types'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function loadLocationData(): Promise<Omit<Location, 'id' | 'updatedAt' | 'createdAt'>[]> {
  const filePath = path.resolve(dirname, `../../data/seed/locations.json`)
  const content = await fs.readFile(filePath, 'utf-8')
  const data: Omit<Location, 'id' | 'updatedAt' | 'createdAt'>[] = JSON.parse(content)
  return data
}

async function seedLocations(payload: Payload) {
  try {
    console.log('Loading location data from JSON file...')

    const locationItems = await loadLocationData()

    console.log(`Found ${locationItems.length} locations`)

    // Clear existing data
    await payload.delete({
      collection: 'locations',
      where: {},
    })

    console.log('Cleared existing location data')

    // Insert new data
    let created = 0
    for (const item of locationItems) {
      try {
        await payload.create({
          collection: 'locations',
          data: item,
        })
        created++
        console.log(`Created location: ${item.title}`)
      } catch (error) {
        console.error(`Failed to create location "${item.title}":`, error)
      }
    }

    console.log(`Successfully created ${created} location items`)
  } catch (error) {
    console.error('Locations seeding failed:', error)
    throw error
  }
}

export default seedLocations
