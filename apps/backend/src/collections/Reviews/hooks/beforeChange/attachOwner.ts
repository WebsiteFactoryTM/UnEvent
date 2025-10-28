import { CollectionBeforeChangeHook } from 'payload'

export const attachOwner: CollectionBeforeChangeHook = ({ data, req }) => {
  if (!data.owner && req?.user?.id) {
    const profileId =
      typeof req.user?.profile === 'number' ? req.user?.profile : req.user?.profile?.id
    data.owner = profileId
  }
  return data
}
