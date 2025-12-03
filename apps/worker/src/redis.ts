import Redis from "ioredis";

let redisClient: Redis | null = null;

/**
 * Get or create a Redis connection for BullMQ
 * Supports UPSTASH_REDIS_URL (TLS connection string) or REDIS_HOST/REDIS_PASSWORD/REDIS_PORT
 */
export function getRedisConnection(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const upstashUrl = process.env.UPSTASH_REDIS_URL;

  if (upstashUrl) {
    // Parse Upstash TLS connection string: redis://default:password@host:port
    // or rediss://default:password@host:port (TLS)
    const url = new URL(upstashUrl);
    const password =
      url.password ||
      decodeURIComponent(url.searchParams.get("password") || "");
    const host = url.hostname;
    const port = parseInt(url.port || "6380", 10);
    const isTLS =
      url.protocol === "rediss:" ||
      (url.protocol === "redis:" && port === 6380);

    redisClient = new Redis({
      host,
      port,
      password,
      tls: isTLS
        ? {
            rejectUnauthorized: true,
          }
        : undefined,
      maxRetriesPerRequest: null, // Required by BullMQ for blocking operations
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on("error", (err: Error) => {
      console.error("[Redis] Connection error:", err);
    });

    redisClient.on("connect", () => {
      console.log("[Redis] ✅ Connected to Upstash Redis (TLS)");
    });

    redisClient.on("ready", () => {
      console.log("[Redis] ✅ Redis ready for commands");
    });

    redisClient.on("close", () => {
      console.warn("[Redis] ⚠️ Redis connection closed");
    });

    redisClient.on("reconnecting", (delay: number) => {
      console.warn(`[Redis] ⚠️ Redis reconnecting in ${delay}ms...`);
    });

    redisClient.on("end", () => {
      console.warn("[Redis] ⚠️ Redis connection ended");
    });

    return redisClient;
  }

  // Fallback to host/password/port configuration
  const host = process.env.REDIS_HOST || "localhost";
  const port = parseInt(process.env.REDIS_PORT || "6379", 10);
  const password = process.env.REDIS_PASSWORD || undefined;
  const useTLS = process.env.REDIS_TLS === "true" || port === 6380;

  redisClient = new Redis({
    host,
    port,
    password,
    tls: useTLS
      ? {
          rejectUnauthorized: true,
        }
      : undefined,
    maxRetriesPerRequest: null, // Required by BullMQ for blocking operations
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redisClient.on("error", (err: Error) => {
    console.error("[Redis] Connection error:", err);
  });

  redisClient.on("connect", () => {
    console.log(
      `[Redis] ✅ Connected to ${host}:${port}${useTLS ? " (TLS)" : ""}`,
    );
  });

  redisClient.on("ready", () => {
    console.log("[Redis] ✅ Redis ready for commands");
  });

  redisClient.on("close", () => {
    console.warn("[Redis] ⚠️ Redis connection closed");
  });

  redisClient.on("reconnecting", (delay: number) => {
    console.warn(`[Redis] ⚠️ Redis reconnecting in ${delay}ms...`);
  });

  redisClient.on("end", () => {
    console.warn("[Redis] ⚠️ Redis connection ended");
  });

  return redisClient;
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log("[Redis] Connection closed");
  }
}
