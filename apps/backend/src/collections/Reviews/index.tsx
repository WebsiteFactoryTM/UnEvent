import { CollectionConfig } from 'payload'
import { requireRole } from '../_access/roles'
import { isOwnerOrAdmin } from '../_access/roles'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: ({ req }) => requireRole(['admin'])({ req }),
  },
  timestamps: true,
  fields: [
    {
      name: 'listing',
      type: 'relationship',
      relationTo: ['locations', 'events', 'services'],
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'profiles',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'approved', 'rejected'],
      defaultValue: 'pending',
      index: true,
      admin: {
        description: 'Status of the review',
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 0,
      max: 5,
      required: true,
      index: true,
      admin: {
        description: 'Rating of the review',
      },
    },
    {
      name: 'comment',
      type: 'text',
      required: true,
      admin: {
        description: 'Comment of the review',
      },
    },
  ],
}
