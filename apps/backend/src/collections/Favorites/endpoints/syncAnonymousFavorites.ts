import { PayloadHandler, PayloadRequest } from 'payload'
import { z } from 'zod'

const SyncSchema = z.object({
  favorites: z.array(
    z.object({
      entity: z.enum(['locations', 'events', 'services']),
      id: z.coerce.number().int().positive(),
    }),
  ),
})

export const syncAnonymousFavorites: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const { user } = req
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    const body = (await req.json?.()) ?? req.body
    const { favorites } = SyncSchema.parse(body)

    if (!Array.isArray(favorites) || favorites.length === 0) {
      return new Response(JSON.stringify({ synced: 0, skipped: 0 }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    const profileId = typeof user.profile === 'number' ? user.profile : user.profile?.id
    if (!profileId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    // Build targetKeys for query
    const targetKeys = favorites.map((f) => `${f.entity}:${f.id}`)

    // Single query to check existing favorites (no N+1)
    const existingFavorites = await req.payload.find({
      collection: 'favorites',
      where: {
        and: [{ user: { equals: profileId } }, { targetKey: { in: targetKeys } }],
      },
      limit: favorites.length,
      depth: 0,
    })

    // Filter out duplicates by comparing targetKeys
    const existingTargetKeys = new Set(existingFavorites.docs.map((f) => f.targetKey))
    const toCreate = favorites.filter((f) => {
      const targetKey = `${f.entity}:${f.id}`
      return !existingTargetKeys.has(targetKey)
    })

    // Batch create new ones
    let created = 0
    if (toCreate.length > 0) {
      await Promise.all(
        toCreate.map((f) => {
          const target = { relationTo: f.entity, value: f.id }
          const targetKey = `${f.entity}:${f.id}`
          return req.payload
            .create({
              collection: 'favorites',
              data: {
                user: profileId,
                target,
                kind: f.entity,
                targetKey,
              },
            })
            .then(() => created++)
        }),
      )
    }

    return new Response(
      JSON.stringify({
        synced: created,
        skipped: existingFavorites.docs.length,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Sync error'
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
