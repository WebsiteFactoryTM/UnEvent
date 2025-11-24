import type { CollectionConfig } from 'payload'
import { createSlugField } from '../../utils/slugifySlug'
import type { ListingType } from '@/payload-types'
import { isAdmin } from '@/collections/_access/roles'
import { getRedis } from '@/utils/redis'
import { afterChange } from '@/hooks/afterChange'

export const ListingTypes: CollectionConfig = {
  slug: 'listing-types',
  admin: {
    useAsTitle: 'title',
    group: 'Taxonomy',
  },
  timestamps: true,
  access: {
    read: () => true, // public read access for taxonomy
    create: ({ req }) => isAdmin({ req }),
    update: ({ req }) => isAdmin({ req }),
    delete: ({ req }) => isAdmin({ req }),
  },
  hooks: {
    afterChange: [
      async () => {
        const redis = getRedis()
        await redis.del('taxonomies')
      },
      afterChange,
    ],
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'URL-friendly identifier (e.g., logodna, sala-evenimente)',
      },
      hooks: { beforeValidate: [createSlugField<ListingType>('title')] },
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name (e.g., Logodnă, Sală de evenimente)',
      },
    },
    {
      name: 'category',
      type: 'text',
      required: true,
      admin: {
        description: 'Category header (e.g., NUNȚI & CEREMONII DE FAMILIE)',
      },
    },
    {
      name: 'categorySlug',
      type: 'text',
      admin: {
        description: 'Slugified category name',
      },
      hooks: { beforeValidate: [createSlugField<ListingType>('category')] },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Events', value: 'events' },
        { label: 'Locations', value: 'locations' },
        { label: 'Services', value: 'services' },
      ],
      admin: {
        description: 'Which taxonomy type this belongs to',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Order within category (maintains the defined hierarchy)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this taxonomy item is active/available',
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      index: true,
      admin: {
        description:
          'Denormalized total of listings tagged cu acest tip (toate stările). Se actualizează prin hooks.',
      },
    },
    {
      name: 'usageCountPublic',
      type: 'number',
      defaultValue: 0,
      index: true,
      admin: {
        description:
          'Număr listări publice (ex. aprobate/publish) care folosesc acest tip. Se actualizează prin hooks.',
      },
    },
    {
      name: 'usageUpdatedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Ultima actualizare a contoarelor de utilizare.',
      },
    },
  ],
}
