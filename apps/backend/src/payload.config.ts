// storage-adapter-import-placeholder
import { postgresAdapter, sql } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, Field } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { r2Adapter } from './utils/r2Adapter'
import { shouldUseCloudStorage } from './utils/storage'

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
import { Verifications } from './collections/Verifications'

import { incrementView } from './endpoints/recordViews'
import { initFeedSchedulers } from './schedulers/feed'
import { HomeConfig } from './collections/HomeConfig'
import { homeHandler } from './endpoints/homeListings'
import { HubSnapshots } from './collections/HubSnapshot'
import { registerBuildHubSnapshotScheduler } from './schedulers/buildHubSnapshot'
import { hubHandler } from './endpoints/hubEndpoint'
import { regenerateHubHandler } from './endpoints/regenerateHub'
import { ListingType } from './payload-types'
import { registerSyncListingTypeCountersScheduler } from './schedulers/syncListingTypeCounters'
import { registerSyncCityCountersScheduler } from './schedulers/syncCityCounters'
import { registerCleanupTempMediaScheduler } from './schedulers/cleanupTempMedia'
import { migrations } from './migrations'

import { getTaxonomies } from './endpoints/taxonomies'

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
    components: {
      graphics: {
        Logo: {
          path: './components/Logo.tsx',
          exportName: 'Logo',
        },
        Icon: {
          path: './components/Icon.tsx',
          exportName: 'Icon',
        },
      },
    },
    meta: {
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/logo-unevent-favicon-white-on-black.png',
        },
        {
          rel: 'apple-touch-icon',
          type: 'image/png',
          url: '/logo-unevent-favicon-white-on-black.png',
        },
      ],
    },
  },
  cors: {
    origins: [
      'http://localhost:3000',
      'http://172.20.10.9:3000',
      'https://un-event-frontend-olive.vercel.app',
    ],
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
    {
      path: '/home',
      method: 'get',
      handler: homeHandler,
    },
    {
      path: '/increment-view',
      method: 'post',
      handler: incrementView,
    },
    {
      path: '/hub',
      method: 'get',
      handler: hubHandler,
    },
    {
      path: '/regenerate-hub',
      method: 'get',
      handler: regenerateHubHandler,
    },
    {
      path: '/taxonomies',
      method: 'get',
      handler: getTaxonomies,
    },
  ],
  collections: [
    Users,
    Media,
    Profiles,
    Verifications,
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
    HubSnapshots,
  ],
  globals: [HomeConfig],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Use migrations for schema changes (generate with: pnpm migrate:create <name>)
    // Push mode is fallback only if no migrations exist (for first deployment without migrations)
    // Set MIGRATE_PUSH=true only as fallback - prefer generating migrations instead
    push: process.env.MIGRATE_PUSH === 'true',
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: migrations, // ⭐ THIS RUNS SCHEMA CREATION

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
    // Cloud Storage Plugin (R2) - only enabled when R2 credentials are configured
    // Phase 1: Uses public bucket for all files. Private bucket routing will be added in Phase 2.
    ...(shouldUseCloudStorage()
      ? [
          cloudStoragePlugin({
            collections: {
              media: {
                adapter: r2Adapter,

                prefix: 'media',
              },
            },
          }),
        ]
      : []),
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
            name: 'type',
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
        if (originalDoc?.city && payload.collection !== 'profiles') {
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

        if (originalDoc?.type?.length) {
          try {
            // Extract IDs from type array (handles both populated objects and plain IDs)
            const typeIds = originalDoc.type
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((item: any) => {
                if (typeof item === 'object' && item !== null && 'id' in item) {
                  return item.id
                }
                return item
              })
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((id: any) => id != null)

            if (typeIds.length > 0) {
              const result = await payload.find({
                collection: 'listing-types',
                where: { id: { in: typeIds } },
                depth: 0,
                limit: 100,
              })
              const labels = result.docs.map((d: ListingType) => d?.title).filter(Boolean)
              searchDoc.type = labels // keep as array in index
            } else {
              searchDoc.type = []
            }
          } catch (e) {
            console.error('Error fetching listing-types:', e)
            searchDoc.type = []
          }
        } else {
          searchDoc.type = []
        }

        return {
          ...searchDoc,
          title: originalDoc?.title || '',
          description: originalDoc?.description || '',
          address: originalDoc?.address || '',
          cityName: cityName || '',
          type: searchDoc.type || [],
        }
      },
    }),
  ],
  onInit: async (payload) => {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_JOBS === 'true') {
      initFeedSchedulers(payload)
      // hourly, staggered minutes
      registerBuildHubSnapshotScheduler(payload)
      registerSyncListingTypeCountersScheduler(payload)
      registerSyncCityCountersScheduler(payload)
      registerCleanupTempMediaScheduler(payload)
    }
  },
})
