import { isAdmin } from '@/collections/_access/roles'
import type { CollectionConfig } from 'payload'

export const ListingRank: CollectionConfig = {
  slug: 'listing-rank',
  admin: {
    useAsTitle: 'segmentKey',
    defaultColumns: ['target', 'kind', 'segmentKey', 'score', 'calculatedAt'],
    group: 'Analytics',
    description: 'Precomputed ranking scores per segment (city+type) for fast feed queries',
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
        description: 'The listing being ranked',
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
      name: 'segmentKey',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Segment identifier (e.g., "timisoara|locatii" for city+type)',
      },
    },
    {
      name: 'score',
      type: 'number',
      required: true,
      min: 0,
      index: true,
      admin: {
        description: 'Computed ranking score (0-100+)',
      },
    },
    {
      name: 'calculatedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'Timestamp when this score was last computed',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy HH:mm',
        },
      },
    },
  ],
  indexes: [
    // This is the critical index for fast ranked queries
    {
      fields: ['segmentKey', 'kind', 'score'],
    },
  ],
  // Note: Can't include polymorphic 'target' in compound indexes
  // For uniqueness, we rely on application logic in the rankSegments worker
}
