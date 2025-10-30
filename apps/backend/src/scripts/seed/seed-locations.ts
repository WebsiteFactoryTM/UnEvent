import { Payload } from 'payload'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import slugify from 'slugify'
import type { Location } from '../../payload-types'
import { seedMedia } from './seed-media'
import { mapListingToMedia } from '@/data/seed/media/rename'

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
    const { mediaMap } = await seedMedia(payload)

    // Insert new data
    let created = 0
    for (const item of locationItems) {
      try {
        const slug = slugify(item.title || '', { lower: true, strict: true, trim: true })

        const featuredFilename = (mapListingToMedia.Locations || []).find(
          (f: string) => path.parse(f).name === slug,
        )
        const featuredImageId = featuredFilename ? mediaMap[featuredFilename] : undefined

        const bucket: string[] = mapListingToMedia.Locations || []
        const idx = featuredFilename ? bucket.indexOf(featuredFilename) : -1
        const galleryFilenames: string[] = []
        if (idx >= 0) {
          for (let i = 1; i <= 2 && bucket.length > 1; i++) {
            const next = bucket[(idx + i) % bucket.length]
            galleryFilenames.push(next)
          }
        }
        const galleryIds = galleryFilenames.map((fn) => mediaMap[fn]).filter(Boolean)

        const dataWithMedia = {
          ...item,
          ...(featuredImageId ? { featuredImage: featuredImageId } : {}),
          ...(galleryIds.length > 0 ? { gallery: galleryIds } : {}),
        }

        const existing = await payload.find({
          collection: 'locations',
          where: { slug: { equals: slug } },
          limit: 1,
        })

        if (existing.totalDocs > 0) {
          const doc = existing.docs[0]
          await payload.update({ collection: 'locations', id: doc.id, data: dataWithMedia })
          console.log(`Updated location: ${item.title}`)
        } else {
          await payload.create({ collection: 'locations', data: dataWithMedia })
          created++
          console.log(`Created location: ${item.title}`)
        }
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
