import type { City, ListingType, Media } from '@/payload-types'
import type { SearchPluginConfig } from '@payloadcms/plugin-search/types'
import type { Field } from 'payload'

/**
 * Search index configuration for UN:EVENT.
 * - Index only approved listings (moderationStatus === 'approved')
 * - Store a small, UI-friendly payload for the search modal + /search page
 */
export const searchConfig: SearchPluginConfig = {
  collections: ['locations', 'services', 'events'],
  defaultPriorities: {
    locations: 10,
    services: 20,
    events: 30,
  },
  searchOverrides: {
    fields: ({ defaultFields }: { defaultFields: Field[] }) => [
      ...defaultFields,
      {
        name: 'description',
        type: 'textarea',
        admin: { readOnly: true },
      },
      {
        name: 'address',
        type: 'text',
        admin: { readOnly: true },
      },
      // NOTE: `type` is stored as an array of strings (listing-type titles)
      // so the schema must not be `text`.
      {
        name: 'type',
        type: 'json',
        admin: { readOnly: true },
      },
      {
        name: 'cityName',
        type: 'text',
        admin: { readOnly: true },
      },
      {
        name: 'imageUrl',
        type: 'text',
        admin: { readOnly: true },
      },
      {
        name: 'listingCollectionName',
        type: 'text',
        admin: { readOnly: true, hidden: false },
        access: {
          read: () => true,
        },
      },
      {
        name: 'slug',
        type: 'text',
        admin: { readOnly: true },
      },
      {
        name: 'rating',
        type: 'number',
        admin: { readOnly: true },
      },
      {
        name: 'tier',
        type: 'text',
        admin: { readOnly: true },
      },
      {
        name: 'views',
        type: 'number',
        admin: { readOnly: true },
      },
      {
        name: 'favoritesCount',
        type: 'number',
        admin: { readOnly: true },
      },
      {
        name: 'typeText',
        type: 'text',
        admin: { readOnly: true },
      },
      {
        name: 'suitableForText',
        type: 'text',
        admin: { readOnly: true },
      },
      {
        name: 'searchText',
        type: 'text',
        admin: { readOnly: true, hidden: false },
        label: 'Normalized Search Text (diacritics removed)',
        access: {
          read: () => true,
        },
      },
    ],
  },
  beforeSync: async ({
    originalDoc,
    searchDoc,
    payload,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    originalDoc: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    searchDoc: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any
  }) => {
    // Only index approved listings.
    if (originalDoc?.moderationStatus !== 'approved' || originalDoc?._status !== 'published') {
      return null
    }

    const safeString = (value: unknown): string => (typeof value === 'string' ? value : '')

    const safeNumber = (value: unknown): number | null => {
      if (typeof value === 'number' && Number.isFinite(value)) return value
      if (typeof value === 'string') {
        const parsed = Number.parseFloat(value)
        return Number.isFinite(parsed) ? parsed : null
      }
      return null
    }

    // Remove Romanian diacritics for search normalization
    // ă→a, â→a, î→i, ș→s, ț→t, Ă→A, Â→A, Î→I, Ș→S, Ț→T
    const removeDiacritics = (text: string): string => {
      return text
        .replace(/ă/g, 'a')
        .replace(/â/g, 'a')
        .replace(/î/g, 'i')
        .replace(/ș/g, 's')
        .replace(/ț/g, 't')
        .replace(/Ă/g, 'A')
        .replace(/Â/g, 'A')
        .replace(/Î/g, 'I')
        .replace(/Ș/g, 'S')
        .replace(/Ț/g, 'T')
        .toLowerCase()
    }

    // In this project relationships are consistently stored as a numeric ID
    // or as an object `{ id: number }`.
    const getNumericId = (value: unknown): number | null => {
      if (typeof value === 'number' && Number.isFinite(value)) return value
      if (
        value &&
        typeof value === 'object' &&
        'id' in value &&
        typeof (value as { id: unknown }).id === 'number'
      ) {
        const id = (value as { id: number }).id
        return Number.isFinite(id) ? id : null
      }
      return null
    }

    const getCityName = async (): Promise<string> => {
      try {
        const cityId = getNumericId(originalDoc?.city)
        if (!cityId) return ''

        const city = await payload.findByID({
          collection: 'cities',
          id: cityId,
          overrideAccess: true,
          depth: 0,
        })

        // City docs in this project use `title` for display.
        // Example:
        // {
        //   id: 4948,
        //   slug: 'restaurant-cu-salon-privat',
        //   title: 'Restaurant cu salon privat',
        //   ...
        // }
        return safeString((city as City)?.name)
      } catch (error) {
        console.error('[search.beforeSync] Error fetching city:', error)
        return ''
      }
    }

    const getTypeLabels = async (): Promise<string[]> => {
      try {
        const rawType = Array.isArray(originalDoc?.type) ? originalDoc.type : []
        if (!rawType.length) return []

        const typeIds = rawType
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => getNumericId(item))
          .filter((id: number | null): id is number => typeof id === 'number')

        if (!typeIds.length) return []

        // Listing types live in `listing-types` and have shape:
        // { id, slug, title, category, categorySlug, type, ... }
        const result = await payload.find({
          collection: 'listing-types',
          where: { id: { in: typeIds } },
          depth: 0,
          limit: 100,
          overrideAccess: true,
        })

        return (result?.docs ?? [])
          .map((d: ListingType) => safeString((d as ListingType)?.title))
          .filter(Boolean)
      } catch (error) {
        console.error('[search.beforeSync] Error fetching listing-types:', error)
        return []
      }
    }

    const getSuitableForLabels = async (): Promise<string[]> => {
      try {
        // Events don't have suitableFor field
        const listingCollectionName = searchDoc?.doc?.relationTo
        if (listingCollectionName === 'events') return []

        const rawSuitableFor = Array.isArray(originalDoc?.suitableFor)
          ? originalDoc.suitableFor
          : []
        if (!rawSuitableFor.length) return []

        const suitableForIds = rawSuitableFor
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => getNumericId(item))
          .filter((id: number | null): id is number => typeof id === 'number')

        if (!suitableForIds.length) return []

        const result = await payload.find({
          collection: 'listing-types',
          where: { id: { in: suitableForIds } },
          depth: 0,
          limit: 100,
          overrideAccess: true,
        })

        return (result?.docs ?? [])
          .map((d: ListingType) => safeString((d as ListingType)?.title))
          .filter(Boolean)
      } catch (error) {
        console.error('[search.beforeSync] Error fetching suitableFor listing-types:', error)
        return []
      }
    }

    const getMediaUrl = async (mediaValue: unknown): Promise<string> => {
      try {
        const mediaId = getNumericId(mediaValue)
        if (!mediaId) return ''

        const media = await payload.findByID({
          collection: 'media',
          id: mediaId,
          overrideAccess: true,
          depth: 0,
        })

        // Media docs look like:
        // {
        //   id: 2853,
        //   alt: 'Dj Performing At Wedding',
        //   url: 'http://.../dj-performing-at-wedding-23.jpg',
        //   filename: 'dj-performing-at-wedding-23.jpg',
        //   ...
        // }
        return safeString((media as Media)?.url) || safeString((media as Media)?.filename)
      } catch (error) {
        console.error('[search.beforeSync] Error fetching media:', error)
        return ''
      }
    }

    const getImageUrl = async (): Promise<string> => {
      // Prefer featuredImage, fallback to the first gallery image.
      const featured = await getMediaUrl(originalDoc?.featuredImage)
      if (featured) return featured

      const gallery = originalDoc?.gallery
      if (Array.isArray(gallery) && gallery.length > 0) {
        return await getMediaUrl(gallery[0])
      }

      return ''
    }

    const [cityName, typeLabels, suitableForLabels, imageUrl] = await Promise.all([
      getCityName(),
      getTypeLabels(),
      getSuitableForLabels(),
      getImageUrl(),
    ])

    // Create searchable text fields from the label arrays
    const typeText = typeLabels.join(' ')
    const suitableForText = suitableForLabels.join(' ')

    // Create a single normalized search field combining all searchable content
    // This field has diacritics removed for better Romanian language search
    const title = safeString(originalDoc?.title)
    const description = safeString(originalDoc?.description)
    const address = safeString(originalDoc?.address)

    const searchText = removeDiacritics(
      [title, description, address, cityName, typeText, suitableForText].filter(Boolean).join(' '),
    )

    return {
      ...searchDoc,
      // Keep the indexed payload minimal + UI-friendly
      title,
      description,
      address,
      cityName,
      type: typeLabels,
      typeText,
      suitableForText,
      searchText,
      imageUrl,
      listingCollectionName: searchDoc?.doc?.relationTo,
      slug: safeString(originalDoc?.slug),
      rating: safeNumber(originalDoc?.rating),
      views: safeNumber(originalDoc?.views),
      favoritesCount: safeNumber(originalDoc?.favoritesCount),
      tier: safeString(originalDoc?.tier),
    }
  },
}
