import { Payload } from 'payload'

// Helper: count approved docs for a where-clause (limit:1 still returns totalDocs)
async function countApproved(
  payload: Payload,
  collection: 'locations' | 'services' | 'events',
  where: any,
): Promise<number> {
  const res = await payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
  })
  // Payload returns totalDocs on find(); fallback to docs.length if not present
  return (res as any).totalDocs ?? res.docs.length ?? 0
}

// Build dynamic popular search combos from topCities × topTypes
export async function buildPopularSearchCombos(
  payload: Payload,
  collection: 'locations' | 'services' | 'events',
  topCities: Array<{ slug: string; label: string }>,
  topTypes: Array<{ slug: string; label: string }>,
  opts?: { minListings?: number; perCity?: number; maxOverall?: number },
) {
  const minListings = opts?.minListings ?? 3
  const perCity = opts?.perCity ?? 3 // show up to 2 combos per city
  const maxOverall = opts?.maxOverall ?? 18 // total cap

  const combos: Array<{
    citySlug: string
    cityLabel: string
    typeSlug: string
    typeLabel: string
    count: number
  }> = []

  for (const city of topCities) {
    // Count for each type, in parallel
    const counts = await Promise.all(
      topTypes.map(async (t) => {
        // NOTE: adjust field paths to your schema:
        // - If City is a relation with a slug field, 'city.slug' is correct.
        // - If Type is a relation array, filter via 'type.slug' equals.
        // If your schema differs, switch to filtering by IDs: 'city' in [id], 'type' in [id].
        const where = {
          AND: [
            { moderationStatus: { equals: 'approved' } },
            { 'city.slug': { equals: city.slug } },
            { 'type.slug': { equals: t.slug } },
          ],
        }

        const count = await countApproved(payload, collection, where)
        return { typeSlug: t.slug, typeLabel: t.label, count }
      }),
    )

    // Sort types by count desc and keep top N with at least minListings
    counts
      .filter((x) => x.count >= minListings)
      .sort((a, b) => b.count - a.count)
      .slice(0, perCity)
      .forEach((x) => {
        combos.push({
          citySlug: city.slug,
          cityLabel: city.label,
          typeSlug: x.typeSlug,
          typeLabel: x.typeLabel,
          count: x.count,
        })
      })

    if (combos.length >= maxOverall) break
  }

  // Drop counts from final payload
  return combos.slice(0, maxOverall).map(({ count: _drop, ...rest }) => rest)
}
