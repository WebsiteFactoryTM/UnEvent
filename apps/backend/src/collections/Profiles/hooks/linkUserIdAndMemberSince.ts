import type { CollectionBeforeChangeHook } from 'payload'

export const linkUserIdAndMemberSince: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  // Set memberSince on create
  if (operation === 'create') {
    data.memberSince = new Date()

    // Link to current user if not set
    if (!data.user && req.user) {
      data.user = req.user.id
    }
  }
  return data
}
