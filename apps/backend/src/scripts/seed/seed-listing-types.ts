import { promises as fs } from 'fs'
import path from 'path'
import { Payload } from 'payload'
import { fileURLToPath } from 'url'
import slugify from 'slugify'

interface TaxonomyItem {
  title: string
  category: string
  type: 'events' | 'locations' | 'services'
  sortOrder: number
  categorySlug: string
  slug: string
}

interface TaxonomyCategory {
  name: string
  items: Array<{
    name: string
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
        category: category.name,
        categorySlug: slugify(category.name, { lower: true, strict: true, trim: true }),
        type,
        sortOrder,
        slug: slugify(item.name, { lower: true, strict: true, trim: true }),
      })
      sortOrder++
    }
  }

  return items
}
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function seedListingTypes(payload: Payload) {
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
          data: {
            ...item,
            usageCount: 0,
            usageCountPublic: 0,
          },
        })
        created++
      } catch (error) {
        console.error(`Failed to create item "${item.title}":`, error)
      }
    }

    console.log(`Successfully created ${created} taxonomy items`)
  } catch (error) {
    console.error('Seeding failed:', error)
    return new Response('Seeding failed', { status: 500 })
  }
}
export default seedListingTypes
