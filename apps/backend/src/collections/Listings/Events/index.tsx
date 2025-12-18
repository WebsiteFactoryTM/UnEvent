import type { CollectionConfig } from 'payload'
import { sharedListingFields } from '../fields.shared'
import { attachOwner, setDefaultStatus } from '../_hooks/beforeValidate'
import { approvedOrOwnDraft, isOwnerOrAdmin, requireRole } from '@/collections/_access/roles'
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

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'city', 'moderationStatus', '_status', 'startDate', 'owner'],
    group: 'Listings',
    preview: (doc) => {
      return `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/api/preview?url=${encodeURIComponent(
        `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/evenimente/${doc.slug}/preview`,
      )}&secret=${process.env.PAYLOAD_PUBLIC_DRAFT_SECRET}`
    },
  },
  versions: {
    drafts: true,
  },
  timestamps: true,
  access: {
    read: ({}) => true,
    create: ({ req }) => requireRole(['organizer'])({ req }),
    update: ({ req }) => isOwnerOrAdmin({ req }),
    delete: ({ req }) => isOwnerOrAdmin({ req }),
  },
  // Note: 'type' field is hasMany relationship, so can't be in compound index
  // Individual indexes are set on fields that support them
  hooks: {
    beforeChange: [attachOwner, setDefaultStatus],
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
      required: false, // Allow optional for drafts
      index: true,
      filterOptions: {
        type: { equals: 'events' },
      },
      admin: {
        position: 'sidebar',
        description: 'Type of event',
      },
      validate: (value: any, { data }: { data: any }) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        // Require type for non-draft listings
        if (
          data?.moderationStatus &&
          data.moderationStatus !== 'draft' &&
          (!value || (Array.isArray(value) && value.length === 0))
        ) {
          return 'Type is required for published listings'
        }
        return true
      },
    },
    {
      name: 'eventStatus',
      type: 'select',
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Finished', value: 'finished' },
      ],
      required: true,
      defaultValue: 'upcoming',
      index: true,
    },
    {
      name: 'startDate',
      type: 'date',
      index: true,
      validate: (value: any, { data }: { data: any }) => {
        // Require startDate for non-draft listings
        if (data?.moderationStatus && data.moderationStatus !== 'draft' && !value) {
          return 'Start date is required for published events'
        }
        return true
      },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy hh:mm',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy hh:mm',
        },
      },
    },
    {
      name: 'allDayEvent',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Check if this is an all-day event',
      },
    },
    {
      name: 'capacity',
      type: 'group',
      fields: [
        {
          name: 'total',
          type: 'number',
          min: 1,
          admin: {
            description: 'Maximum number of attendees',
          },
        },
        {
          name: 'remaining',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'free',
          options: [
            { label: 'Free', value: 'free' },
            { label: 'Paid', value: 'paid' },
            { label: 'Contact for Price', value: 'contact' },
          ],
        },
        {
          name: 'amount',
          type: 'number',
          min: 0,
          index: true,
          admin: {
            condition: (data) => data?.pricing?.type === 'paid',
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
            condition: (data) => data?.pricing?.type === 'paid',
          },
        },
      ],
    },
    {
      name: 'ticketUrl',
      type: 'text',
      admin: {
        description: 'URL where users can purchase tickets',
      },
    },
    {
      name: 'registrationDeadline',
      type: 'date',
      admin: {
        description: 'Last day to register for the event',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy hh:mm',
        },
      },
    },
    {
      name: 'participants',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Current number of participants registered',
      },
    },
    {
      name: 'venue',
      type: 'relationship',
      relationTo: 'locations',
      admin: {
        description: 'Location where the event will be held',
      },
      required: false,
    },
    {
      name: 'requirements',
      type: 'array',
      fields: [
        {
          name: 'requirement',
          type: 'text',
          required: false,
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
  ],
}
