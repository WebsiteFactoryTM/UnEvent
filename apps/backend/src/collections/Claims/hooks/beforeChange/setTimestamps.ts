import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Set submittedAt on create and reviewedAt on status change
 */
export const setTimestamps: CollectionBeforeChangeHook = ({ data, operation, originalDoc }) => {
  // Set submittedAt on create
  if (operation === 'create' && !data.submittedAt) {
    data.submittedAt = new Date().toISOString()
  }

  // Set reviewedAt when status changes from pending to approved/rejected
  if (operation === 'update' && originalDoc) {
    const previousStatus = originalDoc.status
    const currentStatus = data.status

    if (
      previousStatus === 'pending' &&
      (currentStatus === 'approved' || currentStatus === 'rejected')
    ) {
      if (!data.reviewedAt) {
        data.reviewedAt = new Date().toISOString()
      }
    }
  }

  return data
}
