import type { Payload } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

type MediaMap = Record<string, number>

function humanizeFilename(basename: string): string {
  const name = basename.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
  return name
    .split(' ')
    .map((p) => (p.length ? p[0].toUpperCase() + p.slice(1) : p))
    .join(' ')
}

export async function seedMedia(
  payload: Payload,
): Promise<{ mediaMap: MediaMap; orderedIds: number[] }> {
  const mediaDir = path.resolve(dirname, '../../data/seed/media')

  const entries = await fs.promises.readdir(mediaDir)
  const files = entries.filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))

  const mediaMap: MediaMap = {}
  const orderedIds: number[] = []

  for (const file of files) {
    // Check if media with same filename already exists
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: file } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      const doc = existing.docs[0]
      mediaMap[file] = doc.id as number
      orderedIds.push(doc.id as number)
      continue
    }

    const filePath = path.join(mediaDir, file)
    const alt = humanizeFilename(path.parse(file).name)

    // Create upload using filePath (Payload upload collections support filePath)
    const created = await payload.create({
      collection: 'media',
      filePath,
      data: { alt, context: 'listing' },
    })

    mediaMap[file] = created.id as number
    orderedIds.push(created.id as number)
  }

  return { mediaMap, orderedIds }
}

export default seedMedia
