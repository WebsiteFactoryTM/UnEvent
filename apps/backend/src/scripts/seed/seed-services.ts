import { Payload } from 'payload'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import slugify from 'slugify'
import type { Service } from '../../payload-types'
import { seedMedia } from './seed-media'
import { mapListingToMedia } from '@/data/seed/media/rename'

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
    const { mediaMap } = await seedMedia(payload)

    // Insert new data
    let created = 0
    for (const item of serviceItems) {
      try {
        const slug = slugify(item.title || '', { lower: true, strict: true, trim: true })

        const featuredFilename = (mapListingToMedia.Services || []).find(
          (f: string) => path.parse(f).name === slug,
        )
        const featuredImageId = featuredFilename ? mediaMap[featuredFilename] : undefined

        const bucket: string[] = mapListingToMedia.Services || []
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
          _status: 'published' as const,
        }

        const existing = await payload.find({
          collection: 'services',
          where: { slug: { equals: slug } },
          limit: 1,
        })

        if (existing.totalDocs > 0) {
          const doc = existing.docs[0]
          await payload.update({ collection: 'services', id: doc.id, data: dataWithMedia })
          console.log(`Updated service: ${item.title}`)
        } else {
          await payload.create({ collection: 'services', data: dataWithMedia })
          created++
          console.log(`Created service: ${item.title}`)
        }
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
