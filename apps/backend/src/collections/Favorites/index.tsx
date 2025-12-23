// src/collections/favorites.ts
import type { CollectionConfig } from 'payload'
import { buildTargetKeyHook } from './hooks/beforeValidate/buildTargetKey'
import { bumpAggregatesFavorites } from './hooks/afterChange/bumpAggregatesFavorites'
import { retractAggregatesFavorites } from './hooks/afterDelete/retractAggregatesFavorites'
import { isAdminOrSelf } from '../_access/roles'
import { toggleFavorites } from './endpoints/toggleFavorites'
import { checkIfIsFavorited } from './endpoints/checkIfIsFavorited'
import { checkBatchFavorites } from './endpoints/checkBatchFavorites'
import { getUserFavorites } from './endpoints/getUserFavorites'
import { syncAnonymousFavorites } from './endpoints/syncAnonymousFavorites'

export const kindOptions = ['locations', 'events', 'services'] as const
export type Kind = (typeof kindOptions)[number]

export const Favorites: CollectionConfig = {
  slug: 'favorites',
  admin: { useAsTitle: 'targetKey', group: 'Engagement' },
  timestamps: true,
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
    {
      path: '/checkIfIsFavorited',
      method: 'get',
      handler: checkIfIsFavorited,
    },
    {
      path: '/checkBatch',
      method: 'get',
      handler: checkBatchFavorites,
    },
    {
      path: '/getUserFavorites',
      method: 'get',
      handler: getUserFavorites,
    },
    {
      path: '/syncAnonymousFavorites',
      method: 'post',
      handler: syncAnonymousFavorites,
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
      maxDepth: 2, // Allow population for getUserFavorites endpoint
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
