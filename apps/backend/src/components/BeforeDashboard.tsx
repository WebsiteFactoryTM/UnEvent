'use client'

import { useConfig } from '@payloadcms/ui'
import { Pill } from '@payloadcms/ui/elements/Pill'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import '../app/(payload)/custom.scss'

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

interface StatCardProps {
  title: string
  value: number
  link?: string
  highlight?: boolean
}

const StatCard: React.FC<StatCardProps> = ({ title, value, link, highlight = false }) => {
  const content = (
    <div className="stat-card-content">
      <div className="stat-card__title">{title}</div>
      <div className="stat-card__value">{value.toLocaleString()}</div>
    </div>
  )

  return (
    <div className="stat-card-wrapper">
      <Pill pillStyle={highlight ? 'warning' : 'light'} to={link} className="stat-card-pill">
        {content}
      </Pill>
    </div>
  )
}

interface StatGroupProps {
  title: string
  children: React.ReactNode
}

const StatGroup: React.FC<StatGroupProps> = ({ title, children }) => {
  return (
    <div className="stat-group">
      <h3 className="stat-group__title">{title}</h3>
      <div className="stat-group__grid">{children}</div>
    </div>
  )
}

interface ListingTypeTableProps {
  title: string
  collectionSlug: 'locations' | 'events' | 'services'
  stats: ListingTypeStats
}

