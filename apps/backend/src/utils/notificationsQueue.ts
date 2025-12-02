import { Queue } from 'bullmq'
import Redis from 'ioredis'

let redisClient: Redis | null = null
let notificationsQueue: Queue | null = null
let isRedisAvailable = false
let connectionAttempts = 0
const MAX_CONNECTION_ATTEMPTS = 3

/**
 * Get or create a Redis connection for BullMQ
 * Uses the same connection logic as the worker
 * Returns null if Redis is unavailable after max attempts
 */
function getRedisForBullMQ(): Redis | null {
  // If we've exceeded max connection attempts, return null
  if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS && !isRedisAvailable) {
    return null
  }

  if (redisClient && isRedisAvailable) {
    return redisClient
  }

  const upstashUrl = process.env.UPSTASH_REDIS_URL

  if (upstashUrl) {
    // Parse Upstash TLS connection string: redis://default:password@host:port
    // or rediss://default:password@host:port (TLS)
    const url = new URL(upstashUrl)
    const password = url.password || decodeURIComponent(url.searchParams.get('password') || '')
    const host = url.hostname
    const port = parseInt(url.port || '6380', 10)
    const isTLS = url.protocol === 'rediss:' || (url.protocol === 'redis:' && port === 6380)

    connectionAttempts++

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
        // Limit retries to prevent infinite loops
        if (times > MAX_CONNECTION_ATTEMPTS) {
          console.error(
            `[NotificationsQueue] Max Redis connection attempts (${MAX_CONNECTION_ATTEMPTS}) exceeded. Notifications will be disabled.`,
          )
          isRedisAvailable = false
          return null // Stop retrying
        }
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      connectTimeout: 5000, // 5 second timeout
      lazyConnect: false, // Connect immediately
    })

    redisClient.on('error', (err: Error) => {
      isRedisAvailable = false
      if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
        console.error(
          `[NotificationsQueue] Redis connection error (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}):`,
          err,
        )
      } else {
        console.error(
          `[NotificationsQueue] Redis unavailable after ${MAX_CONNECTION_ATTEMPTS} attempts. Notifications disabled. Check UPSTASH_REDIS_URL environment variable.`,
        )
      }
    })

    redisClient.on('connect', () => {
      isRedisAvailable = true
      connectionAttempts = 0 // Reset on successful connection
      console.log('[NotificationsQueue] ✅ Connected to Upstash Redis (TLS)')
    })

    redisClient.on('ready', () => {
      isRedisAvailable = true
      connectionAttempts = 0
      console.log('[NotificationsQueue] ✅ Redis ready')
    })

    redisClient.on('close', () => {
      isRedisAvailable = false
      console.warn('[NotificationsQueue] ⚠️ Redis connection closed')
    })

    return redisClient
  }

  // Fallback to host/password/port configuration
  const host = process.env.REDIS_HOST || 'localhost'
  const port = parseInt(process.env.REDIS_PORT || '6379', 10)
  const password = process.env.REDIS_PASSWORD || undefined
  const useTLS = process.env.REDIS_TLS === 'true' || port === 6380

  connectionAttempts++

  redisClient = new Redis({
    host,
    port,
    password,
    tls: useTLS
      ? {
          rejectUnauthorized: true,
        }
      : undefined,
    maxRetriesPerRequest: null, // Required by BullMQ
    retryStrategy: (times: number) => {
      // Limit retries to prevent infinite loops
      if (times > MAX_CONNECTION_ATTEMPTS) {
        console.error(
          `[NotificationsQueue] Max Redis connection attempts (${MAX_CONNECTION_ATTEMPTS}) exceeded. Notifications will be disabled.`,
        )
        isRedisAvailable = false
        return null // Stop retrying
      }
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    connectTimeout: 5000, // 5 second timeout
    lazyConnect: false,
  })

  redisClient.on('error', (err: Error) => {
    isRedisAvailable = false
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      console.error(
        `[NotificationsQueue] Redis connection error (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}):`,
        err,
      )
    } else {
      console.error(
        `[NotificationsQueue] Redis unavailable after ${MAX_CONNECTION_ATTEMPTS} attempts. Notifications disabled. Check REDIS_HOST/REDIS_PASSWORD environment variables.`,
      )
    }
  })

  redisClient.on('connect', () => {
    isRedisAvailable = true
    connectionAttempts = 0
    console.log(`[NotificationsQueue] ✅ Connected to ${host}:${port}${useTLS ? ' (TLS)' : ''}`)
  })

  redisClient.on('ready', () => {
    isRedisAvailable = true
    connectionAttempts = 0
    console.log('[NotificationsQueue] ✅ Redis ready')
  })

  redisClient.on('close', () => {
    isRedisAvailable = false
    console.warn('[NotificationsQueue] ⚠️ Redis connection closed')
  })

  return redisClient
}

