import type { CollectionAfterChangeHook } from 'payload'

export const updateUserAvatar: CollectionAfterChangeHook = async ({
  req,
  previousDoc,
  data,
  operation,
}) => {
  if (operation === 'update') {
    const { payload } = req

    // Normalize avatar IDs for comparison
    const newAvatarId =
      typeof data.avatar === 'number'
        ? data.avatar
        : typeof data.avatar === 'object' && data.avatar && 'id' in data.avatar
          ? data.avatar.id
          : null

    const previousAvatarId =
      typeof previousDoc.avatar === 'number'
        ? previousDoc.avatar
        : typeof previousDoc.avatar === 'object' && previousDoc.avatar && 'id' in previousDoc.avatar
          ? previousDoc.avatar.id
          : null

    // Only update if avatar actually changed
    if (newAvatarId && newAvatarId !== previousAvatarId) {
      const newAvatarUrl = await payload.findByID({
        collection: 'media',
        id: newAvatarId,
      })

      const userId = typeof previousDoc.user === 'number' ? previousDoc.user : previousDoc.user.id

      try {
        await payload.update({
          collection: 'users',
          id: userId,
          data: { avatarURL: newAvatarUrl?.url || null },
        })
      } catch (error) {
        payload.logger.error(
          `[updateUserAvatar] error updating user avatar for user ${data.id} profile: ${userId}`,
          error,
        )
        return
      }
    } else if (!newAvatarId && previousAvatarId) {
      // Avatar was removed - clear avatarURL
      const userId = typeof previousDoc.user === 'number' ? previousDoc.user : previousDoc.user.id

      try {
        await payload.update({
          collection: 'users',
          id: userId,
          data: { avatarURL: null },
        })
      } catch (error) {
        payload.logger.error(
          `[updateUserAvatar] error clearing user avatar for user ${data.id} profile: ${userId}`,
          error,
        )
      }
    }
  }
}
