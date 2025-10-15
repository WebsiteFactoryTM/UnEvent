import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/roles'
import { updateUserRolesOnProfileUserTypeChange } from './hooks/updateUserRolesOnProfileUserTypeChange'
import { linkUserIdAndMemberSince } from './hooks/linkUserIdAndMemberSince'

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
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      admin: {
        readOnly: true,
      },
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
      name: 'verified',
      type: 'group',
      fields: [
        {
          name: 'status',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'Not Verified', value: 'none' },
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
          ],
        },
        {
          name: 'documents',
          type: 'array',
          fields: [
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'ID Card', value: 'id' },
                { label: 'Company Registration', value: 'company' },
                { label: 'Other', value: 'other' },
              ],
            },
            {
              name: 'file',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'notes',
              type: 'text',
            },
          ],
        },
        {
          name: 'verificationData',
          type: 'group',
          fields: [
            {
              name: 'fullName',
              type: 'text',
            },
            {
              name: 'address',
              type: 'text',
            },
            {
              name: 'isCompany',
              type: 'checkbox',
            },
            {
              name: 'companyName',
              type: 'text',
            },
            {
              name: 'cui',
              type: 'text',
            },
            {
              name: 'companyAddress',
              type: 'text',
            },
          ],
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
  hooks: {
    beforeChange: [linkUserIdAndMemberSince],
    afterChange: [updateUserRolesOnProfileUserTypeChange],
  },
  timestamps: true,
}
