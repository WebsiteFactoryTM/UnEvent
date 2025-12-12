import type { CollectionConfig } from 'payload'
import { isAdmin } from '../_access/roles'
import { generateClaimToken } from './hooks/beforeChange/generateClaimToken'
import { setTimestamps } from './hooks/beforeChange/setTimestamps'
import { preventDuplicateClaim } from './hooks/beforeChange/preventDuplicateClaim'
import { normalizeListingField } from './hooks/beforeValidate/normalizeListingField'
import { createClaim } from './endpoints/createClaim'
import { getClaimByToken } from './endpoints/getClaimByToken'
import { associateProfile } from './endpoints/associateProfile'
import { transferOwnership } from './hooks/afterChange/transferOwnership'
import { notifyAdminNewClaim } from './hooks/afterChange/notifyAdminNewClaim'
import { notifyClaimant } from './hooks/afterChange/notifyClaimant'

export const Claims: CollectionConfig = {
  slug: 'claims',
  admin: {
    useAsTitle: 'claimToken',
    defaultColumns: ['claimToken', 'listing', 'claimantEmail', 'status', 'submittedAt'],
    group: 'Listings',
  },
  timestamps: true,
  endpoints: [
    {
      path: '/create',
      method: 'post',
      handler: createClaim,
    },
    {
      path: '/by-token',
      method: 'get',
      handler: getClaimByToken,
    },
    {
      path: '/associate-profile',
      method: 'patch',
      handler: associateProfile,
    },
  ],
  access: {
    read: ({ req }) => {
      // Admins can read all claims
      if (isAdmin({ req })) return true
      // Users can read their own claims
      if (req.user) {
        const profileId =
          typeof req.user?.profile === 'number' ? req.user?.profile : req.user?.profile?.id
        if (profileId) {
          return {
            claimantProfile: {
              equals: profileId,
            },
          }
        }
      }
      // Allow public read for specific queries (e.g., checking duplicates via hook)
      // This is safe because hooks run with admin context
      return false
    },
    create: () => true, // Public can create claims
    update: ({ req }) => isAdmin({ req }), // Only admins can update
    delete: ({ req }) => isAdmin({ req }), // Only admins can delete
  },
  hooks: {
    beforeValidate: [normalizeListingField],
    beforeChange: [preventDuplicateClaim, generateClaimToken, setTimestamps],
    afterChange: [transferOwnership, notifyAdminNewClaim, notifyClaimant],
  },
  indexes: [
    { fields: ['claimToken'], unique: true },
    // Note: 'listing' is a relationship field, indexed via rels table
    { fields: ['claimantProfile'] },
    { fields: ['status'] },
    { fields: ['listingType'] },
    // Compound index for common queries
    { fields: ['listingType', 'status'] },
  ],
  fields: [
    {
      name: 'listing',
      type: 'relationship',
      relationTo: ['locations', 'events', 'services'],
      required: true,
      index: true,
      admin: {
        description: 'The listing being claimed',
      },
    },
    {
      name: 'listingType',
      type: 'select',
      options: [
        { label: 'Locations', value: 'locations' },
        { label: 'Events', value: 'events' },
        { label: 'Services', value: 'services' },
      ],
      required: true,
      index: true,
      admin: {
        description: 'Type of listing',
      },
    },
    {
      name: 'claimantEmail',
      type: 'text',
      required: true,
      admin: {
        description: 'Email address of the person claiming the listing',
      },
    },
    {
      name: 'claimantName',
      type: 'text',
      admin: {
        description: 'Name of the person claiming the listing',
      },
    },
    {
      name: 'claimantPhone',
      type: 'text',
      admin: {
        description: 'Phone number of the person claiming the listing',
      },
    },
    {
      name: 'claimantProfile',
      type: 'relationship',
      relationTo: 'profiles',
      admin: {
        description: 'Profile associated with the claim (set after signup/login)',
      },
      maxDepth: 1,
    },
    {
      name: 'claimToken',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Unique token for linking claims to signup flow',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'pending',
      required: true,
      index: true,
      admin: {
        description: 'Status of the claim request',
      },
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
      admin: {
        condition: (data) => data?.status === 'rejected',
        description: 'Reason for rejection',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      admin: {
        description: 'When the claim was submitted',
        readOnly: true,
      },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      admin: {
        description: 'When the claim was reviewed',
        readOnly: true,
      },
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Admin who reviewed the claim',
      },
      maxDepth: 1,
    },
  ],
}
