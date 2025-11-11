import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/collections/_access/roles'
import { updateUserRoles } from './hooks/afterChange/updateUserRoles'
import { updateMemberSince } from './hooks/beforeChange/updateMemberSince'
import { linkProfileToUserAfterChange } from './hooks/afterOperation/linkProfileToUser'
import { updateUserAvatar } from './hooks/afterChange/updateUserAvatar'

import { createSlugField } from '../../utils/slugifySlug'
import type { Profile } from '@/payload-types'
import { updateUserDisplayName } from './hooks/afterChange/updateUserDisplayName'
import { markAvatarPermanent } from './hooks/afterChange/markAvatarPermanent'

export const Profiles: CollectionConfig = {
  slug: 'profiles',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'verified', 'createdAt'],
  },
  access: {
    create: ({ req }) => isAdmin({ req }), // Only admins can create profiles directly
    read: () => true, // Profiles remain public
    update: ({ req }) => {
      if (!req.user) return false
      if (isAdmin({ req })) return true
      return {
        user: {
          equals: req.user.id,
        },
      }
    },
    delete: ({ req }) => isAdmin({ req }),
  },
  hooks: {
    beforeChange: [updateMemberSince],
    afterChange: [updateUserRoles, updateUserAvatar, updateUserDisplayName, markAvatarPermanent],
    afterOperation: [linkProfileToUserAfterChange],
  },
  timestamps: true,
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier',
      },
      hooks: { beforeValidate: [createSlugField<Profile>('name')] },
    },
    {
      name: 'userType',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Organizer', value: 'organizer' },
        { label: 'Host / Venue Owner', value: 'host' },
        { label: 'Service Provider', value: 'provider' },
        { label: 'Client / Attendee', value: 'client' },
      ],
      defaultValue: ['client'],
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Full name or business name',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Profile avatar',
      },
    },
    {
      name: 'verifiedStatus',
      type: 'select',
      options: ['none', 'pending', 'approved', 'rejected'],
      defaultValue: 'none',
      index: true,
      admin: { position: 'sidebar', description: 'Verification status' },
    },
    { name: 'verification', type: 'relationship', relationTo: 'verifications' },
    {
      name: 'displayName',
      type: 'text',
      admin: {
        description: 'Display name',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Short bio or tagline',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Primary contact number',
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Personal or business website',
      },
    },
    {
      name: 'city',
      type: 'text',
      admin: {
        description: 'Primary city of operation',
      },
    },
    {
      name: 'socialMedia',
      type: 'group',
      fields: [
        {
          name: 'facebook',
          type: 'text',
          admin: {
            description: 'Facebook profile/page URL',
          },
        },
        {
          name: 'instagram',
          type: 'text',
          admin: {
            description: 'Instagram profile URL',
          },
        },
        {
          name: 'linkedin',
          type: 'text',
          admin: {
            description: 'LinkedIn profile URL',
          },
        },
        {
          name: 'youtube',
          type: 'text',
          admin: {
            description: 'YouTube channel URL',
          },
        },
        {
          name: 'tiktok',
          type: 'text',
          admin: {
            description: 'TikTok profile URL',
          },
        },
        {
          name: 'twitch',
          type: 'text',
          admin: {
            description: 'Twitch profile URL',
          },
        },
        {
          name: 'x',
          type: 'text',
          admin: {
            description: 'X profile URL',
          },
        },
      ],
    },

    {
      name: 'rating',
      type: 'group',
      fields: [
        {
          name: 'average',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'count',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'favorites',
      type: 'relationship',
      relationTo: 'favorites',
      hasMany: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'memberSince',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastOnline',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'views',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
  ],
}
