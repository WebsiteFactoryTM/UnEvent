import { Location, Service, Event } from '@/payload-types'
import type { FieldHook, Where } from 'payload'
import slugify from 'slugify'

/**
 * Field hook that generates a unique slug for listing collections (locations, services, events).
 * It derives the slug from the `title` field and ensures uniqueness within the collection by
 * appending a numeric suffix when needed (e.g. `my-listing-2`).
 */
export const ensureUniqueListingSlug: FieldHook = async ({
  siblingData,
  originalDoc,
  value,
  operation,
  req,
  collection,
}) => {
  // Prefer an explicitly provided slug, but if title hasn't changed and slug exists, keep it
  const previousTitle = (originalDoc as Location | Service | Event)?.title as string | undefined
  const previousSlug = (originalDoc as Location | Service | Event)?.slug as string | undefined
  const currentTitle = (siblingData?.title as string | undefined) ?? previousTitle

  // If there is already a slug and the title hasn't changed on update, keep the existing slug
  if (operation === 'update' && value && previousTitle === currentTitle && previousSlug === value) {
    return value
  }

  // If we don't have a title to derive from, just return the existing slug (if any)
  if (!currentTitle && !value) {
    return ''
  }

  const baseSource = currentTitle || (value as string)
  const baseSlug = slugify(baseSource, { lower: true, strict: true, trim: true })

  if (!baseSlug) {
    return value || ''
  }

  // Determine the collection this hook is running in

  const collectionSlug: string | undefined = collection?.slug as string | undefined

  const validCollections = ['locations', 'services', 'events'] as const
  type ListingCollectionSlug = (typeof validCollections)[number]

  if (!collectionSlug || !validCollections.includes(collectionSlug as ListingCollectionSlug)) {
    // Fallback: we can't determine the collection, just return the base slug
    return baseSlug
  }

  const targetCollection = collectionSlug as ListingCollectionSlug

  // Exclude current document when checking for uniqueness
  const idFilter = (originalDoc as Location | Service | Event)?.id
    ? {
        id: {
          not_equals: (originalDoc as Location | Service | Event).id,
        },
      }
    : {}

  // Helper to check if a slug already exists in this collection
  const existsWithSlug = async (slug: string) => {
    const result = await req.payload.find({
      collection: targetCollection,
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          idFilter,
        ],
      } as Where,
      limit: 1,
      depth: 0,
    })

    return result.totalDocs > 0
  }

  // If base slug is free, use it
  if (!(await existsWithSlug(baseSlug))) {
    return baseSlug
  }

  // Otherwise, append incremental suffix until a free slug is found
  let counter = 2
  while (counter < 1000) {
    const candidate = `${baseSlug}-${counter}`

    const taken = await existsWithSlug(candidate)
    if (!taken) {
      return candidate
    }
    counter += 1
  }

  // Safety fallback: append timestamp if we somehow exhausted attempts
  return `${baseSlug}-${Date.now()}`
}
