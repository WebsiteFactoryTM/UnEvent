import { PayloadHandler, PayloadRequest } from 'payload'
import { z } from 'zod'

const ChangeRoleSchema = z.object({
  role: z.enum(['organizer', 'host', 'provider', 'client']),
  action: z.enum(['add', 'remove']),
})

const ALLOWED_ROLES = ['organizer', 'host', 'provider'] as const
const CLIENT_ROLE = 'client'

export const changeRole: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const { user } = req
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const body = (await req.json?.()) ?? req.body
    const { role, action } = ChangeRoleSchema.parse(body)

    // Users cannot remove client role if they have other roles
    if (role === CLIENT_ROLE && action === 'remove') {
      const currentRoles = Array.isArray(user.roles) ? [...user.roles] : []
      const privilegedRoles = currentRoles.filter((r): r is (typeof ALLOWED_ROLES)[number] =>
        ALLOWED_ROLES.includes(r as (typeof ALLOWED_ROLES)[number]),
      )
      if (privilegedRoles.length > 0) {
        return new Response(
          JSON.stringify({
            error: 'Cannot remove client role while having other roles',
          }),
          { status: 400 },
        )
      }
    }

    // Get current user roles
    const currentUser = await req.payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
    })

    if (!currentUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    const currentRoles = Array.isArray(currentUser.roles) ? [...currentUser.roles] : []
    let newRoles: string[] = []

    if (action === 'add') {
      // Add role if not already present
      if (currentRoles.includes(role)) {
        return new Response(JSON.stringify({ error: `User already has role: ${role}` }), {
          status: 400,
        })
      }
      newRoles = [...currentRoles, role]
    } else {
      // Remove role
      if (!currentRoles.includes(role)) {
        return new Response(JSON.stringify({ error: `User does not have role: ${role}` }), {
          status: 400,
        })
      }
      newRoles = currentRoles.filter((r) => r !== role)
    }

    // Ensure client role is present if user has privileged roles
    // This will be handled by ensureBaseClientRole hook, but we can also do it here
    const privilegedRoles = newRoles.filter((r): r is (typeof ALLOWED_ROLES)[number] =>
      ALLOWED_ROLES.includes(r as (typeof ALLOWED_ROLES)[number]),
    )
    if (privilegedRoles.length > 0 && !newRoles.includes(CLIENT_ROLE)) {
      newRoles.push(CLIENT_ROLE)
    }

    // Prevent duplicates
    newRoles = Array.from(new Set(newRoles))

    // Update user roles
    const updatedUser = await req.payload.update({
      collection: 'users',
      id: user.id,
      data: {
        roles: newRoles as ('organizer' | 'host' | 'provider' | 'client' | 'admin')[],
      },
      depth: 0,
    })

    return new Response(
      JSON.stringify({
        user: updatedUser,
        message: `Role ${action === 'add' ? 'added' : 'removed'} successfully`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request data',
          errors: err.issues,
        }),
        { status: 400 },
      )
    }
    const errMsg = err instanceof Error ? err.message : 'Failed to change role'
    return new Response(JSON.stringify({ error: errMsg }), { status: 500 })
  }
}
