import { tag } from '@unevent/shared'
import { queueHubSnapshotBuild, isHubSnapshotCandidate } from '@/utils/hubSnapshotScheduler'
import { revalidate } from '@/utils/revalidate'
import { purgeCDN } from '@/utils/purgeCDN'
import type { CollectionAfterChangeHook, Payload } from 'payload'

async function notifyNext(tags: string[], payload: Payload) {
  await revalidate({ tags, payload })
}

export const afterChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  req,
  previousDoc,
}) => {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenant = (req as any)?.tenant || 'unevent'
  const tags = new Set<string>([tag.tenant(tenant)])

  // Taxonomies (listing-types and facilities are taxonomy collections)
  if (collection.slug === 'listing-types' || collection.slug === 'facilities') {
    tags.add(tag.taxonomies())
  }

  // Listings - only revalidate if approved or was approved (to handle status changes)
  if (['events', 'services', 'locations'].includes(collection.slug)) {
    // Counter fields that don't require revalidation when changed
    const counterFields = ['favoritesCount', 'bookingsCount', 'reviewCount', 'views', 'rating']
    const timestampFields = ['updatedAt', 'lastViewedAt']

    // Check if only counter/timestamp fields changed (skip revalidation for these)
    if (previousDoc) {
      // Get all unique keys from both documents
      const allKeys = new Set([...Object.keys(doc || {}), ...Object.keys(previousDoc || {})])

      const changedFields = Array.from(allKeys).filter((key) => {
        const currentValue = doc?.[key]
        const previousValue = previousDoc?.[key]

        // Handle null/undefined equality
        if (currentValue === previousValue) return false

        // Handle objects/arrays (simple JSON comparison)
        if (
          currentValue != null &&
          previousValue != null &&
          typeof currentValue === 'object' &&
          typeof previousValue === 'object'
        ) {
          try {
            return JSON.stringify(currentValue) !== JSON.stringify(previousValue)
          } catch {
            // If JSON.stringify fails, fall back to simple comparison
            return currentValue !== previousValue
          }
        }

        return currentValue !== previousValue
      })

      // If only counter or timestamp fields changed, skip revalidation
      const onlyCountersOrTimestampsChanged =
        changedFields.length > 0 &&
        changedFields.every((key) => counterFields.includes(key) || timestampFields.includes(key))

      if (onlyCountersOrTimestampsChanged) {
        return
      }
    }

    const currentStatus = doc?.moderationStatus
    const previousStatus = previousDoc?.moderationStatus

    // Revalidate if:
    // 1. Currently approved (show changes)
    // 2. Was approved but now isn't (remove from cache)
    // 3. Just became approved (add to cache)
    const shouldRevalidate =
      currentStatus === 'approved' ||
      previousStatus === 'approved' ||
      currentStatus === 'draft' ||
      previousStatus === 'draft'

    if (shouldRevalidate) {
      const collectionType = collection.slug as 'events' | 'locations' | 'services'
      tags.add(tag.collection(collectionType))
      if (doc?.slug) {
        tags.add(tag.listingSlug(doc.slug))
      }
      // Handle city relationship (can be number or City object)
      const city = doc?.city
      if (city && typeof city === 'object' && 'slug' in city && city.slug) {
        tags.add(tag.city(city.slug))
      } else if (
        previousDoc?.city &&
        typeof previousDoc.city === 'object' &&
        'slug' in previousDoc.city &&
        previousDoc.city.slug
      ) {
        // Also invalidate old city if listing moved cities
        tags.add(tag.city(previousDoc.city.slug))
      }
      tags.add(tag.similar(collectionType))
      tags.add(tag.top(collectionType))
      tags.add(tag.featured(collectionType))
      tags.add(tag.home())

      const currentlyHubEligible = isHubSnapshotCandidate(doc)
      const previouslyHubEligible = isHubSnapshotCandidate(previousDoc)
      if (currentlyHubEligible || previouslyHubEligible || currentStatus === 'draft') {
        queueHubSnapshotBuild(req.payload, collectionType, 'listing-change')
      }
    }
  }

  // Cities
  if (
    collection.slug === 'cities' &&
    (doc?.name !== previousDoc?.name || doc?.county !== previousDoc?.county)
  ) {
    tags.add('cities:popular')
    tags.add('cities:typeahead')
    if (doc?.slug) {
      tags.add(tag.city(doc.slug))
    }
  }

  // Profiles - invalidate profile cache when profile is updated
  if (collection.slug === 'profiles') {
    // Counter fields that don't require revalidation
    const counterFields = ['views', 'rating', 'favorites']
    const timestampFields = ['updatedAt', 'lastOnline', 'memberSince']

    // Check if only counter/timestamp fields changed (skip revalidation for these)
    if (previousDoc) {
      const allKeys = new Set([...Object.keys(doc || {}), ...Object.keys(previousDoc || {})])

      const changedFields = Array.from(allKeys).filter((key) => {
        const currentValue = doc?.[key]
        const previousValue = previousDoc?.[key]

        if (currentValue === previousValue) return false

        if (
          currentValue != null &&
          previousValue != null &&
          typeof currentValue === 'object' &&
          typeof previousValue === 'object'
        ) {
          try {
            return JSON.stringify(currentValue) !== JSON.stringify(previousValue)
          } catch {
            return currentValue !== previousValue
          }
        }

        return currentValue !== previousValue
      })

      const onlyCountersOrTimestampsChanged =
        changedFields.length > 0 &&
        changedFields.every((key) => counterFields.includes(key) || timestampFields.includes(key))

      if (onlyCountersOrTimestampsChanged) {
        // Still add home tag for conservative refresh
        tags.add(tag.home())
        const list = Array.from(tags)
        await notifyNext(list, req.payload)
        await purgeCDN(list)
        return
      }
    }

    // Invalidate profile cache by slug
    if (doc?.slug) {
      tags.add(tag.profileSlug(doc.slug))
    }
    // Also invalidate old slug if it changed
    if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
      tags.add(tag.profileSlug(previousDoc.slug))
    }
  }

  // Home aggregates content; conservative refresh
  tags.add(tag.home())

  const list = Array.from(tags)

  // 1) Revalidate Next (Vercel edge/data cache)
  await notifyNext(list, req.payload)

  // 2) Optional: purge CDN (Cloudflare) by tag
  await purgeCDN(list)
}
