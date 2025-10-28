import { Access, PayloadRequest } from 'payload'

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

// Only approved listings visible publicly
export const approvedOnlyPublic: Access = ({ req }) => {
  if (req.user?.roles?.includes('admin')) return true
  return { status: { equals: 'approved' } }
}

// Ensure user has a specific role before creating
export const requireRole =
  (allowedRoles: ('host' | 'admin' | 'organizer' | 'provider' | 'client')[]): Access =>
  ({ req }) => {
    const user = req.user
    if (!user) return false // must be logged in
    if (user.roles?.includes('admin')) return true // admin override
    return allowedRoles.some((r) => user.roles?.includes(r))
  }

export const isLoggedIn: Access = ({ req }) => !!req.user
