import { updateEventStatuses } from '@/schedulers/updateEventStatus'
import type { PayloadRequest } from 'payload'
import type { PayloadHandler } from 'payload'
import * as Sentry from '@sentry/nextjs'

export const updateEventStatusHandler: PayloadHandler = async (req: PayloadRequest) => {
  if (req.method !== 'POST')
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  if (!req.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  if (!req.user.roles.includes('admin'))
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  try {
    console.log('[UpdateEventStatusEndpoint] Manual trigger by admin:', req.user.email)
    await updateEventStatuses(req.payload)
    return new Response(JSON.stringify({ message: 'Event statuses updated successfully' }), {
      status: 200,
    })
  } catch (error) {
    console.error('[UpdateEventStatusEndpoint] Error:', error)

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', 'update-event-status')
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

    return new Response(JSON.stringify({ error: 'Error updating event statuses' }), {
      status: 500,
    })
  }
}
