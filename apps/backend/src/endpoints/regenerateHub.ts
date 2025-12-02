import { buildHubSnapshot } from '@/schedulers/buildHubSnapshot'
import type { PayloadRequest } from 'payload'
import type { PayloadHandler } from 'payload'
import * as Sentry from '@sentry/nextjs'

export const regenerateHubHandler: PayloadHandler = async (req: PayloadRequest) => {
  if (req.method !== 'GET')
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  if (!req.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  if (!req.user.roles.includes('admin'))
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  try {
    // updateListingTypesSlugs(req.payload)
    buildHubSnapshot(req.payload, 'locations')
    buildHubSnapshot(req.payload, 'services')
    buildHubSnapshot(req.payload, 'events')
    return new Response(JSON.stringify({ message: 'Hub regenerated' }), { status: 200 })
  } catch (error) {
    console.error(error)

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', 'regenerate-hub')
        scope.setContext('request', {
          method: 'GET',
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

    return new Response(JSON.stringify({ error: 'Error regenerating hub' }), { status: 500 })
  }
}
