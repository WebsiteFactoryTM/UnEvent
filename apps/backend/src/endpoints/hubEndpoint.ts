import type { PayloadRequest } from 'payload'
import type { PayloadHandler } from 'payload'
import * as Sentry from '@sentry/nextjs'

export const hubHandler: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const listingType =
      (req.query.listingType as 'locations' | 'services' | 'events') ?? 'locations'
    const { docs } = await req.payload.find({
      collection: 'hub-snapshots',
      where: { listingType: { equals: listingType } },
      limit: 1,
      depth: 0,
    })
    const doc = docs[0]

    if (!doc) return new Response(JSON.stringify({ error: 'snapshot not found' }), { status: 404 })

    // Transform listingId to id for API response (to match frontend expectations)
    // Exclude both listingId and the Payload document id, then set id to listingId
    type HubSnapshotItem = {
      listingId: number
      id?: string | unknown
      [key: string]: unknown
    }
    const transformItem = (item: HubSnapshotItem) => {
      const { listingId, id: _payloadId, ...rest } = item
      return { id: listingId, ...rest }
    }

    type HubSnapshotRow = {
      items?: HubSnapshotItem[] | null
      [key: string]: unknown
    }
    const transformRow = (row: HubSnapshotRow) => ({
      ...row,
      items: row.items?.map(transformItem) ?? null,
    })

    return new Response(
      JSON.stringify({
        listingType: doc.listingType,
        typeaheadCities: doc.typeaheadCities,
        popularCityRows: doc.popularCityRows?.map(transformRow),
        featured: doc.featured?.map(transformItem) ?? null,
        popularSearchCombos: doc.popularSearchCombos,
        topCities: doc.topCities,
        topTypes: doc.topTypes,
        generatedAt: doc.generatedAt,
        algoVersion: doc.algoVersion,
      }),
      { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' } },
    )
  } catch (error) {
    console.error(error)

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', 'hub')
        scope.setContext('request', {
          listingType: req.query.listingType,
          method: 'GET',
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

    return new Response(JSON.stringify({ error: 'Error getting hub' }), { status: 500 })
  }
}
