import type { CollectionConfig } from 'payload'
import { isAdmin } from './_access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { useAsTitle: 'filename' },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req }) => {
      if (isAdmin({ req })) return true
      const profileId =
        typeof req.user?.profile === 'number' ? req.user?.profile : req.user?.profile?.id
      return !!req.user && !!profileId && { uploadedBy: { equals: profileId } }
    },
    delete: ({ req }) => {
      if (isAdmin({ req })) return true
      const profileId =
        typeof req.user?.profile === 'number' ? req.user?.profile : req.user?.profile?.id
      return !!req.user && !!profileId && { uploadedBy: { equals: profileId } }
    },
  },
  upload: {
    staticDir: 'media',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'context',
      type: 'select',
      options: ['listing', 'avatar', 'event', 'document', 'verification'],
      required: true,
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'profiles',
    },
    {
      name: 'temp',
      type: 'checkbox',
      defaultValue: true,
      label: 'Temporary file',
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        const profileId =
          typeof req.user?.profile === 'number' ? req.user?.profile : req.user?.profile?.id
        return {
          ...data,
          temp: data?.temp ?? true,
          context: data?.context ?? 'listing',
          uploadedBy: profileId,
        }
      },
    ],
  },
}
