// counters.ts - Redis-based hot path counters for views, favorites, and bookings

import { getRedis } from '@/utils/redis'
import type { Payload } from 'payload'

/**
 * Generate Redis key for a metric counter
 * Format: feed:counters:{kind}:{listingId}:{metric}:{date}
 */
function counterKey(
  kind: 'locations' | 'events' | 'services',
  listingId: string,
  metric: 'impressions' | 'views' | 'favorites' | 'bookings',
  date: string, // YYYY-MM-DD
): string {
  return `feed:counters:${kind}:${listingId}:${metric}:${date}`
}

/**
 * Lua script to atomically increment a counter and set expiration (only on first increment)
 * This reduces 2 Redis commands (INCR + EXPIRE) to 1 atomic operation
 */
const INCR_WITH_EXPIRE_SCRIPT = `
local key = KEYS[1]
local expiration = tonumber(ARGV[1])
local current = redis.call('INCR', key)
if current == 1 then
  redis.call('EXPIRE', key, expiration)
end
return current
`

/**
 * Atomically increment a counter and set expiration (only on first increment)
 * Uses a Lua script to combine INCR + EXPIRE into a single atomic operation
 */
async function incrWithExpire(key: string, expirationSeconds: number): Promise<number> {
  const redis = getRedis()
  const result = await redis.eval(INCR_WITH_EXPIRE_SCRIPT, [key], [expirationSeconds])
  return Number(result)
}

/**
 * Increment a view counter for a listing
 * Sets 7-day expiry to auto-cleanup old counters
 * Uses atomic Lua script to combine INCR + EXPIRE into single operation
 */
export async function bumpView(
  kind: 'locations' | 'events' | 'services',
  listingId: string,
  ts: Date = new Date(),
): Promise<void> {
  const date = ts.toISOString().slice(0, 10) // YYYY-MM-DD
  const key = counterKey(kind, listingId, 'views', date)

  await incrWithExpire(key, 7 * 24 * 60 * 60) // 7 days TTL
}

/**
 * Increment a favorite counter for a listing
 * Uses atomic Lua script to combine INCR + EXPIRE into single operation
 */
export async function bumpFavorite(
  kind: 'locations' | 'events' | 'services',
  listingId: string,
  ts: Date = new Date(),
): Promise<void> {
  const date = ts.toISOString().slice(0, 10)
  const key = counterKey(kind, listingId, 'favorites', date)

  await incrWithExpire(key, 7 * 24 * 60 * 60)
}

/**
 * Increment a booking counter for a listing
 * Uses atomic Lua script to combine INCR + EXPIRE into single operation
 */
export async function bumpBooking(
  kind: 'locations' | 'events' | 'services',
  listingId: string,
  ts: Date = new Date(),
): Promise<void> {
  const date = ts.toISOString().slice(0, 10)
  const key = counterKey(kind, listingId, 'bookings', date)

  await incrWithExpire(key, 7 * 24 * 60 * 60)
}

/**
 * Increment an impression counter for a listing
 * Sets 7-day expiry to auto-cleanup old counters
 * Uses atomic Lua script to combine INCR + EXPIRE into single operation
 */
export async function bumpImpression(
  kind: 'locations' | 'events' | 'services',
  listingId: string,
  ts: Date = new Date(),
): Promise<void> {
  const date = ts.toISOString().slice(0, 10) // YYYY-MM-DD
  const key = counterKey(kind, listingId, 'impressions', date)

  await incrWithExpire(key, 7 * 24 * 60 * 60) // 7 days TTL
}

/**
 * Flush all Redis counters to the metrics_daily collection
 * This should run periodically (e.g., every 1-5 minutes)
 */
export async function flushCountersToDaily(payload: Payload): Promise<void> {
  const redis = getRedis()

  try {
    // Scan for all counter keys
    const pattern = 'feed:counters:*'
    const keys: string[] = []

    let cursor = '0'
    do {
      const [nextCursor, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
      cursor = nextCursor
      keys.push(...batch)
    } while (cursor !== '0')

    if (keys.length === 0) return

    // Batch fetch all counter values in a single MGET operation
    // This reduces N GET commands to 1 MGET command
    // Optimization: Using MGET instead of individual GET calls
    const values = await redis.mget(...keys)

    // Group by (kind, listingId, date) and sum metrics
    const aggregated = new Map<
      string,
      {
        kind: string
        listingId: string
        date: string
        impressions: number
        views: number
        favorites: number
        bookings: number
      }
    >()

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      // Parse key: feed:counters:{kind}:{listingId}:{metric}:{date}
      const parts = key.split(':')
      if (parts.length !== 6) continue

      const [, , kind, listingId, metric, date] = parts
      const count = parseInt((values[i] || '0') as string, 10)

      const groupKey = `${kind}:${listingId}:${date}`
      if (!aggregated.has(groupKey)) {
        aggregated.set(groupKey, {
          kind,
          listingId,
          date,
          impressions: 0,
          views: 0,
          favorites: 0,
          bookings: 0,
        })
      }

      const group = aggregated.get(groupKey)!
      if (metric === 'impressions') group.impressions += count
      else if (metric === 'views') group.views += count
      else if (metric === 'favorites') group.favorites += count
      else if (metric === 'bookings') group.bookings += count
    }

    // Upsert into metrics_daily collection (Payload API way)
    for (const [, data] of aggregated) {
      // Check if record exists - match by relationship field + date
      const existing = await payload.find({
        collection: 'metrics-daily',
        where: {
          and: [
            { 'target.value': { equals: Number(data.listingId) } },
            { 'target.relationTo': { equals: data.kind } },
            { date: { equals: data.date } },
          ],
        },
        limit: 1,
        depth: 0,
      })

      if (existing.docs.length > 0) {
        // Update existing record (increment counters)
        const current = existing.docs[0]
        await payload.update({
          collection: 'metrics-daily',
          id: current.id,
          data: {
            impressions: (current.impressions || 0) + data.impressions,
            views: (current.views || 0) + data.views,
            favorites: (current.favorites || 0) + data.favorites,
            bookings: (current.bookings || 0) + data.bookings,
          },
        })
      } else {
        // Validate that target listing exists before creating metrics_daily record
        // This prevents foreign key constraint violations for hard-deleted listings
        try {
          await payload.findByID({
            collection: data.kind as 'locations' | 'events' | 'services',
            id: Number(data.listingId),
            depth: 0,
          })

          // Create new record only if listing exists
          await payload.create({
            collection: 'metrics-daily',
            data: {
              target: {
                relationTo: data.kind as 'locations' | 'events' | 'services',
                value: Number(data.listingId),
              },
              kind: data.kind as 'locations' | 'events' | 'services',
              date: data.date,
              impressions: data.impressions,
              views: data.views,
              favorites: data.favorites,
              bookings: data.bookings,
            },
          })
        } catch (_error) {
          // Listing doesn't exist (hard-deleted or invalid ID), skip creating metrics
          console.warn(
            `[Feed] Skipping metrics_daily creation for non-existent ${data.kind} ID ${data.listingId} (date: ${data.date})`,
          )
          // Continue processing other counters
        }
      }
    }

    // Delete flushed keys
    if (keys.length > 0) {
      await redis.del(...keys)
    }

    console.log(
      `[Feed] Flushed ${keys.length} counter keys to metrics_daily (optimized: used MGET instead of ${keys.length} individual GET calls)`,
    )
  } catch (error) {
    console.error('[Feed] Error flushing counters:', error)
  }
}
