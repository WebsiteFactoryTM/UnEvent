import { ListingType, Service, Event, Location } from '@/payload-types'
import { Payload } from 'payload'

export function toIDs(
  value: (ListingType | string | number)[] | ListingType | string | number | undefined,
): string[] {
  // relationship arrays can be objects or ids (string/number)
  if (!value) return []
  const arr = Array.isArray(value) ? value : [value]
  return arr
    .map((v) => (typeof v === 'object' && v !== null ? String(v.id ?? v.slug ?? v) : String(v)))
    .filter(Boolean)
}

export function isPublic(doc: Location | Service | Event) {
  const approvedOK = doc?.status ? doc.status === 'approved' : true
  return approvedOK
}

/**
 * Apply deltas to usage counters on listing-types.
 * Positive delta increments; negative delta decrements.
 * We do read-modify-write; eventual consistency is OK.
 * For strict accuracy, also schedule a nightly recount job.
 */
export async function applyTypeUsageDeltas(
  payload: Payload,
  deltas: Record<string, { total: number; public: number }>,
) {
  const entries = Object.entries(deltas)
  for (const [typeId, delta] of entries) {
    try {
      const existing = await payload.findByID({ collection: 'listing-types', id: typeId, depth: 0 })
      const nextTotal = Math.max(0, (existing.usageCount ?? 0) + (delta.total ?? 0))
      const nextPublic = Math.max(0, (existing.usageCountPublic ?? 0) + (delta.public ?? 0))
      await payload.update({
        collection: 'listing-types',
        id: typeId,
        data: {
          usageCount: nextTotal,
          usageCountPublic: nextPublic,
          usageUpdatedAt: new Date().toISOString(),
        },
        depth: 0,
      })
    } catch (e) {
      // optional: log to Sentry
      console.error('applyTypeUsageDeltas error for', typeId, e)
    }
  }
}

/**
 * Computes the delta between previous and next docs for listingTypes,
 * taking into account visibility (public vs not public).
 */
export async function syncListingTypeUsage(
  payload: Payload,
  nextDoc: Location | Service | Event,
  prevDoc?: Location | Service | Event,
) {
  const prevIDs = new Set(toIDs(prevDoc?.type ?? []))
  const nextIDs = new Set(toIDs(nextDoc?.type ?? []))

  const wasPublic = prevDoc ? isPublic(prevDoc) : false
  const isNowPublic = isPublic(nextDoc)

  const deltas: Record<string, { total: number; public: number }> = {}

  function bump(id: string, t: number, p: number) {
    if (!deltas[id]) deltas[id] = { total: 0, public: 0 }
    deltas[id].total += t
    deltas[id].public += p
  }

  // Added types
  for (const id of nextIDs) {
    if (!prevIDs.has(id)) {
      bump(id, +1, isNowPublic ? +1 : 0)
    }
  }

  // Removed types
  for (const id of prevIDs) {
    if (!nextIDs.has(id)) {
      bump(id, -1, wasPublic ? -1 : 0)
    }
  }

  // Visibility changed (same types kept)
  if (wasPublic !== isNowPublic) {
    for (const id of nextIDs) {
      if (prevIDs.has(id)) {
        bump(id, 0, isNowPublic ? +1 : -1)
      }
    }
  }

  if (Object.keys(deltas).length) {
    await applyTypeUsageDeltas(payload, deltas)
  }
}
