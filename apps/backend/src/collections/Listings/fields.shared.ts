// shared/fields.shared.ts

import type { Field } from 'payload'

export const sharedListingFields: Field[] = [
  { name: 'title', type: 'text', required: true },
  {
    name: 'slug',
    type: 'text',
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: 'URL-friendly identifier',
      readOnly: true,
    },
  },
  {
    name: 'owner',
    type: 'relationship',
    relationTo: 'profiles',
    required: true,
    admin: {
      position: 'sidebar',
      description: 'Owner of the listing',
    },
    maxDepth: 2,
  },
  { name: 'description', type: 'textarea' },
  { name: 'city', type: 'relationship', relationTo: 'cities', index: true, required: true },

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
    name: 'moderationStatus',
    type: 'select',
    options: ['pending', 'approved', 'rejected', 'draft'],
    defaultValue: 'pending',
    index: true,
    admin: {
      position: 'sidebar',
      description: 'Status of the listing',
    },
  },
  {
    name: 'rejectionReason',
    type: 'textarea',
    admin: { condition: (data) => data?.moderationStatus === 'rejected' },
  },
  { name: 'featuredImage', type: 'upload', relationTo: 'media', required: false },
  { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
  {
    name: 'verifiedStatus',
    type: 'select',
    options: ['none', 'pending', 'approved', 'rejected'],
    defaultValue: 'none',
    index: true,
    admin: { position: 'sidebar', description: 'Verification status' },
  },
  { name: 'verification', type: 'relationship', relationTo: 'verifications' },
  {
    name: 'views',
    type: 'number',
    defaultValue: 0,
    admin: { readOnly: true, position: 'sidebar', description: 'Number of views' },
  },

  { name: 'favoritesCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
  { name: 'bookingsCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
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
    name: 'lastViewedAt',
    type: 'date',
    defaultValue: new Date(),
    admin: { readOnly: true },
  },
  {
    name: 'tier',
    type: 'select',
    options: [
      { label: 'New', value: 'new' },
      { label: 'Standard', value: 'standard' },
      {
        label: 'Sponsored',
        value: 'sponsored',
      },
      { label: 'Recommended', value: 'recommended' },
    ],
    index: true,
    admin: {
      position: 'sidebar',
      description: 'Tier of the listing',
    },
  },

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
  {
    name: 'isFavoritedByViewer',
    type: 'checkbox',
    defaultValue: false,
    admin: { readOnly: true },
  },
  {
    name: 'hasReviewedByViewer',
    type: 'checkbox',
    defaultValue: false,
    admin: { readOnly: true },
  },
  {
    name: 'deletedAt',
    type: 'date',
    index: true,
    admin: {
      position: 'sidebar',
      description: 'Timestamp when listing was soft deleted',
      readOnly: true,
    },
  },
]
