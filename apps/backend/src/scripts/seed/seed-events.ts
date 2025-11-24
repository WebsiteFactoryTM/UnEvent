import { Payload } from 'payload'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import slugify from 'slugify'
import type { Event } from '../../payload-types'
import { seedMedia } from './seed-media'
import { mapListingToMedia } from '@/data/seed/media/rename'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function loadEventData(): Promise<Omit<Event, 'id' | 'updatedAt' | 'createdAt'>[]> {
  const filePath = path.resolve(dirname, `../../data/seed/events.json`)
  const content = await fs.readFile(filePath, 'utf-8')
  const data: Omit<Event, 'id' | 'updatedAt' | 'createdAt'>[] = JSON.parse(content)
  return data
}

async function seedEvents(payload: Payload) {
  try {
    console.log('Loading event data from JSON file...')

    const eventItems = await loadEventData()

    console.log(`Found ${eventItems.length} events`)
    // Ensure media are seeded and get mapping
    const { mediaMap } = await seedMedia(payload)

    // Insert new data
    let created = 0
    for (const item of eventItems) {
      try {
        const slug = slugify(item.title || '', { lower: true, strict: true, trim: true })

        // Attach media based on mapping
        const featuredFilename = (mapListingToMedia.Events || []).find(
          (f: string) => path.parse(f).name === slug,
        )

        const featuredImageId = featuredFilename ? mediaMap[featuredFilename] : undefined

        // Gallery: next 2 from Events bucket deterministically
        const eventsBucket: string[] = mapListingToMedia.Events || []
        const idx = featuredFilename ? eventsBucket.indexOf(featuredFilename) : -1
        const galleryFilenames: string[] = []
        if (idx >= 0) {
          for (let i = 1; i <= 2 && eventsBucket.length > 1; i++) {
            const next = eventsBucket[(idx + i) % eventsBucket.length]
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

        // Upsert by slug
        const existing = await payload.find({
          collection: 'events',
          where: { slug: { equals: slug } },
          limit: 1,
        })

        if (existing.totalDocs > 0) {
          const doc = existing.docs[0]
          await payload.update({ collection: 'events', id: doc.id, data: dataWithMedia })
          console.log(`Updated event: ${item.title}`)
        } else {
          await payload.create({ collection: 'events', data: dataWithMedia })
          created++
          console.log(`Created event: ${item.title}`)
        }
      } catch (error) {
        console.error(`Failed to create event "${item.title}":`, error)
      }
    }

    console.log(`Successfully created ${created} event items`)
  } catch (error) {
    console.error('Events seeding failed:', error)
    throw error
  }
}

export default seedEvents
