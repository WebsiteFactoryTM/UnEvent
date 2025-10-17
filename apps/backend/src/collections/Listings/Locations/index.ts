import type { CollectionConfig } from 'payload'
import { sharedListingFields } from '../fields.shared'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'city', 'status', 'owner'],
    group: 'Listings',
  },
  access: {
    read: () => true,
    create: () => true, // We'll refine this later with proper auth
    update: () => true, // We'll refine this later with proper auth
    delete: () => true, // We'll refine this later with proper auth
  },
  fields: [
    ...sharedListingFields,
    {
      name: 'type',
      type: 'relationship',
      relationTo: 'listing-types',
      hasMany: true,
      required: true,
      filterOptions: {
        type: { equals: 'locations' },
      },
    },
    {
      name: 'suitableFor',
      type: 'relationship',
      relationTo: 'listing-types',
      filterOptions: {
        type: { equals: 'events' },
      },
      hasMany: true,
      required: true,
    },
    {
      name: 'capacity',
      type: 'group',
      fields: [
        {
          name: 'indoor',
          type: 'number',
          min: 0,
          admin: {
            description: 'Indoor capacity',
          },
        },
        {
          name: 'outdoor',
          type: 'number',
          min: 0,
          admin: {
            description: 'Outdoor capacity',
          },
        },
        {
          name: 'seating',
          type: 'number',
          min: 0,
          admin: {
            description: 'Seating capacity',
          },
        },
        {
          name: 'parking',
          type: 'number',
          min: 0,
          admin: {
            description: 'Parking spots',
          },
        },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'contact',
          options: [
            { label: 'Fixed Price', value: 'fixed' },
            { label: 'Starting From', value: 'from' },
            { label: 'Contact for Price', value: 'contact' },
          ],
        },
        {
          name: 'amount',
          type: 'number',
          min: 0,
          admin: {
            condition: (data) => ['fixed', 'from'].includes(data?.pricing?.type),
          },
        },
        {
          name: 'currency',
          type: 'select',
          defaultValue: 'RON',
          options: [
            { label: 'RON', value: 'RON' },
            { label: 'EUR', value: 'EUR' },
            { label: 'USD', value: 'USD' },
          ],
          admin: {
            condition: (data) => ['fixed', 'from'].includes(data?.pricing?.type),
          },
        },
        {
          name: 'period',
          type: 'select',
          defaultValue: 'day',
          options: [
            { label: 'Per Hour', value: 'hour' },
            { label: 'Per Day', value: 'day' },
            { label: 'Per Event', value: 'event' },
          ],
          admin: {
            condition: (data) => ['fixed', 'from'].includes(data?.pricing?.type),
          },
        },
      ],
    },
    {
      name: 'availability',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'always',
          options: [
            { label: 'Always Available', value: 'always' },
            { label: 'Custom Schedule', value: 'custom' },
            { label: 'By Appointment', value: 'appointment' },
          ],
        },
        {
          name: 'schedule',
          type: 'array',
          admin: {
            condition: (data) => data?.availability?.type === 'custom',
          },
          fields: [
            {
              name: 'day',
              type: 'select',
              required: true,
              options: [
                { label: 'Monday', value: 'monday' },
                { label: 'Tuesday', value: 'tuesday' },
                { label: 'Wednesday', value: 'wednesday' },
                { label: 'Thursday', value: 'thursday' },
                { label: 'Friday', value: 'friday' },
                { label: 'Saturday', value: 'saturday' },
                { label: 'Sunday', value: 'sunday' },
              ],
            },
            {
              name: 'startTime',
              type: 'text',
              required: true,
            },
            {
              name: 'endTime',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'amenities',
      type: 'array',
      fields: [
        {
          name: 'amenity',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'views',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'bookings',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'favorites',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'rating',
          type: 'group',
          fields: [
            {
              name: 'average',
              type: 'number',
              min: 0,
              max: 5,
              defaultValue: 0,
            },
            {
              name: 'count',
              type: 'number',
              defaultValue: 0,
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
