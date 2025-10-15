import type { CollectionBeforeValidateHook } from 'payload'

export const ensureBaseClientRole: CollectionBeforeValidateHook = async ({ data, operation }) => {
  if (operation !== 'create' && operation !== 'update') return data

  const roles = Array.isArray(data?.roles) ? [...data.roles] : []

  // Always include "client" if another role is chosen
  const privilegedRoles = ['provider', 'host', 'organizer']
  const hasPrivilegedRole = roles.some((r) => privilegedRoles.includes(r))
  if (hasPrivilegedRole && !roles.includes('client')) {
    roles.push('client')
  }

  // Prevent duplicates
  data!.roles = Array.from(new Set(roles))

  return data
}
