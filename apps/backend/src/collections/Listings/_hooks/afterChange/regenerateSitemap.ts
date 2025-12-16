import type { CollectionAfterChangeHook } from 'payload'

/**
 * Regenerates sitemap when a listing is created, updated, or published
 * Only triggers for approved and published listings
 * Made non-blocking to prevent hanging during ownership transfers
 */
export const regenerateSitemap: CollectionAfterChangeHook = async ({
  doc,
  operation,
  collection,
  req,
}) => {
  // Skip sitemap regeneration if context flag is set (e.g., during ownership transfers)
  if (req.context?.skipSitemapRegeneration) {
    return doc
  }

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
  const revalidateSecret = process.env.PAYLOAD_REVALIDATE_SECRET || process.env.SVC_TOKEN

  if (!revalidateSecret) {
    console.warn('[Sitemap Regeneration] REVALIDATE_SECRET not configured, skipping sitemap update')
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

  console.log(`[Sitemap Regeneration] Triggering sitemap update for ${listingType} (${operation})`)

  // Fire-and-forget: Don't await sitemap regeneration to prevent blocking
  // This operation will complete asynchronously and errors are logged but don't block
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  fetch(`${frontendUrl}/api/revalidate-sitemap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${revalidateSecret}`,
    },
    body: JSON.stringify({ type: listingType }),
    signal: controller.signal,
  })
    .then(async (response) => {
      clearTimeout(timeoutId)
      if (response.ok) {
        const result = await response.json()
        console.log('[Sitemap Regeneration] Success:', result.message)
      } else {
        const errorText = await response.text()
        console.error('[Sitemap Regeneration] Failed:', response.status, errorText)
      }
    })
    .catch((err) => {
      clearTimeout(timeoutId)
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn(`[Sitemap Regeneration] Timeout after 10s for ${listingType}`)
      } else {
        console.error('[Sitemap Regeneration] Error (non-blocking):', err)
      }
    })

  return doc
}
