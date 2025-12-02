import type { FieldHook } from 'payload'
import slugify from 'slugify'
import type { Profile } from '@/payload-types'

/**
 * Field hook that generates a unique slug from the name field.
 * If the slug already exists, appends a number suffix (e.g., -2, -3) until unique.
 */
export const ensureUniqueSlug: FieldHook<Profile, string, Partial<Profile>> = async ({
  siblingData,
  operation,
  previousSiblingDoc,
  value,
  req,
}) => {
  // If slug is already set and name hasn't changed, keep the existing slug
  if (value && previousSiblingDoc?.name === siblingData?.name) {
    return value
  }

  // Get the name from sibling data
  const name = siblingData?.name as string | undefined
  if (!name) {
    return value || ''
  }

  // Generate base slug from name
  const baseSlug = slugify(name, { lower: true, strict: true, trim: true })

  // If no slug generated, return empty or existing value
  if (!baseSlug) {
    return value || ''
  }

  // For updates, if name hasn't changed, keep existing slug
  if (operation === 'update' && previousSiblingDoc?.name === name && previousSiblingDoc?.slug) {
    return previousSiblingDoc.slug
  }

  // Check if base slug exists
  const existingDoc = await req.payload.find({
    collection: 'profiles',
    where: {
      slug: {
        equals: baseSlug,
      },
      // Exclude current document if updating
      ...(previousSiblingDoc?.id
        ? {
            id: {
              not_equals: previousSiblingDoc.id,
            },
          }
        : {}),
    },
    limit: 1,
    depth: 0,
  })

  // If slug doesn't exist, use it
  if (existingDoc.totalDocs === 0) {
    return baseSlug
  }

  // Slug exists, find a unique one by appending numbers
  let uniqueSlug = baseSlug
  let counter = 2

  while (true) {
    uniqueSlug = `${baseSlug}-${counter}`

    const checkUnique = await req.payload.find({
      collection: 'profiles',
      where: {
        slug: {
          equals: uniqueSlug,
        },
        // Exclude current document if updating
        ...(previousSiblingDoc?.id
          ? {
              id: {
                not_equals: previousSiblingDoc.id,
              },
            }
          : {}),
      },
      limit: 1,
      depth: 0,
    })

    if (checkUnique.totalDocs === 0) {
      return uniqueSlug
    }

    counter++
    // Safety limit to prevent infinite loops
    if (counter > 1000) {
      // Fallback: append timestamp if we can't find a unique slug
      return `${baseSlug}-${Date.now()}`
    }
  }
}
