import type { CollectionAfterOperationHook } from 'payload'
import type { User } from '@/payload-types'

export const createProfileAfterUserCreate: CollectionAfterOperationHook = async ({
  result,
  operation,
  req,
}) => {
  try {
    if (operation !== 'create') return
    // Defensive: result can be undefined if the hook wasn't registered on the correct collection
    // or if a non-create operation triggered this by mistake.
    if (!result) {
      req.payload.logger.error(
        '[createProfileAfterUserCreate] result is undefined for operation=create',
      )
      return
    }

    const user = result as User
    if (!user?.id) {
      req.payload.logger.error('[createProfileAfterUserCreate] missing user.id in result', result)
      return
    }

    // Log once so we can verify hook is running after commit
    req.payload.logger.info(`[createProfileAfterUserCreate] creating profile for user ${user.id}`)

    const userType = Array.from(
      new Set(user.roles.map((role) => (role === 'admin' ? 'client' : role))),
    )

    // Delay profile creation to ensure the user record is fully committed
    setTimeout(async () => {
      try {
        await req.payload.create({
          collection: 'profiles',
          data: {
            user: user.id,
            name: (user.email || '').split('@')[0] || 'User',
            userType,
          },
        })
        req.payload.logger.info(
          `[createProfileAfterUserCreate] profile created for user ${user.id}`,
        )
      } catch (e: unknown) {
        // If a unique constraint/duplicate happens (e.g., profile already exists), log and continue
        const msg = (e instanceof Error ? e.message : 'Unknown error')?.toLowerCase()
        if (
          msg.includes('duplicate') ||
          msg.includes('already exists') ||
          msg.includes('conflict')
        ) {
          req.payload.logger.warn(
            `[createProfileAfterUserCreate] profile already exists for user ${user.id} - skipping`,
          )
          return
        }
        req.payload.logger.error(
          `[createProfileAfterUserCreate] profile creation failed for user ${user.id} (first attempt): ${msg}`,
        )
        // Retry once after another short delay
        setTimeout(async () => {
          try {
            await req.payload.create({
              collection: 'profiles',
              data: {
                id: user.id,
                user: user.id,
                name: (user.email || '').split('@')[0] || 'User',
                userType,
              },
            })
            req.payload.logger.info(
              `[createProfileAfterUserCreate] profile created for user ${user.id} (retry)`,
            )
          } catch (e2: unknown) {
            const msg2 = (e2 instanceof Error ? e2.message : 'Unknown error')?.toLowerCase()
            if (
              msg2.includes('duplicate') ||
              msg2.includes('already exists') ||
              msg2.includes('conflict')
            ) {
              req.payload.logger.warn(
                `[createProfileAfterUserCreate] profile already exists for user ${user.id} (retry) - skipping`,
              )
              return
            }
            req.payload.logger.error(
              `[createProfileAfterUserCreate] profile creation failed for user ${user.id} (retry): ${msg2}`,
            )
          }
        }, 200)
      }
    }, 200)
  } catch (err: unknown) {
    console.error(
      '[createProfileAfterUserCreate] unexpected error',
      err instanceof Error ? err.message : 'Unknown error',
      err instanceof Error ? err.stack : undefined,
    )
    return
  }
}
