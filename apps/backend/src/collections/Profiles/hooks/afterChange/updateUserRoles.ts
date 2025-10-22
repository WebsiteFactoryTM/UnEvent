import type { CollectionAfterChangeHook } from 'payload'

export const updateUserRoles: CollectionAfterChangeHook = async ({
  req,
  previousDoc,
  data,
  operation,
}) => {
  if (operation === 'update') {
    const different = !diffLists(data.userType, previousDoc.userType).equal
    const userId = typeof data.user === 'number' ? data.user : data.user.id
    if (different) {
      try {
        await req.payload.update({
          collection: 'users',
          id: userId,
          data: {
            roles: data.userType,
          },
        })
      } catch (error) {
        req.payload.logger.error(
          `[updateUserRoles] error updating user roles for user ${userId}`,
          error,
        )
        return
      }
    }
  }
}

// order-insensitive, deduped, case-sensitive
function diffLists(a: string[] = [], b: string[] = []) {
  const A = new Set(a)
  const B = new Set(b)

  const added = [...A].filter((x) => !B.has(x)) // in a, not in b
  const removed = [...B].filter((x) => !A.has(x)) // in b, not in a
  const equal = added.length === 0 && removed.length === 0

  return { equal, added, removed }
}
