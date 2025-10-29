import { CollectionBeforeChangeHook } from 'payload'

// Ensure the `user` relationship (to profiles) is attached from the authenticated request
export const attachOwner: CollectionBeforeChangeHook = ({ data, req }) => {
  if (!data.user && req?.user?.id) {
    const profileId =
      typeof req.user?.profile === 'number' ? req.user?.profile : req.user?.profile?.id
    if (profileId) {
      data.user = profileId
    }
  }
  return data
}
