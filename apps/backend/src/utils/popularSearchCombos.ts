import { PaginatedDocs, Payload, Where } from 'payload'

import { Location, Service, Event } from '@/payload-types'
// Helper: count approved docs for a where-clause (limit:1 still returns totalDocs)
async function countApproved(
  payload: Payload,
  collection: 'locations' | 'services' | 'events',
  where: Where,
): Promise<number> {
  const res = await payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
  })
  // Payload returns totalDocs on find(); fallback to docs.length if not present

  return (res as PaginatedDocs<Location | Service | Event>).totalDocs ?? res.docs.length ?? 0
}

// Build dynamic popular search combos from topCities × topCategories
export async function buildPopularSearchCombos(
  payload: Payload,
  collection: 'locations' | 'services' | 'events',
  topCities: Array<{ slug: string; label: string }>,
  topCategories: Array<{ slug: string; label: string }>,
  opts?: { minListings?: number; perCity?: number; maxOverall?: number },
) {
  const minListings = opts?.minListings ?? 3
  const perCity = opts?.perCity ?? 3 // show up to 3 combos per city
  const maxOverall = opts?.maxOverall ?? 18 // total cap

  const combos: Array<{
    citySlug: string
    cityLabel: string
    typeSlug: string // Field name kept for backwards compatibility (contains category slug)
    typeLabel: string // Field name kept for backwards compatibility (contains category label)
    count: number
  }> = []

  for (const city of topCities) {
    // Count for each category, in parallel
    const counts = await Promise.all(
      topCategories.map(async (category) => {
        // Filter by category slug - matches all types in that category
        // This aligns with the feed endpoint's typeCategory filtering logic
        const where: Where = {
          AND: [
            { moderationStatus: { equals: 'approved' } },
            { 'city.slug': { equals: city.slug } },
            { 'type.categorySlug': { equals: category.slug } },
          ],
          ...(collection === 'events'
            ? {
                eventStatus: { not_equals: 'finished' },
                endDate: { greater_than_equal: new Date().toISOString() },
              }
            : {}),
        }

        const count = await countApproved(payload, collection, where)
        // Return with field names kept for backwards compatibility
        return { typeSlug: category.slug, typeLabel: category.label, count }
      }),
    )

    // Sort categories by count desc and keep top N with at least minListings
    counts
      .filter((categoryCount) => categoryCount.count >= minListings)
      .sort((a, b) => b.count - a.count)
      .slice(0, perCity)
      .forEach((categoryCount) => {
        combos.push({
          citySlug: city.slug,
          cityLabel: city.label,
          typeSlug: categoryCount.typeSlug, // Contains category slug
          typeLabel: categoryCount.typeLabel, // Contains category label
          count: categoryCount.count,
        })
      })

    if (combos.length >= maxOverall) break
  }

  // Drop counts from final payload
  return combos.slice(0, maxOverall).map(({ count: _drop, ...rest }) => rest)
}
