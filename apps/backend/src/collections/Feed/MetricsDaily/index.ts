import { isAdmin } from '@/collections/_access/roles'
import type { CollectionConfig } from 'payload'

export const MetricsDaily: CollectionConfig = {
  slug: 'metrics-daily',
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['target', 'kind', 'date', 'impressions', 'views', 'bookings'],
    group: 'Analytics',
    description:
      'Raw daily counters for impressions, views, favorites, messages, participations, bookings',
  },
  versions: false,
  timestamps: false,
  access: {
    // Only admins can read metrics; system writes via workers
    read: ({ req }) => isAdmin({ req }),
    create: ({ req }) => isAdmin({ req }),
    update: ({ req }) => isAdmin({ req }),
    delete: ({ req }) => isAdmin({ req }),
  },
  fields: [
    {
      name: 'target',
      type: 'relationship',
      relationTo: ['locations', 'events', 'services'],
      required: true,
      index: true,
      admin: {
        description: 'The listing this metric belongs to',
      },
    },
    {
      name: 'kind',
      type: 'select',
      options: [
        { label: 'Locations', value: 'locations' },
        { label: 'Events', value: 'events' },
        { label: 'Services', value: 'services' },
      ],
      required: true,
      index: true,
      admin: {
        description: 'Type of listing for faster filtering',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      index: true,
      admin: {
        description: 'UTC date (YYYY-MM-DD) for this metric snapshot',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy-MM-dd',
        },
      },
    },
    {
      name: 'views',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Number of views on this date',
      },
    },
    {
      name: 'favorites',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Number of favorites added on this date',
      },
    },
    {
      name: 'bookings',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Number of bookings made on this date',
      },
    },
    {
      name: 'impressions',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Number of times the listing was shown in feeds/search on this date',
      },
    },
    {
      name: 'messages',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Number of new message threads started from this listing on this date',
      },
    },
    {
      name: 'participations',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Number of participations (e.g. clicked "Participă") on this date',
      },
    },
  ],
  // Note: Can't create compound indexes on polymorphic relationships in Payload
  // Individual field indexes on 'target', 'kind', and 'date' are already defined above
}
