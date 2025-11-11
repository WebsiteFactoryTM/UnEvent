import type { CollectionAfterChangeHook } from 'payload'

export const markAvatarPermanent: CollectionAfterChangeHook = async ({ doc, req }) => {
  const avatar = doc?.avatar
  if (!avatar) return
  const id =
    typeof avatar === 'object' && 'id' in avatar
      ? (avatar as { id: number | string }).id
      : (avatar as number | string)
  try {
    await req.payload.update({
      collection: 'media',
      id,
      data: { temp: false, context: 'avatar' },
    })
  } catch (e) {
    console.error('[Profiles] Failed to mark avatar media permanent', e)
  }
}
