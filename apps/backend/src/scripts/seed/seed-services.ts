import { Payload } from 'payload'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Service } from '../../payload-types'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function loadServiceData(): Promise<Omit<Service, 'id' | 'updatedAt' | 'createdAt'>[]> {
  const filePath = path.resolve(dirname, `../../data/seed/services.json`)
  const content = await fs.readFile(filePath, 'utf-8')
  const data: Omit<Service, 'id' | 'updatedAt' | 'createdAt'>[] = JSON.parse(content)
  return data
}

async function seedServices(payload: Payload) {
  try {
    console.log('Loading service data from JSON file...')

    const serviceItems = await loadServiceData()

    console.log(`Found ${serviceItems.length} services`)

    // Clear existing data
    await payload.delete({
      collection: 'services',
      where: {},
    })

    console.log('Cleared existing service data')

    // Insert new data
    let created = 0
    for (const item of serviceItems) {
      try {
        await payload.create({
          collection: 'services',
          data: item,
        })
        created++
        console.log(`Created service: ${item.title}`)
      } catch (error) {
        console.error(`Failed to create service "${item.title}":`, error)
      }
    }

    console.log(`Successfully created ${created} service items`)
  } catch (error) {
    console.error('Services seeding failed:', error)
    throw error
  }
}

export default seedServices
