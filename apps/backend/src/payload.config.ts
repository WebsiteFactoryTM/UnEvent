// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Profiles } from './collections/Profiles'
import { Favorites } from './collections/Favorites'
import { ListingTypes } from './collections/ListingTypes'
import { Cities } from './collections/Cities'
import { Events, Locations, Services } from './collections/Listings'
import { Facilities } from './collections/Facilities'

import { seed } from './endpoints/seedEndpoint'
import { openapi, swaggerUI } from 'payload-oapi'
import { searchPlugin } from '@payloadcms/plugin-search'
import { index } from '@payloadcms/db-postgres/drizzle/pg-core'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL:
    process.env.PAYLOAD_PUBLIC_SERVER_URL || `http://localhost:${process.env.PORT || 4000}`,
  bin: [
    {
      scriptPath: path.resolve(dirname, 'seed.ts'),
      key: 'seed',
    },
  ],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  endpoints: [
    {
      path: '/seed',
      method: 'get',
      handler: seed,
    },
  ],
  collections: [
    Users,
    Media,
    Profiles,
    Favorites,
    ListingTypes,
    Cities,
    Events,
    Locations,
    Services,
    Facilities,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    afterSchemaInit: [
      ({ schema, extendTable }) => {
        // Check the actual table name in `schema.tables`
        const jt = (schema.tables as Record<string, any>).locations_suitableFor_rel // eslint-disable-line @typescript-eslint/no-explicit-any
        if (jt) {
          extendTable({
            table: jt,
            extraConfig: (table) => ({
              // Single-column indexes commonly used by Payload queries
              locations_suitableFor_parent_idx: index('locations_suitableFor_parent_idx').on(
                table.parentId,
              ),
              locations_suitableFor_value_idx: index('locations_suitableFor_value_idx').on(
                table.value,
              ),
              // Optional composite index to speed up combined filters on (value, parentId)
              // Remove if you don't need it to keep write overhead minimal
              locations_suitableFor_value_parent_idx: index(
                'locations_suitableFor_value_parent_idx',
              ).on(table.value, table.parentId),
            }),
          })
        }
        return schema
      },
    ],
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    openapi({ openapiVersion: '3.0', metadata: { title: 'Dev API', version: '0.0.1' } }),
    swaggerUI({ docsUrl: '/swagger', specEndpoint: '/openapi.json', enabled: true }),
    searchPlugin({
      collections: ['locations', 'services', 'events', 'profiles'],
      defaultPriorities: {
        locations: 10,
        services: 20,
        events: 30,
        profiles: 40,
      },
    }),
  ],
})
