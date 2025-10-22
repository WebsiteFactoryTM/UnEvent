import { isAdmin, isAdminOrSelf } from '@/collections/_access/roles'
import { createProfileAfterUserCreate } from './hooks/createProfileAfterUserCreate'
import type { CollectionConfig } from 'payload'
import { ensureBaseClientRole } from './hooks/ensureBaseClientRole'
import { deleteProfileUserDelete } from './hooks/deleteProfileAfterUserDelete'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  timestamps: true,
  access: {
    read: ({ req }) => !!req.user, // only logged-in users can read users
    update: ({ req }) => isAdminOrSelf({ req }), // must be logged in to update self (we can refine later)
    delete: ({ req }) => isAdmin({ req }),
    create: () => true, // allow public registration
  },
  auth: {
    // verify: true,
    maxLoginAttempts: 3,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
    {
      name: 'displayName',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'profile',
      type: 'relationship',
      relationTo: 'profiles',
      hasMany: false,
    },
    {
      name: 'avatarURL',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Organizer', value: 'organizer' },
        { label: 'Host / Venue Owner', value: 'host' },
        { label: 'Service Provider', value: 'provider' },
        { label: 'Client / Attendee', value: 'client' },
        { label: 'Admin', value: 'admin' },
      ],
      required: true,
      defaultValue: ['client'],
      saveToJWT: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending Verification', value: 'pending' },
        { label: 'Suspended', value: 'suspended' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'agreeTermsAndConditions',
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
    {
      name: 'agreePrivacyPolicy',
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
  ],
  hooks: {
    afterOperation: [createProfileAfterUserCreate],
    beforeValidate: [ensureBaseClientRole],
    beforeDelete: [deleteProfileUserDelete],
  },
}