const ListingTypeTable: React.FC<ListingTypeTableProps> = ({ title, collectionSlug, stats }) => {
  const tableData = [
    {
      category: 'Moderation',
      stats: [
        {
          label: 'Approved',
          value: stats.approved,
          link: `/admin/collections/${collectionSlug}?where[moderationStatus][equals]=approved`,
          highlight: false,
        },
        {
          label: 'Pending',
          value: stats.pending,
          link: `/admin/collections/${collectionSlug}?where[moderationStatus][equals]=pending`,
          highlight: stats.pending > 0,
        },
        {
          label: 'Rejected',
          value: stats.rejected,
          link: `/admin/collections/${collectionSlug}?where[moderationStatus][equals]=rejected`,
          highlight: false,
        },
        {
          label: 'Draft',
          value: stats.draft,
          link: `/admin/collections/${collectionSlug}?where[moderationStatus][equals]=draft`,
          highlight: false,
        },
      ],
    },
    {
      category: 'Claim',
      stats: [
        {
          label: 'Claimed',
          value: stats.claimed,
          link: `/admin/collections/${collectionSlug}?where[claimStatus][equals]=claimed`,
          highlight: false,
        },
        {
          label: 'Unclaimed',
          value: stats.unclaimed,
          link: `/admin/collections/${collectionSlug}?where[claimStatus][equals]=unclaimed`,
          highlight: false,
        },
      ],
    },
    {
      category: 'Verification',
      stats: [
        {
          label: 'Verified',
          value: stats.verified,
          link: `/admin/collections/${collectionSlug}?where[verifiedStatus][equals]=approved`,
          highlight: false,
        },
        {
          label: 'Pending',
          value: stats.verificationPending,
          link: `/admin/collections/${collectionSlug}?where[verifiedStatus][equals]=pending`,
          highlight: stats.verificationPending > 0,
        },
        {
          label: 'Not Verified',
          value: stats.notVerified,
          link: `/admin/collections/${collectionSlug}?where[verifiedStatus][in]=none,rejected`,
          highlight: false,
        },
      ],
    },
    {
      category: 'Tier',
      stats: [
        {
          label: 'New',
          value: stats.tierNew,
          link: `/admin/collections/${collectionSlug}?where[tier][equals]=new`,
          highlight: false,
        },
        {
          label: 'Standard',
          value: stats.tierStandard,
          link: `/admin/collections/${collectionSlug}?where[tier][equals]=standard`,
          highlight: false,
        },
        {
          label: 'Sponsored',
          value: stats.tierSponsored,
          link: `/admin/collections/${collectionSlug}?where[tier][equals]=sponsored`,
          highlight: false,
        },
        {
          label: 'Recommended',
          value: stats.tierRecommended,
          link: `/admin/collections/${collectionSlug}?where[tier][equals]=recommended`,
          highlight: false,
        },
      ],
    },
  ]

  return (
    <div className="listing-type-table">
      <div className="listing-table__header">
        <h3 className="listing-table__title">{title}</h3>
        <Pill pillStyle="light-gray" size="small">
          Total: {stats.total.toLocaleString()}
        </Pill>
      </div>
      <div className="listing-table__scroll">
        <table className="listing-table">
          <thead>
            <tr>
              {tableData.map((col) => (
                <th key={col.category}>{col.category}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(...tableData.map((d) => d.stats.length)) }).map(
              (_, rowIndex) => (
                <tr key={rowIndex}>
                  {tableData.map((col) => {
                    const stat = col.stats[rowIndex]
                    if (!stat) {
                      return <td key={col.category} />
                    }
                    return (
                      <td key={col.category} className={stat.highlight ? 'highlight' : ''}>
                        <Link
                          href={stat.link}
                          className={`listing-table-cell ${stat.highlight ? 'highlight' : ''}`}
                        >
                          <span className="listing-table-cell__label">{stat.label}</span>
                          <span
                            className={`listing-table-cell__value ${stat.highlight ? 'highlight' : ''}`}
                          >
                            {stat.value.toLocaleString()}
                          </span>
                        </Link>
                      </td>
                    )
                  })}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Simple cache for admin stats (shared across component instances)
const statsCache = {
  data: null as AdminStats | null,
  timestamp: 0,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
}

export const BeforeDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(statsCache.data)
  const [loading, setLoading] = useState(!statsCache.data)
  const [error, setError] = useState<string | null>(null)

  const {
    config: { serverURL },
  } = useConfig()

  useEffect(() => {
    const fetchStats = async () => {
      const now = Date.now()
      const isStale = now - statsCache.timestamp > statsCache.CACHE_DURATION

      // If we have cached data and it's not stale, use it immediately
      if (statsCache.data && !isStale) {
        setStats(statsCache.data)
        setLoading(false)
        // Still refetch in background to keep cache fresh
        fetchStatsInBackground()
        return
      }

      // Otherwise, fetch immediately
      try {
        setLoading(true)
        const response = await fetch(`${serverURL}/api/admin/stats`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }

        const data = await response.json()

        // Update cache
        statsCache.data = data
        statsCache.timestamp = Date.now()

        setStats(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics')
        console.error('[BeforeDashboard] Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    const fetchStatsInBackground = async () => {
      try {
        const response = await fetch(`${serverURL}/api/admin/stats`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          statsCache.data = data
          statsCache.timestamp = Date.now()
          setStats(data)
        }
      } catch (err) {
        // Silently fail background refresh
        console.error('[BeforeDashboard] Background refresh failed:', err)
      }
    }

    fetchStats()
  }, [serverURL])

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard statistics...</div>
  }

  if (error) {
    return <div className="dashboard-error">Error loading statistics: {error}</div>
  }

  if (!stats) {
    return null
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Platform Overview</h2>

      {/* Listing Type Tables */}
      <ListingTypeTable title="Locations" collectionSlug="locations" stats={stats.locations} />
      <ListingTypeTable title="Events" collectionSlug="events" stats={stats.events} />
      <ListingTypeTable title="Services" collectionSlug="services" stats={stats.services} />

      {/* Moderation Queue */}
      <StatGroup title="Moderation Queue">
        <StatCard
          title="Pending Claims"
          value={stats.moderationQueue.pendingClaims}
          link="/admin/collections/claims?where[status][equals]=pending"
          highlight={stats.moderationQueue.pendingClaims > 0}
        />
        <StatCard
          title="Pending Reviews"
          value={stats.moderationQueue.pendingReviews}
          link="/admin/collections/reviews?where[status][equals]=pending"
          highlight={stats.moderationQueue.pendingReviews > 0}
        />
        <StatCard
          title="Pending Verifications"
          value={stats.moderationQueue.pendingVerifications}
          link="/admin/collections/verifications?where[status][equals]=pending"
          highlight={stats.moderationQueue.pendingVerifications > 0}
        />
      </StatGroup>

      {/* Platform Growth */}
      <StatGroup title="Platform Growth">
        <StatCard
          title="Total Users"
          value={stats.platformGrowth.totalUsers}
          link="/admin/collections/users"
        />
        <StatCard
          title="Total Profiles"
          value={stats.platformGrowth.totalProfiles}
          link="/admin/collections/profiles"
        />
        <StatCard
          title="Approved Reviews"
          value={stats.platformGrowth.totalReviews}
          link="/admin/collections/reviews?where[status][equals]=approved"
        />
        <StatCard
          title="Total Favorites"
          value={stats.platformGrowth.totalFavorites}
          link="/admin/collections/favorites"
        />
      </StatGroup>
    </div>
  )
}
