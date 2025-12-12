import type { CollectionAfterChangeHook } from 'payload'
import type { User } from '@/payload-types'

export const createProfileAfterUserCreate: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  try {
    if (operation !== 'create') return
    console.log('createProfileAfterUserCreate', doc)

    const user = doc as unknown as User

    // Log once so we can verify hook is running after commit

    const userType = Array.from(
      new Set(user.roles.map((role) => (role === 'admin' ? 'client' : role))),
    )
    await req.payload.create({
      collection: 'profiles',
      overrideAccess: true,
      data: {
        user: user.id,
        name: user?.displayName || (user.email || '').split('@')[0] || 'User',
        displayName: user?.displayName || (user.email || '').split('@')[0] || 'User',
        userType,
      },
      req,
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
