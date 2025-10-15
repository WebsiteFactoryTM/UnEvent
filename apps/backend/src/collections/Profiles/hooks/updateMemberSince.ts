import type { CollectionBeforeChangeHook } from 'payload'

export const updateMemberSince: CollectionBeforeChangeHook = async ({
  data,

  operation,
}) => {
  // Set memberSince on create
  if (operation === 'create') {
    data.memberSince = new Date()
  }
  return data
}
