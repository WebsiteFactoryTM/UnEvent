// src/collections/favorites.ts
import type { CollectionConfig } from 'payload'
import { buildTargetKeyHook } from './hooks/beforeValidate/buildTargetKey'
import { bumpAggregatesFavorites } from './hooks/afterChange/bumpAggregatesFavorites'
import { retractAggregatesFavorites } from './hooks/afterDelete/retractAggregatesFavorites'
import { isAdminOrSelf } from '../_access/roles'
import { toggleFavorites } from './endpoints/toggleFavorites'

export const kindOptions = ['locations', 'events', 'services'] as const
export type Kind = (typeof kindOptions)[number]

export const Favorites: CollectionConfig = {
  slug: 'favorites',
  admin: { useAsTitle: 'targetKey' },
  versions: false,
  access: {
    read: ({ req }) => isAdminOrSelf({ req }), // only logged-in users see theirs (tighten if needed)
    create: ({ req }) => isAdminOrSelf({ req }),
    update: () => false, // we treat toggle as create/delete
    delete: ({ req }) => isAdminOrSelf({ req }),
  },
  endpoints: [
    {
      path: '/toggle',
      method: 'post',
      handler: toggleFavorites,
    },
  ],
  hooks: {
    beforeValidate: [buildTargetKeyHook],
    afterOperation: [bumpAggregatesFavorites, retractAggregatesFavorites],
  },
  indexes: [
    // Enforce one favorite per user per target
    { fields: ['user', 'targetKey'], unique: true },
    { fields: ['kind'] },
  ],
  fields: [
    // who favorited
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'profiles',
      required: true,
      index: true,
      maxDepth: 0,
    },

    // what they favorited
    {
      name: 'target',
      type: 'relationship',
      relationTo: ['locations', 'events', 'services'],
      required: true,
      maxDepth: 0,
    },
    {
      name: 'kind',
      type: 'select',
      options: kindOptions.map((option) => ({ label: option, value: option })),
      required: true,
      index: true,
    },

    // derived key for fast uniqueness (user+targetKey)
    {
      name: 'targetKey',
      type: 'text',
      required: true,
      index: true,
      admin: { readOnly: true, hidden: true },
    },
  ],
}
