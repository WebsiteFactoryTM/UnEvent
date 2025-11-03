import { PayloadHandler, PayloadRequest } from 'payload'

export const checkIfIsFavorited: PayloadHandler = async (req: PayloadRequest) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }
  const { user } = req
  if (!user) {
    return new Response(JSON.stringify({ isFavorited: false }), { status: 200 })
  }
  const profileId = typeof user.profile === 'number' ? user.profile : user.profile?.id
  if (!profileId) {
    return new Response(JSON.stringify({ isFavorited: false }), { status: 200 })
  }

  try {
    const { targetKey } = req.query
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
              equals: targetKey,
            },
          },
        ],
      },
      limit: 1,
      depth: 0,
    })

    return new Response(JSON.stringify({ isFavorited: favorites.totalDocs > 0 }), { status: 200 })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errMsg }), { status: 500 })
  }
}
