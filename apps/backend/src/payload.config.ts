// storage-adapter-import-placeholder
import { postgresAdapter, sql } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, Field } from 'payload'
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
import { feedHandler } from './endpoints/feedEndpoint'
import { openapi, swaggerUI } from 'payload-oapi'
import { searchPlugin } from '@payloadcms/plugin-search'
import { index } from '@payloadcms/db-postgres/drizzle/pg-core'
import { ListingRank } from './collections/Feed/ListingRank'
import { Aggregates } from './collections/Feed/Aggregates'
import { MetricsDaily } from './collections/Feed/MetricsDaily'
import { Reviews } from './collections/Reviews'

// Feed algorithm workers
import cron from 'node-cron'
import { flushCountersToDaily } from './collections/Feed/counters'
import { aggregateDaily } from './collections/Feed/workers/aggregateDaily'
import { rankSegments } from './collections/Feed/workers/rankSegments'

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
    {
      path: '/feed',
      method: 'get',
      handler: feedHandler,
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
    MetricsDaily,
    Aggregates,
    ListingRank,
    Reviews,
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
        const tables = schema.tables as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

        // Helper to safely extend a join table with composite indexes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function addCompositeIndexes(tableName: string, builders: (t: any) => Record<string, any>) {
          const t = tables[tableName]
          if (!t) return
          extendTable({
            table: t,
            extraConfig: (tbl) => builders(tbl),
          })
        }

        // LOCATIONS_RELS: paths present -> facilities, suitableFor, type
        addCompositeIndexes('locations_rels', (t) => ({
          locations_rels_suitableFor_composite_idx: index(
            'locations_rels_suitableFor_composite_idx',
          )
            .on(t['listing-typesID'], t.parent)
            .where(sql`path = 'suitableFor'`),
          locations_rels_type_composite_idx: index('locations_rels_type_composite_idx')
            .on(t['listing-typesID'], t.parent)
            .where(sql`path = 'type'`),
          locations_rels_facilities_composite_idx: index('locations_rels_facilities_composite_idx')
            .on(t.facilitiesID, t.parent)
            .where(sql`path = 'facilities'`),
        }))

        // SERVICES_RELS
        addCompositeIndexes('services_rels', (t) => ({
          services_rels_suitableFor_composite_idx: index('services_rels_suitableFor_composite_idx')
            .on(t['listing-typesID'], t.parent)
            .where(sql`path = 'suitableFor'`),
          services_rels_type_composite_idx: index('services_rels_type_composite_idx')
            .on(t['listing-typesID'], t.parent)
            .where(sql`path = 'type'`),
        }))

        // EVENTS_RELS
        addCompositeIndexes('events_rels', (t) => ({
          events_rels_type_composite_idx: index('events_rels_type_composite_idx')
            .on(t['listing-typesID'], t.parent)
            .where(sql`path = 'type'`),
        }))

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
      searchOverrides: {
        fields: ({ defaultFields }: { defaultFields: Field[] }) => [
          ...defaultFields,
          {
            name: 'description',
            type: 'textarea',
            admin: {
              readOnly: true,
            },
          },
          {
            name: 'address',
            type: 'text',
            admin: {
              readOnly: true,
            },
          },
          {
            name: 'cityName',
            type: 'text',
            admin: {
              readOnly: true,
            },
          },
        ],
      },
      beforeSync: async ({
        originalDoc,
        searchDoc,
        payload,
      }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        originalDoc: any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        searchDoc: any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload: any
      }) => {
        let cityName = ''

        // Get city name from the relationship
        if (originalDoc?.city) {
          try {
            const cityId =
              typeof originalDoc.city === 'object' ? originalDoc.city.id : originalDoc.city
            const city = await payload.findByID({
              collection: 'cities',
              id: cityId,
            })
            cityName = city?.name || ''
          } catch (error) {
            console.error('Error fetching city:', error)
          }
        }

        return {
          ...searchDoc,
          description: originalDoc?.description || '',
          address: originalDoc?.address || '',
          cityName,
        }
      },
    }),
  ],
  onInit: async (payload) => {
    console.log('[Feed] Initializing feed algorithm workers...')
    await flushCountersToDaily(payload)
    await aggregateDaily(payload)
    await rankSegments(payload)
    // Flush Redis counters to metrics_daily every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        await flushCountersToDaily(payload)
      } catch (error) {
        console.error('[Feed] Error in flushCountersToDaily cron:', error)
      }
    })

    // Compute aggregates every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        await aggregateDaily(payload)
      } catch (error) {
        console.error('[Feed] Error in aggregateDaily cron:', error)
      }
    })

    // Rank segments every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        await rankSegments(payload)
      } catch (error) {
        console.error('[Feed] Error in rankSegments cron:', error)
      }
    })

    console.log('[Feed] ✅ Feed workers scheduled (every 5 minutes)')
  },
})
