import { Review } from '@/payload-types'
import type { CollectionAfterOperationHook } from 'payload'

const polyRef = (k: 'locations' | 'events' | 'services', id: string | number) => ({
  relationTo: k,
  value: typeof id === 'number' ? id : Number(id),
})

// Unified hook for all review operations (create, update, delete)
export const recalcReviewAggregates: CollectionAfterOperationHook = async ({
  req,
  result,
  operation,
}) => {
  try {
    // Extract all affected reviews from the operation result
    let affectedReviews: Review[] = []

    const OPERATIONS = ['update', 'delete', 'updateByID', 'deleteByID']
    if (!OPERATIONS.includes(operation)) {
      return
    }
    console.log('recalcReviewAggregates: operation', result)

    const affectedReviewsResult = result as { docs: Review[]; errors: unknown[] }
    affectedReviews = affectedReviewsResult.docs

    if (affectedReviews.length === 0) {
      console.log('recalcReviewAggregates: No reviews affected')
      return
    }

    console.log(
      `recalcReviewAggregates: ${operation} operation affected ${affectedReviews.length} reviews`,
    )

    // Group reviews by listing to avoid duplicate calculations
    const listingsToUpdate = new Map<
      string,
      { listingId: number; listingType: 'locations' | 'events' | 'services' }
    >()

    for (const review of affectedReviews) {
      const { listing, listingType, status } = review
      const listingId = typeof listing.value === 'number' ? listing.value : listing.value.id

      const key = `${listingType}:${listingId}`

      if (['update', 'updateByID'].includes(operation) && status !== 'approved') continue
      listingsToUpdate.set(key, { listingId, listingType })
    }

    // Process each unique listing
    for (const { listingId, listingType } of listingsToUpdate.values()) {
      console.log(`recalcReviewAggregates: Recalculating for ${listingType}:${listingId}`)

      // Find ALL approved reviews for this listing (not just the affected ones)
      const allApprovedReviews = await req.payload.find({
        collection: 'reviews',
        where: {
          and: [
            {
              listing: {
                equals: polyRef(listingType as 'locations' | 'events' | 'services', listingId),
              },
            },
            { listingType: { equals: listingType } },
            { status: { equals: 'approved' } },
          ],
        },
        limit: 0,
      })

      const total = allApprovedReviews.totalDocs
      const avg =
        total > 0 ? allApprovedReviews.docs.reduce((acc, r) => acc + (r.rating ?? 0), 0) / total : 0

      console.log(
        `recalcReviewAggregates: ${listingType}:${listingId} -> ${total} reviews, avg rating: ${avg.toFixed(2)}`,
      )

      req.payload.update({
        collection: listingType,
        id: listingId,
        data: {
          reviewCount: total,
          rating: Number(avg.toFixed(2)),
        },
      })
    }
  } catch (e) {
    console.error('[Reviews] recalcReviewAggregates failed', e)
    req.payload.logger.error('[Reviews] recalcReviewAggregates failed', e)
  }
}
