import type { CollectionConfig } from 'payload'
import { sharedListingFields } from '../fields.shared'
import { attachOwner, autoSlug, setDefaultStatus } from '../_hooks/beforeValidate'
import { isOwnerOrAdmin, requireRole } from '@/collections/_access/roles'
import { withIsFavoritedByViewer } from '../_hooks/afterRead/withIsFavoritedByViewer'
import { withHasReviewedByViewer } from '../_hooks/afterRead/withIsReviedByViewer'
import { revalidateListing } from '../_hooks/afterChange/revalidateListing'
import { markListingMediaPermanent } from '../_hooks/afterChange/markMediaPermanent'
import { notifyListingModeration } from '../_hooks/afterChange/notifyListingModeration'
import { notifyAdminNewListing } from '../_hooks/afterChange/notifyAdminNewListing'
import { notifyListingCreated } from '../_hooks/afterChange/notifyListingCreated'
import { regenerateSitemap } from '../_hooks/afterChange/regenerateSitemap'
import { queueHubSnapshotAfterDelete } from '../_hooks/afterDelete/queueHubSnapshot'
import { preventHardDelete } from '../_hooks/beforeDelete/preventHardDelete'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'city', 'moderationStatus', '_status', 'owner'],
    group: 'Listings',
    preview: (doc) => {
      return `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/api/preview?url=${encodeURIComponent(
        `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/locatii/${doc.slug}/preview`,
      )}&secret=${process.env.PAYLOAD_PUBLIC_DRAFT_SECRET}`
    },
  },
  access: {
    read: ({}) => true,
    create: ({ req }) => requireRole(['host'])({ req }),
    update: ({ req }) => isOwnerOrAdmin({ req }),
    delete: ({ req }) => isOwnerOrAdmin({ req }),
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [autoSlug, attachOwner, setDefaultStatus],
    beforeDelete: [preventHardDelete],
    afterRead: [withIsFavoritedByViewer, withHasReviewedByViewer],
    afterChange: [
      markListingMediaPermanent,
      revalidateListing,
      notifyListingModeration,
      notifyAdminNewListing,
      notifyListingCreated,
      regenerateSitemap,
    ],
    afterDelete: [queueHubSnapshotAfterDelete],
  },
  fields: [
    ...sharedListingFields,
    {
      name: 'type',
      type: 'relationship',
      relationTo: 'listing-types',
      hasMany: true,
      required: true,
      index: true,
      filterOptions: {
        type: { equals: 'locations' },
      },
      admin: {
        position: 'sidebar',
        description: 'Type of location',
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
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Type of event suitable for this location',
      },
    },
    {
      name: 'capacity',
      type: 'group',

      fields: [
        {
          name: 'indoor',
          type: 'number',
          min: 0,
          index: true,
          admin: {
            description: 'Indoor capacity',
          },
        },
        {
          name: 'outdoor',
          type: 'number',
          min: 0,
          admin: {
            description: 'Outdoor capacity',
          },
        },
        {
          name: 'seating',
          type: 'number',
          min: 0,

          admin: {
            description: 'Seating capacity',
          },
        },
        {
          name: 'parking',
          type: 'number',
          min: 0,

          admin: {
            description: 'Parking spots',
          },
        },
      ],
    },
    {
      name: 'surface',
      type: 'number',
      min: 0,
      admin: {
        description: 'Surface area in square meters (m²)',
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
          index: true,
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
      name: 'facilities',
      type: 'relationship',
      relationTo: 'facilities',
      hasMany: true,
      admin: {
        description: 'Select facilities available at this location',
      },
    },
  ],
  timestamps: true,
}
