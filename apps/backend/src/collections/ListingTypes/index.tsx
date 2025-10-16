import type { CollectionConfig } from 'payload'

export const ListingTypes: CollectionConfig = {
  slug: 'listing-types',
  admin: {
    useAsTitle: 'title',
    group: 'Taxonomy',
  },
  timestamps: true,
  access: {
    read: () => true, // public read access for taxonomy
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g., logodna, sala-evenimente)',
      },
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
      required: true,
      admin: {
        description: 'Slugified category name',
      },
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
  ],
}
