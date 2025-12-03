import type { CollectionAfterChangeHook } from 'payload'
import * as Sentry from '@sentry/nextjs'
import { enqueueNotification, type EmailEventType } from '@/utils/notificationsQueue'
import { Profile, User } from '@/payload-types'

/**
 * Send role-specific welcome emails after user verifies their email
 *
 * Logic:
 * - Every user is a "client" by default
 * - If user has ONLY "client" role → send user.welcome.client
 * - If user has any other role besides client → send welcome email(s) for those roles ONLY
 * - Multiple roles = multiple welcome emails (e.g., both host and organizer)
 */
export const newUserWelcomeEmail: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // Only trigger on update (when verification happens)
  if (operation !== 'update') {
    return
  }

  const user = doc as unknown as User
  const previousUser = previousDoc as unknown as User | undefined

  // Check if user was just verified (changed from false/null to true)
  const wasVerified = previousUser?._verified === true
  const isNowVerified = user._verified === true

  if (!isNowVerified || wasVerified) {
    // User is not verified, or was already verified before this update
    return
  }

  try {
    // User just got verified, send welcome email(s) based on their profile roles
    const profileId = typeof user.profile === 'number' ? user.profile : user.profile?.id

    if (!profileId) {
      req.payload.logger.warn(
        `[newUserWelcomeEmail] User ${user.id} has no profile - skipping welcome email`,
      )
      return
    }

    // Fetch profile to get userType roles
    let profile: Profile
    try {
      profile = await req.payload.findByID({
        collection: 'profiles',
        id: profileId,
      })

      if (!profile) {
        req.payload.logger.warn(
          `[newUserWelcomeEmail] Profile ${profileId} not found for user ${user.id}`,
        )
        return
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      req.payload.logger.error(
        `[newUserWelcomeEmail] Failed to fetch profile ${profileId} for user ${user.id}:`,
        errorMessage,
      )
      if (err instanceof Error) {
        Sentry.withScope((scope) => {
          scope.setTag('hook', 'newUserWelcomeEmail')
          scope.setTag('operation', 'fetch_profile')
          scope.setTag('user_id', String(user.id))
          scope.setTag('profile_id', String(profileId))
          scope.setContext('user', {
            id: user.id,
            email: user.email,
            profileId,
          })
          Sentry.captureException(err)
        })
      }
      return
    }

    // Get user types from profile
    const userTypes = profile.userType || []

    // Determine which welcome emails to send
    // Logic: if user has roles other than "client", exclude "client" from the list
    const hasNonClientRoles = userTypes.some((type) => type !== 'client')
    const rolesToNotify = hasNonClientRoles
      ? userTypes.filter((type) => type !== 'client')
      : userTypes.includes('client')
        ? ['client']
        : []

    if (rolesToNotify.length === 0) {
      req.payload.logger.warn(
        `[newUserWelcomeEmail] User ${user.id} has no valid roles to send welcome email`,
      )
      return
    }

    // Get user's first name from profile or user
    const firstName =
      profile.displayName || profile.name || user.displayName || user.email.split('@')[0]

    // Dashboard URL
    const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
    const supportEmail = process.env.SUPPORT_EMAIL || 'contact@unevent.com'

    // Send welcome email for each role
    const emailPromises = rolesToNotify.map(async (userType) => {
      let eventType: EmailEventType
      if (userType === 'client') {
        eventType = 'user.welcome.client'
      } else if (userType === 'host') {
        eventType = 'user.welcome.host'
      } else if (userType === 'organizer') {
        eventType = 'user.welcome.organizer'
      } else if (userType === 'provider') {
        eventType = 'user.welcome.provider'
      } else {
        req.payload.logger.warn(
          `[newUserWelcomeEmail] Unknown user type ${userType} for user ${user.id}`,
        )
        return
      }

      // Determine dashboard URL based on role
      let dashboardUrl = frontendUrl
      if (userType === 'host') {
        dashboardUrl = `${frontendUrl}/cont/locatii-mele`
      } else if (userType === 'organizer') {
        dashboardUrl = `${frontendUrl}/cont/evenimente-mele`
      } else if (userType === 'provider') {
        dashboardUrl = `${frontendUrl}/cont/servicii-mele`
      }

      try {
        const result = await enqueueNotification(eventType, {
          first_name: firstName,
          email: user.email,
          user_type: userType,
          dashboard_url: dashboardUrl,
          support_email: supportEmail,
        })

        if (result.id) {
          req.payload.logger.info(
            `[newUserWelcomeEmail] ✅ Enqueued ${eventType} for user ${user.id} (job: ${result.id})`,
          )
        } else {
          req.payload.logger.warn(
            `[newUserWelcomeEmail] ⚠️ Skipped ${eventType} for user ${user.id} - Redis unavailable`,
          )
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        req.payload.logger.error(
          `[newUserWelcomeEmail] Failed to enqueue ${eventType} for user ${user.id}:`,
          errorMessage,
        )
        if (err instanceof Error) {
          Sentry.withScope((scope) => {
            scope.setTag('hook', 'newUserWelcomeEmail')
            scope.setTag('operation', 'enqueue_email')
            scope.setTag('user_id', String(user.id))
            scope.setTag('email_type', eventType)
            scope.setTag('user_type', userType)
            scope.setContext('user', {
              id: user.id,
              email: user.email,
              userType,
              firstName,
            })
            Sentry.captureException(err)
          })
        }
        // Don't throw - continue with other emails
      }
    })

    // Wait for all emails to be enqueued
    await Promise.all(emailPromises)

    req.payload.logger.info(
      `[newUserWelcomeEmail] Processed welcome emails for user ${user.id} with roles: ${rolesToNotify.join(', ')}`,
    )
  } catch (error) {
    // Don't throw - email failure shouldn't break user verification
    const errorMessage = error instanceof Error ? error.message : String(error)
    req.payload.logger.error(
      `[newUserWelcomeEmail] ❌ Failed to process welcome emails for user ${doc.id}:`,
      errorMessage,
    )
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('hook', 'newUserWelcomeEmail')
        scope.setTag('operation', 'process_welcome_emails')
        scope.setTag('user_id', String(doc.id))
        scope.setContext('user', {
          id: doc.id,
          email: (doc as unknown as User).email,
        })
        Sentry.captureException(error)
      })
    }
  }
}
