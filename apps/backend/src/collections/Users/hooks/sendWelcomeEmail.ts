import type { CollectionAfterChangeHook } from 'payload'
import { enqueueNotification } from '@/utils/notificationsQueue'
import type { User } from '@/payload-types'

/**
 * Send welcome email when a new user is created
 * Uses the worker queue system for async email processing
 */
export const sendWelcomeEmail: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  // Only send on create
  if (operation !== 'create') {
    return
  }

  const user = doc as unknown as User

  // Skip if no email
  if (!user.email) {
    req.payload.logger.warn('[sendWelcomeEmail] User created without email, skipping')
    return
  }

  try {
    // Use frontend URL for email confirmation links
    // The frontend will handle the verification flow and call Payload's API
    const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL || 'http://localhost:3000'

    // PayloadCMS verification token handling:
    // - If auth.verify: true is enabled, Payload generates _verificationtoken automatically
    // - The token is NOT included in the doc object for security reasons
    // - We need to fetch it directly from the database using req.payload.findByID
    let confirmToken: string | null = null

    try {
      // Fetch the user with all fields including the verification token
      const userWithToken = await req.payload.findByID({
        collection: 'users',
        id: user.id,
        depth: 0,
        overrideAccess: true, // Need to override access to get the token
      })

      // Try both field name variations (camelCase and lowercase)
      // Payload may expose it as either _verificationToken or _verificationtoken
      const tokenUser = userWithToken as User & {
        _verificationToken?: string | null
        _verificationtoken?: string | null
      }
      confirmToken = tokenUser._verificationToken || tokenUser._verificationtoken || null

      if (!confirmToken) {
        req.payload.logger.warn(
          `[sendWelcomeEmail] No verification token found for user ${user.id} after fetching from DB. Make sure auth.verify: true is enabled.`,
        )
      }
    } catch (fetchError) {
      req.payload.logger.error(`[sendWelcomeEmail] Failed to fetch user token: ${fetchError}`)
    }

    // Construct confirmation URL pointing to frontend
    // Frontend should handle: /confirm-email?token=xxx and call Payload's /api/users/verify/:token
    const confirmUrl = confirmToken
      ? `${frontendUrl}/confirm-email?token=${confirmToken}`
      : `${frontendUrl}/confirm-email?userId=${user.id}` // Fallback if no token (shouldn't happen with verify: true)

    await enqueueNotification('user.welcome', {
      first_name: user.displayName || user.email.split('@')[0] || '',
      email: user.email,
      confirm_url: confirmUrl,
      support_email: process.env.SUPPORT_EMAIL || 'support@unevent.com',
    })

    req.payload.logger.info(
      `[sendWelcomeEmail] ✅ Enqueued welcome email for user ${user.id}${confirmToken ? ' (with token)' : ' (no token - user may need manual verification)'}`,
    )
  } catch (error) {
    // Don't throw - email failure shouldn't break user creation
    req.payload.logger.error(
      `[sendWelcomeEmail] ❌ Failed to enqueue welcome email for user ${user.id}:`,
      error,
    )
  }
}
