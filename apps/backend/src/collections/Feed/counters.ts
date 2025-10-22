// counters.ts - Redis-based hot path counters for views, favorites, and bookings

import Redis from 'ioredis'
import type { Payload } from 'payload'

// Lazy initialization - only connect when needed
let redisClient: Redis | null = null

function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })
  }
  return redisClient
}

/**
 * Generate Redis key for a metric counter
 * Format: feed:counters:{kind}:{listingId}:{metric}:{date}
 */
function counterKey(
  kind: 'locations' | 'events' | 'services',
  listingId: string,
  metric: 'views' | 'favorites' | 'bookings',
  date: string, // YYYY-MM-DD
): string {
  return `feed:counters:${kind}:${listingId}:${metric}:${date}`
}

/**
 * Increment a view counter for a listing
 * Sets 7-day expiry to auto-cleanup old counters
 */
export async function bumpView(
  kind: 'locations' | 'events' | 'services',
  listingId: string,
  ts: Date = new Date(),
): Promise<void> {
  const redis = getRedis()
  const date = ts.toISOString().slice(0, 10) // YYYY-MM-DD
  const key = counterKey(kind, listingId, 'views', date)

  await redis.incr(key)
  await redis.expire(key, 7 * 24 * 60 * 60) // 7 days TTL
}

/**
 * Increment a favorite counter for a listing
 */
export async function bumpFavorite(
  kind: 'locations' | 'events' | 'services',
  listingId: string,
  ts: Date = new Date(),
): Promise<void> {
  const redis = getRedis()
  const date = ts.toISOString().slice(0, 10)
  const key = counterKey(kind, listingId, 'favorites', date)

  await redis.incr(key)
  await redis.expire(key, 7 * 24 * 60 * 60)
}

/**
 * Increment a booking counter for a listing
 */
export async function bumpBooking(
  kind: 'locations' | 'events' | 'services',
  listingId: string,
  ts: Date = new Date(),
): Promise<void> {
  const redis = getRedis()
  const date = ts.toISOString().slice(0, 10)
  const key = counterKey(kind, listingId, 'bookings', date)

  await redis.incr(key)
  await redis.expire(key, 7 * 24 * 60 * 60)
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

    // Group by (kind, listingId, date) and sum metrics
    const aggregated = new Map<
      string,
      {
        kind: string
        listingId: string
        date: string
        views: number
        favorites: number
        bookings: number
      }
    >()

    for (const key of keys) {
      // Parse key: feed:counters:{kind}:{listingId}:{metric}:{date}
      const parts = key.split(':')
      if (parts.length !== 6) continue

      const [, , kind, listingId, metric, date] = parts
      const count = parseInt((await redis.get(key)) || '0', 10)

      const groupKey = `${kind}:${listingId}:${date}`
      if (!aggregated.has(groupKey)) {
        aggregated.set(groupKey, {
          kind,
          listingId,
          date,
          views: 0,
          favorites: 0,
          bookings: 0,
        })
      }

      const group = aggregated.get(groupKey)!
      if (metric === 'views') group.views += count
      else if (metric === 'favorites') group.favorites += count
      else if (metric === 'bookings') group.bookings += count
    }

    // Upsert into metrics_daily collection (Payload API way)
    for (const [, data] of aggregated) {
      // Check if record exists
      const existing = await payload.find({
        collection: 'metrics-daily',
        where: {
          and: [{ target: { equals: data.listingId } }, { date: { equals: new Date(data.date) } }],
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
            views: (current.views || 0) + data.views,
            favorites: (current.favorites || 0) + data.favorites,
            bookings: (current.bookings || 0) + data.bookings,
          },
        })
      } else {
        // Create new record
        await payload.create({
          collection: 'metrics-daily',
          data: {
            target: {
              relationTo: data.kind as 'locations' | 'events' | 'services',
              value: Number(data.listingId),
            },
            kind: data.kind as 'locations' | 'events' | 'services',
            date: data.date,
            views: data.views,
            favorites: data.favorites,
            bookings: data.bookings,
          },
        })
      }
    }

    // Delete flushed keys
    if (keys.length > 0) {
      await redis.del(...keys)
    }

    console.log(`[Feed] Flushed ${keys.length} counter keys to metrics_daily`)
  } catch (error) {
    console.error('[Feed] Error flushing counters:', error)
  }
}

/**
 * Close Redis connection (for graceful shutdown)
 */
export function closeRedis(): void {
  if (redisClient) {
    redisClient.disconnect()
    redisClient = null
  }
}
