import { Queue } from 'bullmq'
import Redis from 'ioredis'

let redisClient: Redis | null = null
let notificationsQueue: Queue | null = null

/**
 * Get or create a Redis connection for BullMQ
 * Uses the same connection logic as the worker
 */
function getRedisForBullMQ(): Redis {
  if (redisClient) {
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
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })

    redisClient.on('error', (err: Error) => {
      console.error('[NotificationsQueue] Redis connection error:', err)
    })

    redisClient.on('connect', () => {
      console.log('[NotificationsQueue] Connected to Upstash Redis (TLS)')
    })

    return redisClient
  }

  // Fallback to host/password/port configuration
  const host = process.env.REDIS_HOST || 'localhost'
  const port = parseInt(process.env.REDIS_PORT || '6379', 10)
  const password = process.env.REDIS_PASSWORD || undefined
  const useTLS = process.env.REDIS_TLS === 'true' || port === 6380

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
      const delay = Math.min(times * 50, 2000)
      return delay
    },
  })

  redisClient.on('error', (err: Error) => {
    console.error('[NotificationsQueue] Redis connection error:', err)
  })

  redisClient.on('connect', () => {
    console.log(`[NotificationsQueue] Connected to ${host}:${port}${useTLS ? ' (TLS)' : ''}`)
  })

  return redisClient
}

/**
 * Get or create the notifications queue
 * This queue is consumed by the worker service
 */
function getNotificationsQueue(): Queue {
  if (notificationsQueue) {
    return notificationsQueue
  }

  notificationsQueue = new Queue('notifications', {
    connection: getRedisForBullMQ(),
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

  return notificationsQueue
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
    console.error(`[NotificationsQueue] ❌ Failed to enqueue ${type}:`, error)
    throw error
  }
}

/**
 * Close the notifications queue connection
 * Useful for cleanup in tests or graceful shutdown
 */
export async function closeNotificationsQueue(): Promise<void> {
  if (notificationsQueue) {
    await notificationsQueue.close()
    notificationsQueue = null
  }

  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }

  console.log('[NotificationsQueue] Queue and Redis connection closed')
}