/**
 * Get or create the notifications queue
 * This queue is consumed by the worker service
 * Returns null if Redis is unavailable
 */
function getNotificationsQueue(): Queue | null {
  // Check if Redis is available before creating/returning queue
  const redis = getRedisForBullMQ()
  if (!redis || !isRedisAvailable) {
    return null
  }

  if (notificationsQueue) {
    return notificationsQueue
  }

  try {
    notificationsQueue = new Queue('notifications', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000, // Keep max 1000 completed jobs
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    })

    notificationsQueue.on('error', (err) => {
      console.error('[NotificationsQueue] Queue error:', err)
      isRedisAvailable = false
    })

    return notificationsQueue
  } catch (error) {
    console.error('[NotificationsQueue] Failed to create queue:', error)
    isRedisAvailable = false
    return null
  }
}

/**
 * Email event types that can be enqueued
 * These must match the types registered in the worker's EMAIL_TEMPLATES
 */
export type EmailEventType =
  // User-facing
  | 'user.welcome'
  | 'user.reset.start'
  | 'user.reset.confirmed'
  | 'message.new'
  | 'listing.approved'
  | 'listing.rejected'
  | 'listing.finished'
  | 'listing.recommended'
  | 'listing.search-stats'
  | 'listing.view-stats'
  | 'account.verified'
  | 'account.verification-rejected'
  | 'account.deleted'
  | 'listing.favorited'
  | 'review.new'
  | 'review.approved'
  | 'review.rejected'
  | 'event.reminder.24h'
  | 'event.participation.reminder'
  | 'event.participation.confirmed'
  // Admin
  | 'admin.listing.pending'
  | 'admin.review.pending'
  | 'admin.user.new'
  | 'admin.report.new'
  | 'admin.password.changed'
  | 'admin.verification.request'
  | 'admin.digest.daily'

/**
 * Enqueue an email notification job to the worker
 *
 * @param type - Email event type (must be registered in worker's EMAIL_TEMPLATES)
 * @param payload - Payload data for the email template
 * @param options - Optional job options (jobId, delay, etc.)
 *
 * @example
 * ```ts
 * await enqueueNotification('user.welcome', {
 *   first_name: 'John',
 *   email: 'john@example.com',
 *   confirm_url: 'https://unevent.com/confirm?token=...',
 * })
 * ```
 */
export async function enqueueNotification(
  type: EmailEventType,
  payload: Record<string, unknown>,
  options?: {
    jobId?: string
    delay?: number // Delay in milliseconds
    priority?: number
  },
): Promise<{ id: string | undefined }> {
  const queue = getNotificationsQueue()

  // If queue is unavailable (Redis connection failed), fail gracefully
  if (!queue) {
    console.warn(
      `[NotificationsQueue] ⚠️ Skipping ${type} - Redis unavailable. Check UPSTASH_REDIS_URL or REDIS_HOST environment variables.`,
    )
    // Return success to prevent blocking the main operation
    // The notification is lost, but the user operation continues
    return { id: undefined }
  }

  try {
    const job = await queue.add(
      type,
      {
        type,
        payload,
      },
      {
        jobId: options?.jobId,
        delay: options?.delay,
        priority: options?.priority,
      },
    )

    console.log(`[NotificationsQueue] ✅ Enqueued ${type} job: ${job.id}`)

    return { id: job.id }
  } catch (error) {
    // Log error but don't throw - allow the main operation to continue
    console.error(
      `[NotificationsQueue] ❌ Failed to enqueue ${type}:`,
      error instanceof Error ? error.message : error,
    )
    // Return success to prevent blocking the main operation
    return { id: undefined }
  }
}

/**
 * Close the notifications queue connection
 * Useful for cleanup in tests or graceful shutdown
 */
export async function closeNotificationsQueue(): Promise<void> {
  if (notificationsQueue) {
    try {
      await notificationsQueue.close()
    } catch (error) {
      console.error('[NotificationsQueue] Error closing queue:', error)
    }
    notificationsQueue = null
  }

  if (redisClient) {
    try {
      await redisClient.quit()
    } catch (error) {
      console.error('[NotificationsQueue] Error closing Redis connection:', error)
    }
    redisClient = null
  }

  isRedisAvailable = false
  connectionAttempts = 0

  console.log('[NotificationsQueue] Queue and Redis connection closed')
}

/**
 * Check if Redis is currently available
 * Useful for health checks or conditional logic
 */
export function isNotificationsQueueAvailable(): boolean {
  return isRedisAvailable && notificationsQueue !== null
}
