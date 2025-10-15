import type { CollectionAfterChangeHook } from 'payload'

export const updateUserRolesOnProfileUserTypeChange: CollectionAfterChangeHook = async ({
  req,
  data,
  doc,
  operation,
}) => {
  if (operation === 'update') {
    if (doc.userType !== data.userType) {
      try {
        await req.payload.update({
          collection: 'users',
          id: doc.id,
          data: {
            roles: data.userType,
          },
        })
      } catch (error) {
        req.payload.logger.error(
          `[updateUserRolesOnProfileUserTypeChange] error updating user roles for user ${doc.id}`,
          error,
        )
        return
      }
    }
  }
}
