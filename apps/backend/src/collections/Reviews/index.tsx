import { CollectionConfig } from 'payload'
import { isOwnerOrAdmin, isLoggedIn } from '../_access/roles'
import { attachOwner } from './hooks/beforeChange/attachOwner'
import { recalcReviewAggregates } from './hooks/afterOperation/recalcReviewAggregates'
import { notifyReviewModeration } from './hooks/afterChange/notifyReviewModeration'
import { notifyListingOwnerNewReview } from './hooks/afterChange/notifyListingOwnerNewReview'
import { notifyAdminNewReview } from './hooks/afterChange/notifyAdminNewReview'

export const kindOptions = ['locations', 'events', 'services'] as const
export type Kind = (typeof kindOptions)[number]

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'id',
    group: 'Engagement',
  },
  access: {
    read: () => true,
    create: ({ req }) => isLoggedIn({ req }),
    update: ({ req }) => isOwnerOrAdmin({ req }),
    delete: ({ req }) => isOwnerOrAdmin({ req }),
  },
  hooks: {
    beforeChange: [attachOwner],
    afterChange: [notifyReviewModeration, notifyListingOwnerNewReview, notifyAdminNewReview],
    afterOperation: [recalcReviewAggregates],
  },
  timestamps: true,
  fields: [
    {
      name: 'listing',
      type: 'relationship',
      relationTo: ['locations', 'events', 'services'],
      required: true,
      maxDepth: 0,
      index: true,
    },
    {
      name: 'listingType',
      type: 'select',
      options: ['locations', 'events', 'services'],
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'profiles',
      required: true,
      maxDepth: 1,
    },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'approved', 'rejected'],
      defaultValue: 'pending',
      index: true,
      admin: {
        description: 'Status of the review',
        position: 'sidebar',
      },
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
      admin: { condition: (data) => data?.status === 'rejected', position: 'sidebar' },
    },

    {
      name: 'comment',
      type: 'textarea',
      admin: {
        description: 'Comment of the review',
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: true,
      index: true,
      admin: {
        description: 'Rating of the review',
      },
    },
    // Add this after the existing rating field
    {
      name: 'criteriaRatings',
      type: 'array',
      required: false,
      admin: {
        description: 'Detailed rating criteria (optional)',
      },
      fields: [
        {
          name: 'criteria',
          type: 'select',
          required: true,
          options: [
            // Dynamic options based on listingType could be implemented via hooks
            // For now, provide common criteria that can be filtered client-side
            { label: 'Cleanliness', value: 'cleanliness' },
            { label: 'Location', value: 'location' },
            { label: 'Amenities', value: 'amenities' },
            { label: 'Organization', value: 'organization' },
            { label: 'Entertainment', value: 'entertainment' },
            { label: 'Value', value: 'value' },
            { label: 'Quality', value: 'quality' },
            { label: 'Timeliness', value: 'timeliness' },
            { label: 'Communication', value: 'communication' },
          ],
        },
        {
          name: 'rating',
          type: 'number',
          min: 1,
          max: 5,
          required: true,
        },
      ],
    },
  ],
}
