import { tag } from '@unevent/shared'
import { revalidate } from '@/utils/revalidate'
import { purgeCDN } from '@/utils/purgeCDN'
import type { GlobalConfig } from 'payload'

export const HomeConfig: GlobalConfig = {
  slug: 'homeListings',
  admin: {
    group: 'Listings',
    description: 'Listings displayed on the home page',
  },
  hooks: {
    afterChange: [
      async ({ req, doc, previousDoc }) => {
        // Revalidate home page when HomeConfig changes
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenant = (req as any)?.tenant || 'unevent'
        const tags = [
          tag.tenant(tenant),
          tag.homeSnapshot(),
          tag.home(), // Legacy broad tag
        ]

        // 1) Revalidate Next (Vercel edge/data cache)
        await revalidate({ tags, payload: req.payload })

        // 2) Optional: purge CDN (Cloudflare) by tag
        await purgeCDN(tags)
      },
    ],
  },

  fields: [
    {
      name: 'featuredLocations',
      type: 'relationship',
      relationTo: 'locations',
      hasMany: true,
      filterOptions: {
        moderationStatus: { equals: 'approved' },
      },
    },
    {
      name: 'topServices',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      filterOptions: {
        moderationStatus: { equals: 'approved' },
      },
    },
    {
      name: 'upcomingEvents',
      type: 'relationship',
      relationTo: 'events',
      hasMany: true,
      filterOptions: {
        moderationStatus: { equals: 'approved' },
      },
    },
  ],
}
