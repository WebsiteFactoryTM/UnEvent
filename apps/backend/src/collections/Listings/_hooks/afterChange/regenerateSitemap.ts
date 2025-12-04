import type { CollectionAfterChangeHook } from 'payload'

/**
 * Regenerates sitemap when a listing is created, updated, or published
 * Only triggers for approved and published listings
 */
export const regenerateSitemap: CollectionAfterChangeHook = async ({
  doc,
  operation,
  collection,
}) => {
  try {
    // Only regenerate for published and approved listings
    const isPublished = doc._status === 'published'
    const isApproved = doc.moderationStatus === 'approved'

    // Trigger sitemap regeneration for create, update, or status changes
    const shouldRegenerate =
      (operation === 'create' && isPublished && isApproved) ||
      (operation === 'update' && isPublished && isApproved)

    if (!shouldRegenerate) {
      return doc
    }

    const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL || 'https://unevent.ro'
    const revalidateSecret = process.env.REVALIDATE_SECRET || process.env.SVC_TOKEN

    if (!revalidateSecret) {
      console.warn(
        '[Sitemap Regeneration] REVALIDATE_SECRET not configured, skipping sitemap update',
      )
      return doc
    }

    // Map collection slug to frontend type
    const typeMap: Record<string, string> = {
      locations: 'locations',
      services: 'services',
      events: 'events',
    }

    const listingType = typeMap[collection.slug]

    if (!listingType) {
      console.warn(`[Sitemap Regeneration] Unknown collection: ${collection.slug}`)
      return doc
    }

    console.log(
      `[Sitemap Regeneration] Triggering sitemap update for ${listingType} (${operation})`,
    )

    // Call frontend API to revalidate sitemap
    const response = await fetch(`${frontendUrl}/api/revalidate-sitemap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${revalidateSecret}`,
      },
      body: JSON.stringify({ type: listingType }),
    })

    if (response.ok) {
      const result = await response.json()
      console.log('[Sitemap Regeneration] Success:', result.message)
    } else {
      const errorText = await response.text()
      console.error('[Sitemap Regeneration] Failed:', response.status, errorText)
    }
  } catch (error) {
    // Don't throw errors - sitemap regeneration shouldn't block listing operations
    console.error('[Sitemap Regeneration] Error:', error)
  }

  return doc
}
