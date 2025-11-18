import { Redis as UpstashRedis } from "@upstash/redis";

let upstashClient: UpstashRedis | null = null;

// Compatibility wrapper to make Upstash Redis work like ioredis
function createRedisWrapper(client: UpstashRedis) {
  return {
    // Basic operations - work the same
    async get(key: string): Promise<string | null> {
      return await client.get(key);
    },

    async set(
      key: string,
      value: string,
      ...args: any[]
    ): Promise<string | null> {
      // Handle ioredis-style: set(key, value, 'EX', seconds)
      if (args.length > 0 && args[0] === "EX") {
        const seconds = args[1];
        // SET key value EX seconds
        return await client.set(key, value, { ex: seconds });
      }
      // Simple set without expiration
      return await client.set(key, value);
    },
  };
}

let redisClient: ReturnType<typeof createRedisWrapper> | null = null;

export function getRedis() {
  if (!redisClient) {
    const upstashUrl = process.env.NEXT_PRIVATE_UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.NEXT_PRIVATE_UPSTASH_REDIS_REST_TOKEN;

    if (!upstashUrl || !upstashToken) {
      throw new Error(
        "Upstash Redis credentials not found. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.",
      );
    }

    upstashClient = new UpstashRedis({
      url: upstashUrl,
      token: upstashToken,
    });

    redisClient = createRedisWrapper(upstashClient);
  }
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  // Upstash REST API client doesn't need explicit cleanup
  redisClient = null;
  upstashClient = null;
}
