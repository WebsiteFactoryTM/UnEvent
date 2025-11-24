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
    const currentStatus = doc?.moderationStatus
    const previousStatus = previousDoc?.moderationStatus

    // Revalidate if:
    // 1. Currently approved (show changes)
    // 2. Was approved but now isn't (remove from cache)
    // 3. Just became approved (add to cache)
    const shouldRevalidate = currentStatus === 'approved' || previousStatus === 'approved'

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
      if (currentlyHubEligible || previouslyHubEligible) {
        queueHubSnapshotBuild(req.payload, collectionType, 'listing-change')
      }
    }
  }

  // Cities
  if (collection.slug === 'cities') {
    tags.add('cities:popular')
    tags.add('cities:typeahead')
    if (doc?.slug) {
      tags.add(tag.city(doc.slug))
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
