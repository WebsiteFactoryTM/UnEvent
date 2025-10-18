// shared/fields.shared.ts

import type { Field } from 'payload'
import { createSlugField } from '../../utils/slugifySlug'
import type { Event, Location, Service } from '@/payload-types'

export const sharedListingFields: Field[] = [
  { name: 'title', type: 'text', required: true },
  {
    name: 'slug',
    type: 'text',
    unique: true,
    hooks: { beforeValidate: [createSlugField<Event | Location | Service>('title')] },
    index: true,
  },
  { name: 'description', type: 'textarea' },
  { name: 'city', type: 'relationship', relationTo: 'cities' },
  // { name: 'cityId', type: 'text', admin: { readOnly: true }, index: true }, // store the FK id as text

  { name: 'address', type: 'text' },
  { name: 'geo', type: 'point', index: true },
  {
    name: 'contact',
    type: 'group',
    fields: [
      {
        name: 'email',
        type: 'text',
      },
      {
        name: 'phone',
        type: 'text',
      },
      {
        name: 'website',
        type: 'text',
      },
    ],
  },
  {
    name: 'status',
    type: 'select',
    options: ['pending', 'approved', 'rejected'],
    defaultValue: 'pending',
    index: true,
  },
  {
    name: 'rejectionReason',
    type: 'textarea',
    admin: { condition: (data) => data?.status === 'rejected' },
  },
  { name: 'featuredImage', type: 'upload', relationTo: 'media', required: false },
  { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
  { name: 'owner', type: 'relationship', relationTo: 'profiles', required: true },
  { name: 'views', type: 'number', defaultValue: 0, admin: { readOnly: true } },
  {
    name: 'featured',
    type: 'checkbox',
    defaultValue: false,
    admin: { description: 'Mark as recommended/featured listing' },
    index: true,
  },
  { name: 'favoritesCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
  { name: 'bookingsCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
  {
    name: 'lastViewedAt',
    type: 'date',
    defaultValue: new Date(),
    admin: { readOnly: true },
  },
  {
    name: 'sponsored',
    type: 'checkbox',
    defaultValue: false,
    admin: { description: 'Mark as sponsored listing' },
  },
  {
    name: 'rating',
    type: 'number',
    min: 0,
    max: 5,
    defaultValue: 0,
    admin: { readOnly: true },
    index: true,
  },
  { name: 'reviewCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
  {
    name: 'tags',
    type: 'array',
    fields: [
      {
        name: 'tag',
        type: 'text',
        required: true,
      },
    ],
    admin: {
      description: 'Keywords to help find this listing',
    },
  },
  {
    name: 'socialLinks',
    type: 'group',
    fields: [
      {
        name: 'facebook',
        type: 'text',
      },
      {
        name: 'instagram',
        type: 'text',
      },
      {
        name: 'linkedin',
        type: 'text',
      },
      {
        name: 'youtube',
        type: 'text',
      },
      {
        name: 'tiktok',
        type: 'text',
      },
      {
        name: 'twitch',
        type: 'text',
      },
      {
        name: 'x',
        type: 'text',
      },
    ],
  },
  {
    name: 'youtubeLinks',
    type: 'array',
    fields: [
      {
        name: 'youtubeLink',
        type: 'text',
      },
    ],
  },
]
