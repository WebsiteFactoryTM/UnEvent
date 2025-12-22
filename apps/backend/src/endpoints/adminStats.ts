import { CollectionSlug, Payload, PayloadHandler, PayloadRequest, Where } from 'payload'
import * as Sentry from '@sentry/nextjs'

interface ListingTypeStats {
  // By moderation status
  approved: number
  pending: number
  rejected: number
  draft: number
  // By claim status
  claimed: number
  unclaimed: number
  // By verified status
  verified: number
  verificationPending: number
  notVerified: number
  // By tier
  tierNew: number
  tierStandard: number
  tierSponsored: number
  tierRecommended: number
  // Total
  total: number
}

interface AdminStats {
  locations: ListingTypeStats
  events: ListingTypeStats
  services: ListingTypeStats
  moderationQueue: {
    pendingClaims: number
    pendingReviews: number
    pendingVerifications: number
  }
  platformGrowth: {
    totalUsers: number
    totalProfiles: number
    totalReviews: number
    totalFavorites: number
  }
}

// Helper function to efficiently count documents
async function countDocs(
  payload: Payload,
  collection: CollectionSlug,
  where?: Where,
): Promise<number> {
  const result = await payload.count({
    collection,
    where: where || {},
  })
  return result.totalDocs ?? 0
}

// Helper function to get all stats for a listing type
async function getListingTypeStats(
  payload: Payload,
  collection: 'locations' | 'events' | 'services',
): Promise<ListingTypeStats> {
  const [
    approved,
    pending,
    rejected,
    draft,
    claimed,
    unclaimed,
    verified,
    verificationPending,
    notVerified,
    tierNew,
    tierStandard,
    tierSponsored,
    tierRecommended,
    total,
  ] = await Promise.all([
    // By moderation status
    countDocs(payload, collection, {
      moderationStatus: { equals: 'approved' },
      deletedAt: { exists: false },
    }),
    countDocs(payload, collection, {
      moderationStatus: { equals: 'pending' },
      deletedAt: { exists: false },
    }),
    countDocs(payload, collection, {
      moderationStatus: { equals: 'rejected' },
      deletedAt: { exists: false },
    }),
    countDocs(payload, collection, {
      moderationStatus: { equals: 'draft' },
      deletedAt: { exists: false },
    }),
    // By claim status
    countDocs(payload, collection, {
      claimStatus: { equals: 'claimed' },
      deletedAt: { exists: false },
    }),
    countDocs(payload, collection, {
      claimStatus: { equals: 'unclaimed' },
      deletedAt: { exists: false },
    }),
    // By verified status
    countDocs(payload, collection, {
      verifiedStatus: { equals: 'approved' },
      deletedAt: { exists: false },
    }),
    countDocs(payload, collection, {
      verifiedStatus: { equals: 'pending' },
      deletedAt: { exists: false },
    }),
    countDocs(payload, collection, {
      verifiedStatus: { in: ['none', 'rejected'] },
      deletedAt: { exists: false },
    }),
    // By tier
    countDocs(payload, collection, {
      tier: { equals: 'new' },
      deletedAt: { exists: false },
    }),
    countDocs(payload, collection, {
      tier: { equals: 'standard' },
      deletedAt: { exists: false },
    }),
    countDocs(payload, collection, {
      tier: { equals: 'sponsored' },
      deletedAt: { exists: false },
    }),
    countDocs(payload, collection, {
      tier: { equals: 'recommended' },
      deletedAt: { exists: false },
    }),
    // Total (excluding soft-deleted)
    countDocs(payload, collection, {
      deletedAt: { exists: false },
    }),
  ])

  return {
    approved,
    pending,
    rejected,
    draft,
    claimed,
    unclaimed,
    verified,
    verificationPending,
    notVerified,
    tierNew,
    tierStandard,
    tierSponsored,
    tierRecommended,
    total,
  }
}

export const adminStatsHandler: PayloadHandler = async (req: PayloadRequest) => {
  const { payload } = req

  try {
    // Fetch stats for each listing type in parallel
    const [
      locations,
      events,
      services,
      pendingClaims,
      pendingReviews,
      pendingVerifications,
      totalUsers,
      totalProfiles,
      totalReviews,
      totalFavorites,
    ] = await Promise.all([
      getListingTypeStats(payload, 'locations'),
      getListingTypeStats(payload, 'events'),
      getListingTypeStats(payload, 'services'),
      countDocs(payload, 'claims', { status: { equals: 'pending' } }),
      countDocs(payload, 'reviews', { status: { equals: 'pending' } }),
      countDocs(payload, 'verifications', { status: { equals: 'pending' } }),
      countDocs(payload, 'users', {}),
      countDocs(payload, 'profiles', {}),
      countDocs(payload, 'reviews', { status: { equals: 'approved' } }),
      countDocs(payload, 'favorites', {}),
    ])

    const stats: AdminStats = {
      locations,
      events,
      services,
      moderationQueue: {
        pendingClaims,
        pendingReviews,
        pendingVerifications,
      },
      platformGrowth: {
        totalUsers,
        totalProfiles,
        totalReviews,
        totalFavorites,
      },
    }

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('[adminStats] Error fetching stats:', error)

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', 'admin-stats')
        scope.setContext('request', {
          method: 'GET',
        })
        if (req.user) {
          scope.setUser({
            id: String(req.user.id),
            email: req.user.email,
          })
        }
        Sentry.captureException(error)
      })
    }

    return new Response(JSON.stringify({ error: 'Failed to fetch admin statistics' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
