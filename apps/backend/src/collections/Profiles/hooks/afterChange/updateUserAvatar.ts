import type { CollectionAfterChangeHook } from 'payload'

export const updateUserAvatar: CollectionAfterChangeHook = async ({
  req,
  previousDoc,
  data,
  operation,
}) => {
  if (operation === 'update') {
    const { payload } = req

    if (data.avatar && data.avatar !== previousDoc.avatar) {
      const newAvatarUrl = await payload.findByID({
        collection: 'media',
        id: data.avatar,
      })

      const userId = typeof previousDoc.user === 'number' ? previousDoc.user : previousDoc.user.id

      try {
        await payload.update({
          collection: 'users',
          id: userId,
          data: { avatarURL: newAvatarUrl?.url },
        })
      } catch (error) {
        payload.logger.error(
          `[updateUserAvatar] error updating user avatar for user ${data.id} profile: ${userId}`,
          error,
        )
        return
      }
    }
  }
}
