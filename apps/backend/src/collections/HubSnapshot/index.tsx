// collections/HubSnapshots.ts
import type { CollectionConfig } from 'payload'
import { isAdmin } from '../_access/roles'

export const HubSnapshots: CollectionConfig = {
  slug: 'hub-snapshots',
  admin: { useAsTitle: 'listingType', group: 'Listings' },

  access: {
    read: ({ req }) => !!req.user, // keep private; expose via custom endpoint
    create: ({ req }) => isAdmin({ req }),
    update: ({ req }) => isAdmin({ req }),
    delete: ({ req }) => isAdmin({ req }),
  },
  fields: [
    {
      name: 'listingType',
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'Locations', value: 'locations' },
        { label: 'Services', value: 'services' },
        { label: 'Events', value: 'events' },
      ],
    },
    // Store exactly what the hub page needs (card-ready)
    {
      name: 'typeaheadCities',
      type: 'array',
      fields: [
        { name: 'slug', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      name: 'topCities',
      type: 'array',
      fields: [
        { name: 'slug', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      name: 'topTypes',
      type: 'array',
      fields: [
        { name: 'slug', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      name: 'popularCityRows',
      type: 'array',
      fields: [
        { name: 'citySlug', type: 'text', required: true },
        { name: 'cityLabel', type: 'text', required: true },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'listingId', type: 'number', required: true },
            { name: 'slug', type: 'text', required: true },
            { name: 'title', type: 'text', required: true },
            { name: 'cityLabel', type: 'text' },
            { name: 'imageUrl', type: 'text' },
            { name: 'verified', type: 'checkbox', defaultValue: false },
            { name: 'ratingAvg', type: 'number' },
            { name: 'ratingCount', type: 'number' },
            { name: 'description', type: 'text' },
            { name: 'description_rich', type: 'json' },
            { name: 'type', type: 'text' },
            { name: 'capacity', type: 'number' },
            { name: 'startDate', type: 'date' },
            {
              name: 'tier',
              type: 'select',
              options: [
                { label: 'New', value: 'new' },
                { label: 'Standard', value: 'standard' },
                { label: 'Sponsored', value: 'sponsored' },
                { label: 'Recommended', value: 'recommended' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'featured',
      type: 'array',
      fields: [
        { name: 'listingId', type: 'number', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'cityLabel', type: 'text' },
        { name: 'imageUrl', type: 'text' },
        { name: 'verified', type: 'checkbox', defaultValue: false },
        { name: 'ratingAvg', type: 'number' },
        { name: 'ratingCount', type: 'number' },
        { name: 'description', type: 'text' },
        { name: 'description_rich', type: 'json' },
        { name: 'type', type: 'text' },
        { name: 'capacity', type: 'number' },
        { name: 'startDate', type: 'date' },
        {
          name: 'tier',
          type: 'select',
          options: [
            { label: 'New', value: 'new' },
            { label: 'Standard', value: 'standard' },
            { label: 'Sponsored', value: 'sponsored' },
            { label: 'Recommended', value: 'recommended' },
          ],
        },
      ],
    },
    {
      name: 'popularSearchCombos',
      type: 'array',
      fields: [
        { name: 'citySlug', type: 'text', required: true },
        { name: 'cityLabel', type: 'text', required: true },
        { name: 'typeSlug', type: 'text', required: true },
        { name: 'typeLabel', type: 'text', required: true },
      ],
    },
    {
      name: 'generatedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar' },
    },
    {
      name: 'algoVersion',
      type: 'text',
      required: true,
      defaultValue: 'v1',
      admin: { position: 'sidebar' },
    },
  ],
}
