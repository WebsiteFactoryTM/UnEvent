import type { CollectionAfterChangeHook } from 'payload'

export const updateUserDisplayName: CollectionAfterChangeHook = async ({
  req,
  previousDoc,
  data,
  operation,
}) => {
  if (operation === 'update') {
    const { payload } = req

    if (data.displayName !== previousDoc.displayName) {
      const userId = typeof previousDoc.user === 'number' ? previousDoc.user : data.user.id

      try {
        await payload.update({
          collection: 'users',
          id: userId,
          data: { displayName: data.displayName },
        })
      } catch (error) {
        payload.logger.error(
          `[updateUserDisplayName] error updating user display name for user ${data.id} profile: ${userId}`,
          error,
        )
        return
      }
    }
  }
}
