import { Access, PayloadRequest } from 'payload'
import type { Where } from 'payload'

export const isAdmin: Access = ({ req }: { req: PayloadRequest }): boolean =>
  req.user?.roles?.includes('admin') ?? false

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  return user.roles.includes('admin') || { id: { equals: user.id } }
}

// // Only admins and moderators
// export const isAdminOrModerator: Access = ({ req }) =>
//   req.user?.roles?.some((r) => ['admin', 'moderator'].includes(r)) ?? false

// Only owner or admin
export const isOwnerOrAdmin: Access = ({ req }) => {
  const user = req.user

  if (!user) return false
  const profileId = typeof user.profile === 'number' ? user.profile : user.profile?.id

  return user.roles.includes('admin') || { owner: { equals: profileId } }
}

// Public read, owner/admin write
export const publicReadOwnerOrAdminWrite: Access = ({ req }) => {
  if (!req.user) return false
  if (req.user.roles.includes('admin')) return true
  const profileId = typeof req.user.profile === 'number' ? req.user.profile : req.user.profile?.id

  return { owner: { equals: profileId } }
}

// Approved listings are public; draft listings only visible to their owner (or admins)
export const approvedOrOwnDraft: Access = ({ req }) => {
  const user = req.user

  if (user?.roles?.includes('admin')) return true

  const conditions: Where[] = [{ moderationStatus: { equals: 'approved' } }]

  if (user) {
    const profileId = typeof user.profile === 'number' ? user.profile : user.profile?.id
    if (profileId) {
      conditions.push({
        and: [{ moderationStatus: { in: ['draft', 'pending'] } }, { owner: { equals: profileId } }],
      })
    }
  }

  return { or: conditions }
}

// Ensure user has a specific role before creating
export const requireRole =
  (allowedRoles: ('host' | 'admin' | 'organizer' | 'provider' | 'client')[]): Access =>
  ({ req }) => {
    const user = req.user

    if (!user) {
      return false // must be logged in
    }
    if (user.roles?.includes('admin')) {
      return true // admin override
    }
    const hasRole = allowedRoles.some((r) => user.roles?.includes(r))
    return hasRole
  }

export const isLoggedIn: Access = ({ req }) => !!req.user
