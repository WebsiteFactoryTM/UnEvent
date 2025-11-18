import type { CollectionConfig } from 'payload'
import { isAdmin } from './_access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { useAsTitle: 'filename' },
  access: {
    read: ({ req, data }) => {
      const doc = data
      // Public contexts: listing, avatar, event - accessible to everyone
      if (doc?.context === 'listing' || doc?.context === 'avatar' || doc?.context === 'event') {
        return true
      }
      // Private contexts: verification, document - require authentication
      if (doc?.context === 'verification' || doc?.context === 'document') {
        if (!req.user) return false
        // Admins can access all private documents
        if (isAdmin({ req })) return true
        // Users can only access their own documents
        const profileId =
          typeof req.user?.profile === 'number' ? req.user?.profile : req.user?.profile?.id
        return !!profileId && doc?.uploadedBy === profileId
      }
      // Default: allow read (fallback for any other contexts)
      return true
    },
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
