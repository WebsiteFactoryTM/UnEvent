import type { PayloadHandler, PayloadRequest } from 'payload'
import { bumpView, bumpImpression } from '@/collections/Feed/counters'
import { getRedis } from '@/utils/redis'
import * as Sentry from '@sentry/nextjs'

/**
 * Verify that the request is authenticated with SVC_TOKEN (API-Key auth)
 * Payload custom endpoints don't automatically authenticate, so we manually verify the token
 */
function verifyServiceAuth(req: PayloadRequest): boolean {
  const svcToken = process.env.SVC_TOKEN
  if (!svcToken) {
    console.error('[Metrics] SVC_TOKEN not configured')
    return false
  }

  // Extract Authorization header
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return false
  }

  // Check for "users API-Key {token}" format (Payload API-Key auth format)
  const apiKeyMatch = authHeader.match(/^users\s+API-Key\s+(.+)$/i)
  if (!apiKeyMatch) {
    return false
  }

  const providedToken = apiKeyMatch[1]

  // Verify token matches SVC_TOKEN
  return providedToken === svcToken
}

/**
 * Rate limit and deduplicate views per user/IP/session per day
 * Uses a combination of:
 * 1. Authenticated user ID (if available)
 * 2. Session ID (from frontend localStorage/sessionStorage)
 * 3. IP address (from request headers)
 *
 * Returns true if the view should be recorded, false if it should be skipped
 */
async function shouldRecordView(
  listingId: string,
  kind: string,
  date: string,
  options: {
    userId?: string
    sessionId?: string
    ip?: string
  },
): Promise<boolean> {
  const redis = getRedis()

  // Build deduplication key using the best available identifier
  // Priority: userId > sessionId > IP
  let identifier: string
  if (options.userId) {
    identifier = `user:${options.userId}`
  } else if (options.sessionId) {
    identifier = `session:${options.sessionId}`
  } else if (options.ip && options.ip !== 'unknown') {
    // Hash IP to avoid storing raw IPs (privacy)
    // Simple hash for deduplication (not cryptographic)
    const ipHash = options.ip.split('.').slice(0, 3).join('.') + '.x' // Mask last octet
    identifier = `ip:${ipHash}`
  } else {
    // Fallback: use a generic identifier (less effective but still prevents spam)
    identifier = 'anonymous'
  }

  const dedupeKey = `metrics:view:${kind}:${listingId}:${date}:${identifier}`

  // Check if already recorded today (TTL: until end of day + buffer)
  const exists = await redis.get(dedupeKey)
  if (exists) {
    return false // Already recorded
  }

  // Set deduplication key with TTL until end of day (plus buffer)
  const now = new Date()
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const ttlSeconds = Math.floor((endOfDay.getTime() - now.getTime()) / 1000) + 3600 // +1 hour buffer
  await redis.set(dedupeKey, '1', 'EX', ttlSeconds)

  return true
}

export const recordView: PayloadHandler = async (req: PayloadRequest) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Require SVC_TOKEN authentication (API-Key auth)
    if (!verifyServiceAuth(req)) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = (await req.json?.()) ?? req.body

    if (!body?.listingId || !body?.kind) {
      return new Response('listingId and kind are required', { status: 400 })
    }

    if (!['locations', 'events', 'services'].includes(body.kind)) {
      return new Response('Invalid kind', { status: 400 })
    }

    // Rate limiting and deduplication: one view per user/session/IP per day
    const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

    // Extract user ID from authenticated request (if available)
    // Note: req.user will be the service user (SVC_TOKEN), not the actual end user
    // For end-user tracking, we rely on sessionId/IP from frontend
    const userId = body.userId || undefined // Could be passed from frontend if user is logged in

    const shouldRecord = await shouldRecordView(String(body.listingId), body.kind, date, {
      userId,
      sessionId: body.sessionId,
      ip: body.ip,
    })

    if (!shouldRecord) {
      // Already recorded today, return success but don't increment
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await bumpView(body.kind, String(body.listingId))

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[Metrics] Error recording view', error)

    // Report to Sentry
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', 'metrics-view')
        scope.setContext('request', {
          method: 'POST',
        })
        if (req.user) {
          scope.setUser({
            id: String(req.user.id),
            email: req.user.email,
          })
        }
        Sentry.captureException(error)
      })
    }

    return new Response('Internal server error', { status: 500 })
  }
}

export const recordImpression: PayloadHandler = async (req: PayloadRequest) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Require SVC_TOKEN authentication (API-Key auth)
    if (!verifyServiceAuth(req)) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = (await req.json?.()) ?? req.body

    if (!body?.listingId || !body?.kind) {
      return new Response('listingId and kind are required', { status: 400 })
    }

    if (!['locations', 'events', 'services'].includes(body.kind)) {
      return new Response('Invalid kind', { status: 400 })
    }

    // Impressions don't need deduplication per user (they're already deduplicated per page load in frontend)
    // But we can add basic rate limiting here if needed
    await bumpImpression(body.kind, String(body.listingId))

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[Metrics] Error recording impression', error)

    // Report to Sentry
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', 'metrics-impression')
        scope.setContext('request', {
          method: 'POST',
        })
        if (req.user) {
          scope.setUser({
            id: String(req.user.id),
            email: req.user.email,
          })
        }
        Sentry.captureException(error)
      })
    }

    return new Response('Internal server error', { status: 500 })
  }
}
