import type { CollectionAfterChangeHook } from 'payload'
import { enqueueNotification } from '@/utils/notificationsQueue'

/**
 * Notify admins when a new user registers
 */
export const notifyAdminNewUser: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  // Only trigger on create
  if (operation !== 'create') {
    return
  }

  try {
    // Build admin dashboard URL
    const adminUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:4000'
    const dashboardUrl = `${adminUrl}/admin/collections/users/${doc.id}`

    const result = await enqueueNotification('admin.user.new', {
      user_email: doc.email,
      display_name: doc.displayName || undefined,
      user_id: String(doc.id),
      roles: doc.roles || [],
      dashboard_url: dashboardUrl,
    })

    if (result.id) {
      req.payload.logger.info(
        `[notifyAdminNewUser] ✅ Enqueued admin.user.new for user ${doc.id} (job: ${result.id})`,
      )
    } else {
      req.payload.logger.warn(
        `[notifyAdminNewUser] ⚠️ Skipped admin.user.new for user ${doc.id} - Redis unavailable`,
      )
    }
  } catch (error) {
    // Don't throw - email failure shouldn't break user creation
    req.payload.logger.error(
      `[notifyAdminNewUser] ❌ Failed to enqueue notification for user ${doc.id}:`,
      error,
    )
  }
}
