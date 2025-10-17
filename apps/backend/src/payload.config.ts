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
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
