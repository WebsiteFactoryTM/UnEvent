import { PayloadHandler, PayloadRequest } from 'payload'
import { z } from 'zod'
const ToggleSchema = z.object({
  entity: z.enum(['locations', 'events', 'services']),
  id: z.coerce.number().int().positive(),
})

export const toggleFavorites: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const { user } = req
    if (!user) return new Response('Unauthorized', { status: 401 })
    const body = (await req.json?.()) ?? req.body
    const { entity, id } = ToggleSchema.parse(body)

    const target = { relationTo: entity, value: id }
    const targetKey = `${entity}:${id}`

    // Check existing
    const profileId = typeof user.profile === 'number' ? user.profile : user.profile?.id
    if (!profileId) return new Response('Unauthorized', { status: 401 })

    const existing = await req.payload.find({
      collection: 'favorites',
      where: {
        and: [{ user: { equals: profileId } }, { targetKey: { equals: targetKey } }],
      },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length) {
      // Unfavorite
      await req.payload.delete({ collection: 'favorites', id: existing.docs[0].id })
      // Count after delete
      const count = await req.payload.count({
        collection: 'favorites',
        where: { targetKey: { equals: targetKey } },
      })
      return new Response(
        JSON.stringify({ isFavorite: false, favorites: count.totalDocs ?? count }),
        { status: 200 },
      )
    } else {
      // Favorite
      await req.payload.create({
        collection: 'favorites',
        data: { user: profileId, target, kind: entity, targetKey },
      })
      const count = await req.payload.count({
        collection: 'favorites',
        where: { targetKey: { equals: targetKey } },
      })
      return new Response(
        JSON.stringify({ isFavorite: true, favorites: count.totalDocs ?? count }),
        { status: 200 },
      )
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Toggle error'
    return new Response(JSON.stringify({ error: errMsg }), { status: 400 })
  }
}
