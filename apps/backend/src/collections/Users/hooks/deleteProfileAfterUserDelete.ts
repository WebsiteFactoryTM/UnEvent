import { CollectionBeforeDeleteHook } from 'payload'

export const deleteProfileUserDelete: CollectionBeforeDeleteHook = async ({ req, id }) => {
  try {
    req.payload.logger.info(`[deleteProfileAfterUserDelete] deleting profile for user ${id}`)
    await req.payload.delete({
      collection: 'profiles',
      where: {
        user: {
          equals: id,
        },
      },
    })
  } catch (error) {
    req.payload.logger.error(
      `[deleteProfileAfterUserDelete] error deleting profile for user ${id}`,
      error,
    )
    return
  }
}
