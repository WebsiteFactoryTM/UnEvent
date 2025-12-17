import cron from 'node-cron'
import { Payload } from 'payload'
import { flushCountersToDaily } from '../collections/Feed/counters'
import { aggregateDaily } from '../collections/Feed/workers/aggregateDaily'
import { rankSegments } from '../collections/Feed/workers/rankSegments'
import { getSchedulerInterval, minutesToCron } from '../utils/schedulerConfig'
import * as Sentry from '@sentry/nextjs'

export const initFeedSchedulers = async (payload: Payload) => {
  console.log('[Feed] Initializing feed algorithm workers...')

  // Run initial data processing on startup (optional)
  // await flushCountersToDaily(payload)
  // await aggregateDaily(payload)
  // await rankSegments(payload)

  // Stagger the cron jobs to prevent overlap and reduce load
  // Flush Redis counters to metrics_daily once per day at midnight UTC
  // Note: For high-traffic sites, you may want to flush more frequently (e.g., every few hours)
  // to manage Redis memory, but the metrics_daily records are still daily aggregates
  const flushInterval = getSchedulerInterval('feed_flush', 1440, {
    envVarName: 'SCHEDULER_FEED_FLUSH_INTERVAL_MINUTES',
  })
  // Run at 00:00 UTC daily (or use minutesToCron if interval is < 1440 for dev/testing)
  const flushCron = flushInterval >= 1440 ? '0 0 * * *' : minutesToCron(flushInterval, 0)
  console.log(
    `[Feed] flushCountersToDaily scheduled: ${flushCron} (${flushInterval >= 1440 ? 'daily at midnight UTC' : `${flushInterval}min interval (dev/testing)`})`,
  )
  cron.schedule(flushCron, async () => {
    const start = Date.now()
    try {
      console.log('[Feed] Starting flushCountersToDaily...')
      await flushCountersToDaily(payload)
      console.log(`[Feed] flushCountersToDaily completed in ${Date.now() - start}ms`)
    } catch (error) {
      console.error('[Feed] Error in flushCountersToDaily cron:', error)
      if (error instanceof Error) {
        Sentry.withScope((scope) => {
          scope.setTag('scheduler', 'feed')
          scope.setTag('job', 'flushCountersToDaily')
          scope.setContext('scheduler', {
            interval: flushInterval,
            cron: flushCron,
          })
          Sentry.captureException(error)
        })
      }
    }
  })

  // Compute aggregates every 2 hours (offset by 2 minutes to stagger)
  // Configurable via SCHEDULER_FEED_AGGREGATE_INTERVAL_MINUTES
  // Default increased from 15min to 2h for MVP/low-traffic scenarios
  // For high-traffic sites, set SCHEDULER_FEED_AGGREGATE_INTERVAL_MINUTES=15
  const aggregateInterval = getSchedulerInterval('feed_aggregate', 120, {
    envVarName: 'SCHEDULER_FEED_AGGREGATE_INTERVAL_MINUTES',
  })
  const aggregateCron = minutesToCron(aggregateInterval, 2)
  console.log(
    `[Feed] aggregateDaily scheduled: ${aggregateCron} (${aggregateInterval}min interval, 2min offset)`,
  )
  cron.schedule(aggregateCron, async () => {
    const start = Date.now()
    try {
      console.log('[Feed] Starting aggregateDaily...')
      await aggregateDaily(payload)
      console.log(`[Feed] aggregateDaily completed in ${Date.now() - start}ms`)
    } catch (error) {
      console.error('[Feed] Error in aggregateDaily cron:', error)
      if (error instanceof Error) {
        Sentry.withScope((scope) => {
          scope.setTag('scheduler', 'feed')
          scope.setTag('job', 'aggregateDaily')
          scope.setContext('scheduler', {
            interval: aggregateInterval,
            cron: aggregateCron,
          })
          Sentry.captureException(error)
        })
      }
    }
  })

  // Rank segments every 2 hours (offset by 5 minutes to stagger)
  // Configurable via SCHEDULER_FEED_RANK_INTERVAL_MINUTES
  // Default increased from 20min to 2h for MVP/low-traffic scenarios
  // For high-traffic sites, set SCHEDULER_FEED_RANK_INTERVAL_MINUTES=20
  const rankInterval = getSchedulerInterval('feed_rank', 120, {
    envVarName: 'SCHEDULER_FEED_RANK_INTERVAL_MINUTES',
  })
  const rankCron = minutesToCron(rankInterval, 5)
  console.log(
    `[Feed] rankSegments scheduled: ${rankCron} (${rankInterval}min interval, 5min offset)`,
  )
  cron.schedule(rankCron, async () => {
    const start = Date.now()
    try {
      console.log('[Feed] Starting rankSegments...')
      await rankSegments(payload)
      console.log(`[Feed] rankSegments completed in ${Date.now() - start}ms`)
    } catch (error) {
      console.error('[Feed] Error in rankSegments cron:', error)
      if (error instanceof Error) {
        Sentry.withScope((scope) => {
          scope.setTag('scheduler', 'feed')
          scope.setTag('job', 'rankSegments')
          scope.setContext('scheduler', {
            interval: rankInterval,
            cron: rankCron,
          })
          Sentry.captureException(error)
        })
      }
    }
  })

  console.log('[Feed] ✅ Feed workers scheduled (staggered intervals)')
}
