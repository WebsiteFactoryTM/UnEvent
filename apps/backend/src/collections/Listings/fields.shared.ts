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
  },
  { name: 'description', type: 'textarea' },
  { name: 'city', type: 'relationship', relationTo: 'cities' },
  { name: 'address', type: 'text' },
  { name: 'geo', type: 'point' },
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
  },
  { name: 'featuredImage', type: 'upload', relationTo: 'media', required: true },
  { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
  { name: 'owner', type: 'relationship', relationTo: 'profiles', required: true },
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
