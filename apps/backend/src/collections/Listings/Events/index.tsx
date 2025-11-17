import type { CollectionConfig } from 'payload'
import { sharedListingFields } from '../fields.shared'
import { autoSlug, attachOwner, setDefaultStatus } from '../_hooks/beforeValidate'
import { approvedOnlyPublic, isOwnerOrAdmin, requireRole } from '@/collections/_access/roles'
import { withIsFavoritedByViewer } from '../_hooks/afterRead/withIsFavoritedByViewer'
import { withHasReviewedByViewer } from '../_hooks/afterRead/withIsReviedByViewer'
import { revalidateListing } from '../_hooks/afterChange/revalidateListing'
import { markListingMediaPermanent } from '../_hooks/afterChange/markMediaPermanent'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'city', 'moderationStatus', '_status', 'startDate', 'owner'],
    group: 'Listings',
    preview: (doc) => {
      return `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/api/preview?url=${encodeURIComponent(
        `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/events/${doc.slug}`,
      )}&secret=${process.env.PAYLOAD_PUBLIC_DRAFT_SECRET}`
    },
  },
  versions: {
    drafts: true,
  },
  timestamps: true,
  access: {
    read: ({ req }) => approvedOnlyPublic({ req }),
    create: ({ req }) => requireRole(['organizer'])({ req }),
    update: ({ req }) => isOwnerOrAdmin({ req }),
    delete: ({ req }) => isOwnerOrAdmin({ req }),
  },
  // Note: 'type' field is hasMany relationship, so can't be in compound index
  // Individual indexes are set on fields that support them
  hooks: {
    beforeChange: [autoSlug, attachOwner, setDefaultStatus],
    afterRead: [withIsFavoritedByViewer, withHasReviewedByViewer],
    afterChange: [markListingMediaPermanent, revalidateListing],
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
        type: { equals: 'events' },
      },
      admin: {
        position: 'sidebar',
        description: 'Type of event',
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
      required: true,
      index: true,
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
    },
    {
      name: 'venueAddressDetails',
      type: 'group',
      fields: [
        {
          name: 'venueAddress',
          type: 'text',
          required: true,
        },
        {
          name: 'venueCity',
          type: 'relationship',
          relationTo: 'cities',
          required: true,
        },
        {
          name: 'venueGeo',
          type: 'point',
          required: true,
        },
      ],
    },
    {
      name: 'requirements',
      type: 'array',
      fields: [
        {
          name: 'requirement',
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
}
