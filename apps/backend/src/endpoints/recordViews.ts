import type { PayloadHandler } from 'payload'

import { bumpView } from '@/collections/Feed/counters'
import * as Sentry from '@sentry/nextjs'

// Script must define a "script" function export that accepts the sanitized config
export const incrementView: PayloadHandler = async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  if (!req.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const body = (await req.json?.()) ?? req.body
    const { kind, listingId } = body as {
      kind: 'events' | 'locations' | 'services'
      listingId: string
    }
    if (!kind || !listingId) {
      return new Response('Bad Request', { status: 400 })
    }

    const listing = await req.payload.find({
      collection: kind,
      where: { id: { equals: listingId } },
      limit: 1,
      depth: 0,
    })
    if (!listing.docs.length) {
      return new Response('Listing not found', { status: 404 })
    }
    const listingData = listing.docs[0]
    if (!listingData) {
      return new Response('Listing not found', { status: 404 })
    }

    if (listingData.owner === req.user.id) {
      return new Response('You cannot increment views for your own listing', { status: 400 })
    }

    await bumpView(kind, listingId)
    return new Response('Successfully recorded view!', { status: 200 })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.log('Error recording view:', errMsg)

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', 'increment-view')
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

    return new Response(JSON.stringify({ error: errMsg }), { status: 400 })
  }
}
