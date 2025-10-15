import { CollectionAfterChangeHook } from 'payload'

export const linkProfileToUserAfterChange: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return

  if (!doc.user) return

  const userId = typeof doc.user === 'number' ? doc.user : doc.user.id

  try {
    req.payload.logger.info(
      `[linkProfileToUserAfterCreate] linking profile ${doc.id} to user ${userId}`,
    )
    await req.payload.update({
      collection: 'users',
      id: userId,
      data: {
        profile: doc.id,
      },
    })
  } catch (error) {
    req.payload.logger.error(
      `[linkProfileToUserAfterCreate] error linking profile ${doc.id} to user ${userId}`,
      error,
    )
    return
  }
}
