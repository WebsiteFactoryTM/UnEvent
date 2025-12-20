import type { Payload } from 'payload'
import cron from 'node-cron'
import { getSchedulerIntervalHours, hoursToCron } from '../utils/schedulerConfig'
import * as Sentry from '@sentry/nextjs'

async function cleanupDeletedListings(payload: Payload) {
  // Calculate cutoff date: 6 months ago
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
  const cutoffISO = twoYearsAgo.toISOString()

  const collections: Array<'locations' | 'events' | 'services'> = [
    'locations',
    'events',
    'services',
  ]

  for (const collection of collections) {
    try {
      // Find listings that were soft-deleted more than 6 months ago
      const res = await payload.find({
        collection,
        where: {
          and: [{ deletedAt: { exists: true } }, { deletedAt: { less_than: cutoffISO } }],
        },
        limit: 100, // Process in batches
        depth: 0,
      })

      if (res.totalDocs === 0) {
        continue
      }

      console.log(
        `[CleanupDeletedListings] Found ${res.totalDocs} ${collection} to hard delete (deleted before ${cutoffISO})`,
      )

      // Hard delete each listing
      // Note: beforeDelete hook will allow deletion since deletedAt > 6 months ago
      await Promise.all(
        res.docs.map(async (doc: any) => {
          try {
            await payload.delete({
              collection,
              id: doc.id,
              depth: 0,
            })
            console.log(`[CleanupDeletedListings] Hard deleted ${collection} ${doc.id}`)
          } catch (e) {
            console.error(`[CleanupDeletedListings] Failed to delete ${collection}`, doc.id, e)
            if (e instanceof Error) {
              Sentry.withScope((scope) => {
                scope.setTag('scheduler', 'cleanupDeletedListings')
                scope.setTag('operation', 'delete')
                scope.setTag('collection', collection)
                scope.setContext('listing', {
                  id: doc.id,
                  deletedAt: doc.deletedAt,
                })
                Sentry.captureException(e)
              })
            }
          }
        }),
      )

      // If there are more, next run will catch them
    } catch (e) {
      console.error(`[CleanupDeletedListings] Query error for ${collection}`, e)
      if (e instanceof Error) {
        Sentry.withScope((scope) => {
          scope.setTag('scheduler', 'cleanupDeletedListings')
          scope.setTag('operation', 'query')
          scope.setTag('collection', collection)
          Sentry.captureException(e)
        })
      }
    }
  }
}

export const registerCleanupDeletedListingsScheduler = (payload: Payload) => {
  // Runs daily by default
  // Configurable via SCHEDULER_CLEANUP_DELETED_LISTINGS_INTERVAL_HOURS
  // In production: 24 hours (daily)
  // In staging: 72 hours (3x slower)
  // In dev: 144 hours (6x slower)
  const intervalHours = getSchedulerIntervalHours('cleanup_deleted_listings', 24, {
    envVarName: 'SCHEDULER_CLEANUP_DELETED_LISTINGS_INTERVAL_HOURS',
  })

  // Always run at minute 15 to stagger from other jobs
  const cronExpression = hoursToCron(intervalHours, 15)
  console.log(
    `[CleanupDeletedListings] cron registered: ${cronExpression} (${intervalHours}h interval)`,
  )
  cron.schedule(cronExpression, () => cleanupDeletedListings(payload))
}
