import { isAdmin } from '@/collections/_access/roles'
import type { CollectionConfig } from 'payload'

export const Aggregates: CollectionConfig = {
  slug: 'aggregates',
  admin: {
    useAsTitle: 'target',
    defaultColumns: ['target', 'kind', 'views7d', 'views30d', 'avgRating'],
    group: 'Analytics',
    description: 'Precomputed rolling windows and aggregated metrics per listing',
  },
  versions: false,
  timestamps: false,
  access: {
    read: () => true, // Public read for feed endpoint
    create: ({ req }) => isAdmin({ req }), // Only system writes
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
        description: 'The listing this aggregate belongs to',
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
      name: 'views7d',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Total views in last 7 days',
      },
    },
    {
      name: 'views30d',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Total views in last 30 days',
      },
    },
    {
      name: 'bookings7d',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Total bookings in last 7 days',
      },
    },
    {
      name: 'bookings30d',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Total bookings in last 30 days',
      },
    },
    {
      name: 'favorites',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Total favorites count (all time)',
      },
    },
    {
      name: 'reviewsCount',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Total number of reviews',
      },
    },
    {
      name: 'avgRating',
      type: 'number',
      min: 0,
      max: 5,
      defaultValue: 0,
      admin: {
        description: 'Average rating (1-5)',
      },
    },
    {
      name: 'bayesRating',
      type: 'number',
      min: 0,
      max: 5,
      defaultValue: 0,
      admin: {
        description: 'Bayesian rating to dampen small sample sizes',
      },
    },
  ],
  // Note: Can't create indexes on polymorphic relationships in Payload
  // Individual field indexes on 'target' and 'kind' are already defined above
}
