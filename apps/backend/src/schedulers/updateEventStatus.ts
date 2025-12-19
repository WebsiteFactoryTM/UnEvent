/**
 * Scheduled job to update event statuses based on current date/time
 *
 * This job runs daily and updates event statuses in the database:
 * - finished: endDate < now
 * - in-progress: startDate <= now < endDate
 * - upcoming: startDate > now
 *
 * This ensures the database is kept in sync with actual event states
 * and improves query performance by avoiding dynamic status computation
 */

import type { Payload } from 'payload'
import cron from 'node-cron'
import * as Sentry from '@sentry/nextjs'
import { getSchedulerIntervalHours, hoursToCron } from '../utils/schedulerConfig'

export async function updateEventStatuses(payload: Payload): Promise<void> {
  console.log('[UpdateEventStatus] Starting event status update job')

  try {
    const now = new Date().toISOString()
    let finishedCount = 0
    let inProgressCount = 0
    let upcomingCount = 0

    // Process events in batches to avoid overwhelming the database
    const batchSize = 100
    let page = 1

    // Find all events with dates and process them
    for (;;) {
      const events = await payload.find({
        collection: 'events',
        page,
        limit: batchSize,
        depth: 0,
        where: {
          startDate: { exists: true },
          deletedAt: { exists: false },
        },
      })

      // Update each event's status based on current date
      for (const event of events.docs) {
        if (!event.startDate) continue

        const startDate = new Date(event.startDate)
        const endDate = event.endDate ? new Date(event.endDate) : null

        let newStatus: 'upcoming' | 'in-progress' | 'finished' = 'upcoming'

        // Determine the correct status based on dates
        if (endDate && endDate < new Date(now)) {
          newStatus = 'finished'
        } else if (startDate <= new Date(now) && (!endDate || endDate >= new Date(now))) {
          newStatus = 'in-progress'
        } else if (startDate > new Date(now)) {
          newStatus = 'upcoming'
        }

        // Only update if status has changed
        if (event.eventStatus !== newStatus) {
          try {
            await payload.update({
              collection: 'events',
              id: event.id,
              data: { eventStatus: newStatus },
              depth: 0,
            })

            // Increment counters
            if (newStatus === 'finished') finishedCount++
            else if (newStatus === 'in-progress') inProgressCount++
            else if (newStatus === 'upcoming') upcomingCount++
          } catch (err) {
            console.error(`[UpdateEventStatus] Error updating event ${event.id}:`, err)
          }
        }
      }

      if (!events.hasNextPage) break
      page++

      // Small delay between batches to be gentle on the database
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    console.log(
      `[UpdateEventStatus] Updated ${finishedCount} events to 'finished', ${inProgressCount} to 'in-progress', ${upcomingCount} to 'upcoming'`,
    )
    console.log('[UpdateEventStatus] Event status update job completed successfully')
  } catch (error) {
    console.error('[UpdateEventStatus] Error in event status update job:', error)

    // Report to Sentry
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('scheduler', 'updateEventStatus')
        Sentry.captureException(error)
      })
    }

    throw error
  }
}

/**
 * Register the event status update scheduler
 * Runs daily by default, configurable via SCHEDULER_EVENT_STATUS_INTERVAL_HOURS
 */
export const registerUpdateEventStatusScheduler = (payload: Payload) => {
  console.log('[registerUpdateEventStatusScheduler] Registering cron job')

  // Event status updates run once daily (every 24 hours) by default
  // Configurable via SCHEDULER_EVENT_STATUS_INTERVAL_HOURS
  // In production: 24 hours (1x daily)
  // In staging: 72 hours (3x slower)
  // In dev: 144 hours (6x slower)
  const intervalHours = getSchedulerIntervalHours('event_status', 24, {
    envVarName: 'SCHEDULER_EVENT_STATUS_INTERVAL_HOURS',
  })

  let cronExpression: string

  if (intervalHours >= 24) {
    // Daily schedule at 03:00 AM
    cronExpression = `0 3 * * *`
  } else if (intervalHours >= 1) {
    // Use hours interval
    cronExpression = hoursToCron(intervalHours, 0)
  } else {
    // Less than 1 hour - use minutes (fallback)
    const minutes = Math.floor(intervalHours * 60)
    cronExpression = `0 */${minutes} * * *`
  }

  console.log(`[UpdateEventStatus] Scheduled: ${cronExpression} (${intervalHours}h interval)`)

  cron.schedule(cronExpression, () => {
    updateEventStatuses(payload).catch((err) => {
      console.error('[UpdateEventStatus] Error in scheduled job:', err)
    })
  })

  // Run once at startup (non-blocking, fire-and-forget)
  console.log('[UpdateEventStatus] Running initial event status update at startup...')
  updateEventStatuses(payload).catch((err) => {
    console.error('[UpdateEventStatus] Error in initial event status update:', err)
  })
}
