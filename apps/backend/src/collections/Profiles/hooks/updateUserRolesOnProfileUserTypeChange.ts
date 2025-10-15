import type { CollectionAfterChangeHook } from 'payload'

export const updateUserRolesOnProfileUserTypeChange: CollectionAfterChangeHook = async ({
  req,
  data,
  doc,
  operation,
}) => {
  if (operation === 'update') {
    if (doc.userType !== data.userType) {
      await req.payload.update({
        collection: 'users',
        id: doc.id,
        data: {
          roles: data.userType,
        },
      })
    }
  }
}
