import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { useAsTitle: 'filename' },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: '/media',
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
      ({ data }) => {
        return { ...data, temp: data?.temp ?? true }
      },
    ],
  },
}
