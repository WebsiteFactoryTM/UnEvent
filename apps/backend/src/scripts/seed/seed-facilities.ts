import { Payload } from 'payload'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

interface FacilityItem {
  title: string
  category: string
  sortOrder: number
}

interface FacilityCategory {
  name: string
  items: Array<{
    name: string
  }>
}

interface FacilityData {
  categories: FacilityCategory[]
}

async function loadFacilityData(): Promise<FacilityItem[]> {
  const filePath = path.resolve(dirname, `../../data/taxonomies/facilities.json`)
  const content = await fs.readFile(filePath, 'utf-8')
  const data: FacilityData = JSON.parse(content)

  const items: FacilityItem[] = []

  for (const category of data.categories) {
    let sortOrder = 0
    for (const item of category.items) {
      items.push({
        title: item.name,
        category: category.name,
        sortOrder,
      })
      sortOrder++
    }
  }

  return items
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function seedFacilities(payload: Payload) {
  try {
    console.log('Loading facility data from JSON file...')

    const facilityItems = await loadFacilityData()

    console.log(`Found ${facilityItems.length} facilities`)

    // Clear existing data
    await payload.delete({
      collection: 'facilities',
      where: {},
    })

    console.log('Cleared existing facility data')

    // Insert new data
    let created = 0
    for (const item of facilityItems) {
      try {
        await payload.create({
          collection: 'facilities',
          data: item,
        })
        created++
      } catch (error) {
        console.error(`Failed to create facility "${item.title}":`, error)
      }
    }

    console.log(`Successfully created ${created} facility items`)
  } catch (error) {
    console.error('Facilities seeding failed:', error)
    throw error
  }
}

export default seedFacilities
