import { PayloadHandler, PayloadRequest, Where } from 'payload'
import * as Sentry from '@sentry/nextjs'

export const getUserFavorites: PayloadHandler = async (req: PayloadRequest) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { user } = req
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const profileId = typeof user.profile === 'number' ? user.profile : user.profile?.id
  if (!profileId) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100) // Max 100 per page
    const kind = req.query.kind as 'locations' | 'events' | 'services' | undefined

    // Build where clause
    const where: Where = {
      user: {
        equals: profileId,
      },
      ...(kind && ['locations', 'events', 'services'].includes(kind)
        ? { kind: { equals: kind } }
        : {}),
    }

    // Fetch favorites with pagination
    const favorites = await req.payload.find({
      collection: 'favorites',
      where,
      depth: 2, // Reduced from 2 - only populate immediate relationships
      limit,
      page,
      sort: '-createdAt', // Most recent first
      // Note: PayloadCMS doesn't support select for nested relationships directly,
      // but depth: 1 reduces the data significantly
    })

    // If filtering by kind, return single array, otherwise group
    if (kind) {
      return new Response(
        JSON.stringify({
          docs: favorites.docs,
          totalDocs: favorites.totalDocs,
          limit: favorites.limit,
          totalPages: favorites.totalPages,
          page: favorites.page,
          hasNextPage: favorites.hasNextPage,
          hasPrevPage: favorites.hasPrevPage,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }

    // Group favorites by kind (for backward compatibility when no kind filter)
    const grouped = {
      locations: favorites.docs.filter((fav) => fav.kind === 'locations'),
      events: favorites.docs.filter((fav) => fav.kind === 'events'),
      services: favorites.docs.filter((fav) => fav.kind === 'services'),
      meta: {
        totalDocs: favorites.totalDocs,
        limit: favorites.limit,
        totalPages: favorites.totalPages,
        page: favorites.page,
        hasNextPage: favorites.hasNextPage,
        hasPrevPage: favorites.hasPrevPage,
      },
    }

    return new Response(JSON.stringify(grouped), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', 'get-user-favorites')
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

    return new Response(JSON.stringify({ error: errMsg }), { status: 500 })
  }
}
