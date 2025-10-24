import type { CollectionAfterOperationHook } from 'payload'
import type { User } from '@/payload-types'

export const createProfileAfterUserCreate: CollectionAfterOperationHook = async ({
  result,
  req,
  operation,
}) => {
  try {
    if (operation !== 'create') return
    console.log('createProfileAfterUserCreate', result)

    const user = result as User

    // Log once so we can verify hook is running after commit
    req.payload.logger.info(`[createProfileAfterUserCreate] creating profile for user ${user.id}`)

    const userType = Array.from(
      new Set(user.roles.map((role) => (role === 'admin' ? 'client' : role))),
    )
    req.payload.create({
      collection: 'profiles',
      data: {
        user: user.id,
        name: user?.displayName || (user.email || '').split('@')[0] || 'User',
        displayName: user?.displayName || (user.email || '').split('@')[0] || 'User',
        userType,
      },
    })
  } catch (err: unknown) {
    console.error(
      '[createProfileAfterUserCreate] unexpected error',
      err instanceof Error ? err.message : 'Unknown error',
      err instanceof Error ? err.stack : undefined,
    )
    return
  }
}
