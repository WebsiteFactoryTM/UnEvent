import type { CollectionAfterChangeHook } from 'payload'
import { enqueueNotification } from '@/utils/notificationsQueue'

/**
 * Send claim invitation email when UnEvent creates an unclaimed listing with contact email
 */
export const notifyListingCreated: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
  collection,
}) => {
  // Only trigger on create
  if (operation !== 'create') {
    return
  }

  // Only send email if listing is unclaimed and has contact email
  if (doc.claimStatus !== 'unclaimed' || !doc.contact?.email) {
    return
  }

  try {
    const listingId = doc.id
    const listingTitle = doc.title
    const listingSlug = doc.slug
    const listingType = collection.slug as 'locations' | 'events' | 'services'
    const contactEmail = doc.contact.email

    const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
    const claimUrl = `${frontendUrl}/claim?listingId=${listingId}&listingType=${listingType}`

    // Note: We don't create a claim record here - that will be created when user clicks the link
    // The email will include a link that leads to the claim form
    const result = await enqueueNotification('listing.claim.invitation', {
      listing_title: listingTitle,
      listing_type: listingType,
      listing_id: String(listingId),
      listing_slug: listingSlug || undefined,
      contact_email: contactEmail,
      claim_url: claimUrl,
    })

    if (result.id) {
      req.payload.logger.info(
        `[notifyListingCreated] ✅ Enqueued listing.claim.invitation for ${listingType} ${listingId} (job: ${result.id})`,
      )
    } else {
      req.payload.logger.warn(
        `[notifyListingCreated] ⚠️ Skipped listing.claim.invitation for ${listingType} ${listingId} - Redis unavailable`,
      )
    }
  } catch (error) {
    // Don't throw - email failure shouldn't break listing creation
    const errorMessage = error instanceof Error ? error.message : String(error)
    req.payload.logger.error(
      `[notifyListingCreated] ❌ Failed to enqueue notification for listing ${doc.id}:`,
      errorMessage,
    )
  }
}
