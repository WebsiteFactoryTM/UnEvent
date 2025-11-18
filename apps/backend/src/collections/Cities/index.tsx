import type { CollectionConfig } from 'payload'
import { beforeChange } from './hooks/beforeChange'
import { importCitiesFromCsv } from './endpoints/importCsv'
import { isAdmin } from '../_access/roles'

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
  access: {
    read: ({ req }) => true,
    create: ({ req }) => isAdmin({ req }),
    update: ({ req }) => isAdmin({ req }),
    delete: ({ req }) => isAdmin({ req }),
  },
  hooks: {
    // afterChange: [
    //   async () => {
    //     const redis = getRedis()
    //     await redis.del('taxonomies')
    //   },
    // ],
    beforeChange: [beforeChange],
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
        description: 'The country of the city',
      },
    },
    {
      name: 'county',
      type: 'text',
      defaultValue: 'Romania',
      admin: {
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
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'The image of the city',
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
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Indicates if this city is featured',
      },
    },
  ],
  timestamps: true,

  endpoints: [
    {
      path: '/import-csv',
      method: 'post',
      handler: importCitiesFromCsv,
    },
  ],
}

export { Cities }
