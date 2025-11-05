import type { CollectionConfig } from 'payload'
import { sharedListingFields } from '../fields.shared'
import { autoSlug, attachOwner, setDefaultStatus } from '../_hooks/beforeValidate'
import { isOwnerOrAdmin, requireRole, approvedOnlyPublic } from '@/collections/_access/roles'
import { withIsFavoritedByViewer } from '../_hooks/afterRead/withIsFavoritedByViewer'
import { withHasReviewedByViewer } from '../_hooks/afterRead/withIsReviedByViewer'
import { revalidateListing } from '../_hooks/afterChange/revalidateListing'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'city', 'status', 'owner'],
    group: 'Listings',
  },
  access: {
    read: ({ req }) => approvedOnlyPublic({ req }),
    create: ({ req }) => requireRole(['provider'])({ req }),
    update: ({ req }) => isOwnerOrAdmin({ req }),
    delete: ({ req }) => isOwnerOrAdmin({ req }),
  },
  hooks: {
    beforeChange: [autoSlug, attachOwner, setDefaultStatus],
    afterRead: [withIsFavoritedByViewer, withHasReviewedByViewer],
    afterChange: [revalidateListing],
  },
  fields: [
    ...sharedListingFields,
    {
      name: 'type',
      type: 'relationship',
      relationTo: 'listing-types',
      required: true,
      filterOptions: {
        type: { equals: 'services' },
      },
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Type of service',
      },
    },
    {
      name: 'suitableFor',
      type: 'relationship',
      relationTo: 'listing-types',
      filterOptions: {
        type: { equals: 'events' },
      },
      hasMany: true,
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Type of event suitable for this service',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'contact',
          options: [
            { label: 'Fixed Price', value: 'fixed' },
            { label: 'Starting From', value: 'from' },
            { label: 'Contact for Price', value: 'contact' },
          ],
        },
        {
          name: 'amount',
          type: 'number',
          min: 0,
          admin: {
            condition: (data) => ['fixed', 'from'].includes(data?.pricing?.type),
          },
        },
        {
          name: 'currency',
          type: 'select',
          defaultValue: 'RON',
          options: [
            { label: 'RON', value: 'RON' },
            { label: 'EUR', value: 'EUR' },
            { label: 'USD', value: 'USD' },
          ],
          admin: {
            condition: (data) => ['fixed', 'from'].includes(data?.pricing?.type),
          },
        },
        {
          name: 'period',
          type: 'select',
          defaultValue: 'day',
          options: [
            { label: 'Per Hour', value: 'hour' },
            { label: 'Per Day', value: 'day' },
            { label: 'Per Event', value: 'event' },
          ],
          admin: {
            condition: (data) => ['fixed', 'from'].includes(data?.pricing?.type),
          },
        },
      ],
    },
    {
      name: 'availability',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'always',
          options: [
            { label: 'Always Available', value: 'always' },
            { label: 'Custom Schedule', value: 'custom' },
            { label: 'By Appointment', value: 'appointment' },
          ],
        },
        {
          name: 'schedule',
          type: 'array',
          admin: {
            condition: (data) => data?.availability?.type === 'custom',
          },
          fields: [
            {
              name: 'day',
              type: 'select',
              required: true,
              options: [
                { label: 'Monday', value: 'monday' },
                { label: 'Tuesday', value: 'tuesday' },
                { label: 'Wednesday', value: 'wednesday' },
                { label: 'Thursday', value: 'thursday' },
                { label: 'Friday', value: 'friday' },
                { label: 'Saturday', value: 'saturday' },
                { label: 'Sunday', value: 'sunday' },
              ],
            },
            {
              name: 'startTime',
              type: 'text',
              required: true,
            },
            {
              name: 'endTime',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
  ],
  timestamps: true,
}
