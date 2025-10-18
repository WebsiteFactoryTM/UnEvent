import type { CollectionConfig } from 'payload'
import { beforeChange } from './hooks/beforeChange'
import { importCitiesFromCsv } from './endpoints/importCsv'

const Cities: CollectionConfig = {
  slug: 'cities',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'usageCount', 'verified'],
    // components: {
    //   beforeList: [
    //     {
    //       path: '/collections/Cities/components/ImportButton',
    //       exportName: 'ImportButton',
    //     },
    //   ],
    // },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'The official name of the city',
      },
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from city name. Used in URLs and lookups.',
        readOnly: true,
      },
      index: true,
    },
    {
      name: 'country',
      type: 'text',
      defaultValue: 'Romania',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'county',
      type: 'text',
      defaultValue: 'Romania',
      admin: {
        position: 'sidebar',
        description: 'The ISO 3166-1 alpha-2 code for the country',
      },
      index: true,
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'seeded',
      options: [
        { label: 'Seeded', value: 'seeded' },
        { label: 'Google Places', value: 'google' },
        { label: 'User Input', value: 'user' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Where this city data originated from',
      },
    },
    {
      name: 'geo',
      type: 'point',
      required: true,
      admin: {
        description: 'Geographic coordinates (latitude, longitude)',
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Number of times this city is referenced',
      },
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Indicates if this city data has been verified by admins',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [beforeChange],
  },
  endpoints: [
    {
      path: '/import-csv',
      method: 'post',
      handler: importCitiesFromCsv,
    },
  ],
}

export { Cities }
