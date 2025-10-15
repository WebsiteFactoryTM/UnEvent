import { Access, PayloadRequest } from 'payload'

export const isAdmin: Access = ({ req }: { req: PayloadRequest }): boolean =>
  req.user?.roles?.includes('admin') ?? false

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  return user.roles.includes('admin') || { user: { equals: user.id } }
}
