import { Review } from '@/payload-types'
import type { CollectionAfterOperationHook, Payload } from 'payload'

const polyRef = (k: 'locations' | 'events' | 'services', id: string | number) => ({
  relationTo: k,
  value: typeof id === 'number' ? id : Number(id),
})

// Queue to store listings that need recalculation (global across requests)
const recalculationQueue = new Set<string>()

// Process queue with debounce to avoid multiple recalcs and ensure fresh data
let processingTimeout: NodeJS.Timeout | null = null
const DEBOUNCE_MS = 100

async function processQueue(payload: Payload) {
  if (processingTimeout) {
    clearTimeout(processingTimeout)
  }

  processingTimeout = setTimeout(async () => {
    try {
      const listings = Array.from(recalculationQueue)
      recalculationQueue.clear()

      for (const key of listings) {
        const [listingTypeStr, listingIdStr] = key.split(':')
        const listingType = listingTypeStr as 'locations' | 'events' | 'services'
        const listingId = parseInt(listingIdStr)

        // Get FRESH data after all transactions complete
        const reviews = await payload.find({
          collection: 'reviews',
          where: {
            and: [
              { listing: { equals: polyRef(listingType, listingId) } },
              { listingType: { equals: listingType } },
              { status: { equals: 'approved' } },
            ],
          },
          limit: 0,
        })

        const total = reviews.totalDocs
        const avg =
          total > 0
            ? reviews.docs.reduce((acc: number, r: Review) => acc + (r.rating ?? 0), 0) / total
            : 0

        console.log(
          `[Reviews Queue] ${listingType}:${listingId} -> ${total} reviews, avg rating: ${avg.toFixed(2)}`,
        )

        // Update with fresh calculations
        // Note: Queue processing happens after hook execution, so no recursion risk
        await payload.update({
          collection: listingType,
          id: listingId,
          data: {
            reviewCount: total,
            rating: Number(avg.toFixed(2)),
          },
          req: {
            context: {
              isRecalculating: true,
            },
          },
        })
      }
    } catch (e) {
      console.error('[Reviews Queue] Processing failed:', e)
      payload.logger.error('[Reviews Queue] Processing failed:', e)
    }
  }, DEBOUNCE_MS)
}

// Unified hook for all review operations (create, update, delete)
export const recalcReviewAggregates: CollectionAfterOperationHook = async ({
  req,
  result,
  operation,
}) => {
  try {
    if (!['update', 'updateByID', 'delete', 'deleteByID'].includes(operation)) {
      return
    }
    // Skip if we're in a recalculation to prevent recursion
    if (req.context?.isRecalculating) {
      return
    }

    // Extract all affected reviews from the operation result
    // Result can be either a single document or { docs: [...], errors: [...] } for bulk operations
    let affectedReviews: Review[] = []

    // Check if result is a bulk operation result (has docs property)
    if (result && typeof result === 'object' && 'docs' in result) {
      // Bulk operation: result.docs contains all affected documents
      const bulkResult = result as { docs: Review[]; errors: unknown[] }
      affectedReviews = bulkResult.docs
    } else {
      // Single operation: result is the single document
      affectedReviews = [result as Review]
    }

    if (affectedReviews.length === 0) {
      console.log('[Reviews Hook] No reviews affected')
      return
    }

    // Queue affected listings for recalculation
    for (const review of affectedReviews) {
      const { listing, listingType } = review
      const listingId =
        typeof listing === 'object'
          ? typeof listing.value === 'object'
            ? listing.value.id
            : listing.value
          : listing

      const key = `${listingType}:${listingId}`
      recalculationQueue.add(key)
    }

    // Process queue asynchronously (debounced)
    processQueue(req.payload)
  } catch (e) {
    req.payload.logger.error('[Reviews Hook] recalcReviewAggregates failed:', e)
  }
}
