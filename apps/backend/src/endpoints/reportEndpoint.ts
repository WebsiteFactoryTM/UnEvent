import type { PayloadHandler, PayloadRequest } from 'payload'
import { EmailEventType, enqueueNotification } from '@/utils/notificationsQueue'
import * as Sentry from '@sentry/nextjs'

export const reportHandler: PayloadHandler = async (req: PayloadRequest) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  if (!req.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const body = (await req.json?.()) ?? req.body
    const { type, entityId, reason, details, listingType } = body as {
      type: 'listing' | 'profile'
      entityId: number
      reason: string
      details?: string
      listingType?: 'events' | 'locations' | 'services'
    }

    // Validate required fields
    if (!type || !entityId || !reason) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, entityId, reason' }),
        { status: 400 },
      )
    }

    // Validate type
    if (type !== 'listing' && type !== 'profile') {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Must be "listing" or "profile"' }),
        {
          status: 400,
        },
      )
    }

    // For listings, listingType is required
    if (type === 'listing' && !listingType) {
      return new Response(
        JSON.stringify({ error: 'listingType is required when type is "listing"' }),
        { status: 400 },
      )
    }

    // Validate listingType if provided
    if (listingType && !['events', 'locations', 'services'].includes(listingType)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid listingType. Must be "events", "locations", or "services"',
        }),
        { status: 400 },
      )
    }

    // Get reporting user info
    const reportingUser = {
      id: String(req.user.id),
      email: req.user.email || '',
      name: req.user.displayName || req.user.email || 'Utilizator necunoscut',
    }

    // Fetch entity details
    let entityTitle = ''
    let entitySlug = ''
    let entityUrl = ''

    if (type === 'listing') {
      // Fetch listing from the appropriate collection
      const listing = await req.payload.find({
        collection: listingType!,
        where: { id: { equals: String(entityId) } },
        limit: 1,
        depth: 0,
      })

      if (!listing.docs.length) {
        return new Response(JSON.stringify({ error: 'Listing not found' }), { status: 404 })
      }

      const listingData = listing.docs[0]
      entityTitle = listingData.title || 'Listare fără titlu'
      entitySlug = listingData.slug || ''

      // Construct URL based on listing type
      const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL || ''
      const listingTypePath =
        listingType === 'events'
          ? 'evenimente'
          : listingType === 'locations'
            ? 'locatii'
            : 'servicii'
      entityUrl = `${frontendUrl}/${listingTypePath}/${entitySlug}`
    } else {
      // Fetch profile
      const profile = await req.payload.find({
        collection: 'profiles',
        where: { id: { equals: String(entityId) } },
        limit: 1,
        depth: 0,
      })

      if (!profile.docs.length) {
        return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404 })
      }

      const profileData = profile.docs[0]
      entityTitle = profileData.displayName || profileData.name || 'Profil fără nume'
      entitySlug = profileData.slug || ''

      // Construct profile URL
      const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL || ''
      entityUrl = `${frontendUrl}/profil/${entitySlug}`
    }

    // Map reason to human-readable label
    const reasonLabels: Record<string, string> = {
      'bad-language': 'Limbaj neadecvat',
      'bad-experience': 'Experiență negativă',
      'inappropriate-content': 'Conținut neadecvat',
      other: 'Altul',
    }
    const reasonLabel = reasonLabels[reason] || reason

    // Construct email payload
    const emailPayload: Record<string, unknown> = {
      reporting_user_id: reportingUser.id,
      reporting_user_email: reportingUser.email,
      reporting_user_name: reportingUser.name,
      entity_id: String(entityId),
      entity_title: entityTitle,
      entity_url: entityUrl,
      report_reason: reasonLabel,
      report_reason_code: reason,
      report_details: details || '',
    }

    // Add listing-specific fields
    if (type === 'listing') {
      emailPayload.listing_type = listingType
      emailPayload.listing_slug = entitySlug
    } else {
      emailPayload.profile_slug = entitySlug
    }

    // Enqueue email notification
    const emailEventType: EmailEventType =
      type === 'listing' ? 'admin.listing.report' : 'admin.profile.report'
    await enqueueNotification(emailEventType, emailPayload)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error processing report:', errMsg)

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', 'report')
        scope.setContext('request', {
          method: 'POST',
        })
        if (req.user) {
          scope.setUser({
            id: String(req.user.id),
            email: req.user.email,
          })
        }
        Sentry.captureException(error)
      })
    }

    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
