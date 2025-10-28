import cron from 'node-cron'
import { Payload } from 'payload'
import { flushCountersToDaily } from '../collections/Feed/counters'
import { aggregateDaily } from '../collections/Feed/workers/aggregateDaily'
import { rankSegments } from '../collections/Feed/workers/rankSegments'

export const initFeedSchedulers = async (payload: Payload) => {
  console.log('[Feed] Initializing feed algorithm workers...')

  // Run initial data processing on startup (optional)
  // await flushCountersToDaily(payload)
  // await aggregateDaily(payload)
  // await rankSegments(payload)

  // Stagger the cron jobs to prevent overlap and reduce load
  // Flush Redis counters to metrics_daily every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
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
  cron.schedule('2,17,32,47 * * * *', async () => {
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
  cron.schedule('5,25,45 * * * *', async () => {
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
