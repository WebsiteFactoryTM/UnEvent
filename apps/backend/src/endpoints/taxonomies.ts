import type { PayloadHandler, PayloadRequest } from 'payload'
import * as Sentry from '@sentry/nextjs'

export const getTaxonomies: PayloadHandler = async (req: PayloadRequest): Promise<Response> => {
  try {
    const payload = req.payload
    const query = req.query

    const where = {
      usageCount: {
        greater_than: 0,
      },
    }

    const [listingTypes, facilities] = await Promise.all([
      payload.find({
        collection: 'listing-types',
        depth: 0,
        limit: 1000,
        select: {
          slug: true,
          title: true,
          category: true,
          categorySlug: true,
          type: true,
          usageCount: true,
          isPublic: true,
        },
        sort: ['title', 'asc'],
        where: query.fullList ? undefined : where,
      }),
      payload.find({
        collection: 'facilities',
        depth: 0,
        limit: 1000,
        select: {
          slug: true,
          title: true,
          category: true,
          categorySlug: true,
        },
        sort: ['title', 'asc'],
      }),
    ])

    return new Response(
      JSON.stringify({
        facilities: facilities.docs,
        eventTypes: listingTypes.docs.filter((type) => type.type === 'events'),
        locationTypes: listingTypes.docs.filter((type) => type.type === 'locations'),
        serviceTypes: listingTypes.docs.filter((type) => type.type === 'services'),
      }),
      { status: 200 },
    )
  } catch (err) {
    console.error('Error fetching taxonomies:', err)

    // Report to Sentry with context
    if (err instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', 'taxonomies')
        scope.setContext('request', {
          query: req.query,
          method: 'GET',
        })
        if (req.user) {
          scope.setUser({
            id: String(req.user.id),
            email: req.user.email,
          })
        }
        Sentry.captureException(err)
      })
    }

    return new Response(JSON.stringify({ message: 'Failed to fetch taxonomies' }), { status: 500 })
  }
}
