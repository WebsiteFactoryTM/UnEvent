import { Redis as UpstashRedis } from '@upstash/redis'

let upstashClient: UpstashRedis | null = null

// Compatibility wrapper to make Upstash Redis work like ioredis
// Optimizations implemented:
// - mget(): Batch GET operations (reduces N commands to 1)
// - eval(): Lua scripts for atomic operations (e.g., INCR + EXPIRE)
// - set() with NX: Atomic check-and-set operations
function createRedisWrapper(client: UpstashRedis) {
  return {
    // Basic operations - work the same
    async get(key: string): Promise<string | null> {
      return await client.get(key)
    },

    async set(key: string, value: string, ...args: unknown[]): Promise<string | null> {
      // Handle ioredis-style: set(key, value, 'EX', seconds, 'NX')
      // or: set(key, value, 'EX', seconds)
      if (args.length > 0 && args[0] === 'EX') {
        const seconds = args[1] as number
        const hasNX = args.length > 2 && args[2] === 'NX'

        if (hasNX) {
          // SET key value EX seconds NX
          return await client.set(key, value, { ex: seconds, nx: true })
        } else {
          // SET key value EX seconds
          return await client.set(key, value, { ex: seconds })
        }
      }
      // Simple set without expiration
      return await client.set(key, value)
    },

    async incr(key: string): Promise<number> {
      return await client.incr(key)
    },

    async del(...keys: string[]): Promise<number> {
      return await client.del(...keys)
    },

    async expire(key: string, seconds: number): Promise<number> {
      return await client.expire(key, seconds)
    },

    async scan(cursor: string | number, ...args: unknown[]): Promise<[string, string[]]> {
      // Handle ioredis-style: scan(cursor, 'MATCH', pattern, 'COUNT', count)
      if (args.length >= 2 && args[0] === 'MATCH') {
        const pattern = args[1] as string
        const count = args.length >= 4 && args[2] === 'COUNT' ? (args[3] as number) : 100

        // Upstash scan returns tuple [cursor, keys] directly
        const [newCursor, keys] = await client.scan(Number(cursor), {
          match: pattern,
          count: count,
        })
        // Convert to [cursor, keys] format (already in correct format)
        return [String(newCursor), keys]
      }
      // Simple scan without pattern
      const [newCursor, keys] = await client.scan(Number(cursor))
      return [String(newCursor), keys]
    },

    async mget(...keys: string[]): Promise<(string | null)[]> {
      return await client.mget(...keys)
    },

    async eval(script: string, keys: string[], args: (string | number)[]): Promise<unknown> {
      return await client.eval(script, keys, args)
    },
  }
}

let redisClient: ReturnType<typeof createRedisWrapper> | null = null

export function getRedis() {
  if (!redisClient) {
    const upstashUrl = process.env.PAYLOAD_PRIVATE_UPSTASH_REDIS_REST_URL
    const upstashToken = process.env.PAYLOAD_PRIVATE_UPSTASH_REDIS_REST_TOKEN

    if (!upstashUrl || !upstashToken) {
      throw new Error(
        'Upstash Redis credentials not found. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.',
      )
    }

    upstashClient = new UpstashRedis({
      url: upstashUrl,
      token: upstashToken,
    })

    redisClient = createRedisWrapper(upstashClient)
  }
  return redisClient
}

export async function closeRedis(): Promise<void> {
  // Upstash REST API client doesn't need explicit cleanup
  redisClient = null
  upstashClient = null
}
