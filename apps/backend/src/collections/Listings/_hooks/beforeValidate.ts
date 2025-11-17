/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Shared beforeValidate hooks for listing collections (locations, services, events)
 * Includes autoSlug, attachOwner, and setDefaultStatus
 */
import slugify from 'slugify'

export const autoSlug = ({ data }: { data: any }) => {
  if (!data.slug && data.title) {
    data.slug = slugify(data.title, { lower: true, strict: true, trim: true })
  }
  return data
}

export const attachOwner = ({ data, req }: { data: any; req: any }) => {
  // If the UI didn’t send a user/owner, attach from authenticated request
  if (!data.owner && req?.user?.id) {
    const profileId =
      typeof req.user?.profile === 'number' ? req.user?.profile : req.user?.profile?.id
    data.owner = profileId
  }
  return data
}

// Automatically set default status on create

export const setDefaultStatus = ({ data, operation }: { data: any; operation: string }) => {
  if (operation === 'create' && !data.moderationStatus) {
    data.moderationStatus = 'pending'
  }
  return data
}
