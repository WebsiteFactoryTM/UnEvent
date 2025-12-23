import { PayloadHandler, PayloadRequest } from 'payload'

/**
 * Batch check if multiple items are favorited by the current user
 * Query param: targetKeys (comma-separated list, e.g. "locations:1,events:2,services:3")
 * Returns: { [targetKey: string]: boolean }
 */
export const checkBatchFavorites: PayloadHandler = async (req: PayloadRequest) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { user } = req
  if (!user) {
    // Return empty map for unauthenticated users
    return new Response(JSON.stringify({}), { status: 200 })
  }

  const profileId = typeof user.profile === 'number' ? user.profile : user.profile?.id
  if (!profileId) {
    return new Response(JSON.stringify({}), { status: 200 })
  }

  try {
    const { targetKeys } = req.query

    // Parse comma-separated targetKeys
    if (!targetKeys || typeof targetKeys !== 'string') {
      return new Response(JSON.stringify({}), { status: 200 })
    }

    const keysArray = targetKeys.split(',').filter(Boolean).slice(0, 100) // Max 100 items

    if (keysArray.length === 0) {
      return new Response(JSON.stringify({}), { status: 200 })
    }

    // Single query to get all favorites for this user matching any of the targetKeys
    const favorites = await req.payload.find({
      collection: 'favorites',
      where: {
        and: [
          {
            user: {
              equals: profileId,
            },
          },
          {
            targetKey: {
              in: keysArray,
            },
          },
        ],
      },
      limit: keysArray.length,
      depth: 0,
    })

    // Build response map: { "locations:1": true, "events:2": false, ... }
    const result: Record<string, boolean> = {}
    const favoritedKeys = new Set(favorites.docs.map((fav) => fav.targetKey))

    for (const key of keysArray) {
      result[key] = favoritedKeys.has(key)
    }

    return new Response(JSON.stringify(result), { status: 200 })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[checkBatchFavorites] Error:', errMsg)
    return new Response(JSON.stringify({ error: errMsg }), { status: 500 })
  }
}
