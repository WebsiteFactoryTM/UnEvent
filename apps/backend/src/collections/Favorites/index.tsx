import { CollectionConfig } from 'payload'

export const Favorites: CollectionConfig = {
  slug: 'favorites',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
    },

    {
      name: 'createdAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
