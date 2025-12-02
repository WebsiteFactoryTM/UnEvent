import type { Payload } from 'payload'
import cron from 'node-cron'
import { getSchedulerIntervalHours, hoursToCron } from '../utils/schedulerConfig'
import * as Sentry from '@sentry/nextjs'

async function cleanupTempMedia(payload: Payload) {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  try {
    const res = await payload.find({
      collection: 'media',
      where: {
        and: [{ temp: { equals: true } }, { createdAt: { less_than: cutoff } }],
      },
      limit: 200,
      depth: 0,
    })
    if (res.totalDocs === 0) return

    await Promise.all(
      res.docs.map(async (doc: any) => {
        try {
          await payload.delete({ collection: 'media', id: doc.id })
        } catch (e) {
          console.error('[CleanupTempMedia] Failed to delete media', doc.id, e)
          if (e instanceof Error) {
            Sentry.withScope((scope) => {
              scope.setTag('scheduler', 'cleanupTempMedia')
              scope.setTag('operation', 'delete')
              scope.setContext('media', {
                id: doc.id,
              })
              Sentry.captureException(e)
            })
          }
        }
      }),
    )
    // If there are more, schedule next run will catch them
  } catch (e) {
    console.error('[CleanupTempMedia] Query error', e)
    if (e instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('scheduler', 'cleanupTempMedia')
        scope.setTag('operation', 'query')
        Sentry.captureException(e)
      })
    }
  }
}

export const registerCleanupTempMediaScheduler = (payload: Payload) => {
  // Runs hourly (1 hour) by default
  // Configurable via SCHEDULER_CLEANUP_MEDIA_INTERVAL_HOURS
  // In production: 1 hour
  // In staging: 3 hours (3x slower)
  // In dev: 6 hours (6x slower)
  const intervalHours = getSchedulerIntervalHours('cleanup_media', 1, {
    envVarName: 'SCHEDULER_CLEANUP_MEDIA_INTERVAL_HOURS',
  })

  // Always run at minute 13 to stagger from other jobs
  const cronExpression = hoursToCron(intervalHours, 13)
  console.log(`[CleanupTempMedia] cron registered: ${cronExpression} (${intervalHours}h interval)`)
  cron.schedule(cronExpression, () => cleanupTempMedia(payload))
}
