import type { CollectionConfig } from 'payload'
import slugify from 'slugify'
import { createSlugField } from '../../utils/slugifySlug'
import { Facility } from '@/payload-types'

export const Facilities: CollectionConfig = {
  slug: 'facilities',
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
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g., open-space, meeting-room)',
      },
      hooks: { beforeValidate: [createSlugField<Facility>('title')] },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name (e.g., Open Space, Meeting Room)',
      },
    },
    {
      name: 'category',
      type: 'text',
      required: true,
      admin: {
        description: 'Category header (e.g., SPAȚIU & CONFIGURARE, MOBILIER & SETUP)',
      },
    },
    {
      name: 'categorySlug',
      type: 'text',
      admin: {
        description: 'Slugified category name',
      },
      hooks: { beforeValidate: [createSlugField<Facility>('category')] },
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
