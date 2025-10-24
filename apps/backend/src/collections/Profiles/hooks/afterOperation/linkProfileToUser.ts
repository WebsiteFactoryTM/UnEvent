import { Profile } from '@/payload-types'
import { CollectionAfterOperationHook } from 'payload'

export const linkProfileToUserAfterChange: CollectionAfterOperationHook = async ({
  result,
  req,
  operation,
}) => {
  if (operation !== 'create') {
    req.payload.logger.debug(
      `[linkProfileToUserAfterCreate] skipping for non-create operation: ${operation}`,
    )
    return
  }

  const profile = result as Profile

  if (!profile.user) {
    req.payload.logger.warn(
      `[linkProfileToUserAfterCreate] profile ${profile.id} has no user reference, skipping`,
    )
    return
  }

  const userId = typeof profile.user === 'number' ? profile.user : profile.user.id

  try {
    req.payload.logger.info(
      `[linkProfileToUserAfterCreate] linking profile ${profile.id} to user ${userId}`,
      { profileId: profile.id, userId },
    )

    req.payload.update({
      collection: 'users',
      id: userId,
      data: {
        profile: profile.id,
      },
    })

    req.payload.logger.info(`[linkProfileToUserAfterCreate] successfully linked profile to user`, {
      profileId: profile.id,
      userId,
    })
  } catch (error) {
    const err = error as Error
    req.payload.logger.error(
      `[linkProfileToUserAfterCreate] error linking profile ${profile.id} to user ${userId}`,
      {
        error: err.stack,
        profileId: profile.id,
        userId,
        message: err.message,
      },
    )
    throw error // Re-throw to ensure the error is properly handled
  }
}
