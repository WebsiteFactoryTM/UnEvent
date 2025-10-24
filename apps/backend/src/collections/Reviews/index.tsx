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
      name: 'listingType',
      type: 'select',
      options: ['location', 'event', 'service'],
      required: true,
      admin: {
        position: 'sidebar',
      },
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
        position: 'sidebar',
      },
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
      admin: { condition: (data) => data?.status === 'rejected', position: 'sidebar' },
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
      type: 'textarea',
      admin: {
        description: 'Comment of the review',
      },
    },
  ],
}
