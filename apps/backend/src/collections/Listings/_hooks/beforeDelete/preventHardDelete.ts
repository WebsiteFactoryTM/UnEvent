import type { CollectionBeforeDeleteHook } from 'payload'

/**
 * Prevents hard delete of listings unless:
 * - User is an admin, OR
 * - Listing was soft-deleted more than 6 months ago (for cleanup scheduler)
 *
 * Regular users should use soft delete (set deletedAt) via API route instead.
 */
export const preventHardDelete: CollectionBeforeDeleteHook = async ({ req, id, collection }) => {
  // Allow admin to hard delete
  if (req.user?.roles?.includes('admin')) {
    return
  }

  // Check if listing exists and was soft-deleted
  try {
    const doc = await req.payload.findByID({
      collection: collection.slug as 'locations' | 'events' | 'services',
      id,
      depth: 0,
    })

    // If listing is not soft-deleted, prevent hard delete
    // Users should use soft delete (set deletedAt) instead
    if (!doc.deletedAt) {
      throw new Error(
        'Hard delete is not allowed. Please use soft delete (set deletedAt) instead. Only admins can hard delete active listings.',
      )
    }

    // Check if listing was deleted more than 6 months ago
    const deletedAt = new Date(doc.deletedAt)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    if (deletedAt > sixMonthsAgo) {
      throw new Error(
        'Hard delete is not allowed for listings deleted less than 6 months ago. Only admins can force hard delete.',
      )
    }

    // Allow hard delete if listing was deleted >6 months ago (cleanup scheduler)
  } catch (error) {
    // If error is already our custom error, re-throw it
    if (error instanceof Error && error.message.includes('Hard delete is not allowed')) {
      throw error
    }
    // If listing doesn't exist or other error, allow deletion to proceed
    // (PayloadCMS will handle the error appropriately)
  }
}
