import { GlobalConfig } from 'payload'

export const HomeConfig: GlobalConfig = {
  slug: 'homeListings',
  admin: {
    group: 'Listings',
    description: 'Listings displayed on the home page',
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
