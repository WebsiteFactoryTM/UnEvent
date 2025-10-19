import { Payload } from 'payload'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Event } from '../../payload-types'

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

    // Clear existing data
    await payload.delete({
      collection: 'events',
      where: {},
    })

    console.log('Cleared existing event data')

    // Insert new data
    let created = 0
    for (const item of eventItems) {
      try {
        await payload.create({
          collection: 'events',
          data: item,
        })
        created++
        console.log(`Created event: ${item.title}`)
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
