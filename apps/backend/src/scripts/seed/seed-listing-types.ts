import payload from 'payload'

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

interface TaxonomyItem {
  title: string
  slug: string
  category: string
  categorySlug: string
  type: 'events' | 'locations' | 'services'
  sortOrder: number
}

interface TaxonomyCategory {
  name: string
  slug: string
  items: Array<{
    name: string
    slug: string
  }>
}

interface TaxonomyData {
  categories: TaxonomyCategory[]
}

async function loadTaxonomyData(
  type: 'events' | 'locations' | 'services',
): Promise<TaxonomyItem[]> {
  const filePath = path.resolve(dirname, `../../data/taxonomies/${type}.json`)
  const content = await fs.readFile(filePath, 'utf-8')
  const data: TaxonomyData = JSON.parse(content)

  const items: TaxonomyItem[] = []

  for (const category of data.categories) {
    let sortOrder = 0
    for (const item of category.items) {
      items.push({
        title: item.name,
        slug: item.slug,
        category: category.name,
        categorySlug: category.slug,
        type,
        sortOrder,
      })
      sortOrder++
    }
  }

  return items
}
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function seedListingTypes() {
  try {
    console.log('Loading taxonomy data from JSON files...')

    const eventsItems = await loadTaxonomyData('events')
    const locationsItems = await loadTaxonomyData('locations')
    const servicesItems = await loadTaxonomyData('services')

    const allItems = [...eventsItems, ...locationsItems, ...servicesItems]

    console.log(
      `Found ${eventsItems.length} events, ${locationsItems.length} locations, ${servicesItems.length} services`,
    )

    // Clear existing data
    await payload.delete({
      collection: 'listing-types',
      where: {},
    })

    console.log('Cleared existing taxonomy data')

    // Insert new data
    let created = 0
    for (const item of allItems) {
      try {
        await payload.create({
          collection: 'listing-types',
          data: item,
        })
        created++
      } catch (error) {
        console.error(`Failed to create item "${item.title}":`, error)
      }
    }

    console.log(`Successfully created ${created} taxonomy items`)
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }

  process.exit(0)
}
export default seedListingTypes
