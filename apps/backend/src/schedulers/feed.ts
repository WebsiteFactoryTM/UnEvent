import cron from 'node-cron'
import { Payload } from 'payload'
import { flushCountersToDaily } from '../collections/Feed/counters'
import { aggregateDaily } from '../collections/Feed/workers/aggregateDaily'
import { rankSegments } from '../collections/Feed/workers/rankSegments'
import { getSchedulerInterval, minutesToCron } from '../utils/schedulerConfig'

export const initFeedSchedulers = async (payload: Payload) => {
  console.log('[Feed] Initializing feed algorithm workers...')

  // Run initial data processing on startup (optional)
  // await flushCountersToDaily(payload)
  // await aggregateDaily(payload)
  // await rankSegments(payload)

  // Stagger the cron jobs to prevent overlap and reduce load
  // Flush Redis counters to metrics_daily every 10 minutes (configurable via SCHEDULER_FEED_FLUSH_INTERVAL_MINUTES)
  const flushInterval = getSchedulerInterval('feed_flush', 10, {
    envVarName: 'SCHEDULER_FEED_FLUSH_INTERVAL_MINUTES',
  })
  const flushCron = minutesToCron(flushInterval, 0)
  console.log(`[Feed] flushCountersToDaily scheduled: ${flushCron} (${flushInterval}min interval)`)
  cron.schedule(flushCron, async () => {
    const start = Date.now()
    try {
      console.log('[Feed] Starting flushCountersToDaily...')
      await flushCountersToDaily(payload)
      console.log(`[Feed] flushCountersToDaily completed in ${Date.now() - start}ms`)
    } catch (error) {
      console.error('[Feed] Error in flushCountersToDaily cron:', error)
    }
  })

  // Compute aggregates every 15 minutes (offset by 2 minutes to stagger)
  // Configurable via SCHEDULER_FEED_AGGREGATE_INTERVAL_MINUTES
  const aggregateInterval = getSchedulerInterval('feed_aggregate', 15, {
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
    }
  })

  // Rank segments every 20 minutes (offset by 5 minutes to stagger)
  // Configurable via SCHEDULER_FEED_RANK_INTERVAL_MINUTES
  const rankInterval = getSchedulerInterval('feed_rank', 20, {
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
    }
  })

  console.log('[Feed] ✅ Feed workers scheduled (staggered intervals)')
}
