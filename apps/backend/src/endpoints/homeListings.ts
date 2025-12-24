import { Event, Location, Service } from '@/payload-types'
import { Payload, PayloadHandler, PayloadRequest } from 'payload'
import * as Sentry from '@sentry/nextjs'
import { toCardItem } from '@/utils/toCardItem'

type ShapedHomeListings = {
  featuredLocations: Location[]
  topServices: Service[]
  upcomingEvents: Event[]
  newLocations: Location[]
  newServices: Service[]
  newEvents: Event[]
}

const LIMIT_DEFAULT = 6

export const homeHandler: PayloadHandler = async (req: PayloadRequest) => {
  const { payload } = req
  try {
    // Get home listings from global config (populated with depth: 2)
    const homeListings = await req.payload.findGlobal({
      slug: 'homeListings',
      depth: 2,
    })

    // Extract populated listings and their IDs
    const featuredLocationsPopulated = (homeListings?.featuredLocations || []).filter(
      (loc): loc is Location => typeof loc === 'object' && 'id' in loc,
    )
    const topServicesPopulated = (homeListings?.topServices || []).filter(
      (serv): serv is Service => typeof serv === 'object' && 'id' in serv,
    )
    const upcomingEventsPopulated = (homeListings?.upcomingEvents || []).filter(
      (evt): evt is Event => typeof evt === 'object' && 'id' in evt,
    )

    const featuredLocationIds = featuredLocationsPopulated.map((loc) => loc.id)
    const topServiceIds = topServicesPopulated.map((serv) => serv.id)
    const upcomingEventIds = upcomingEventsPopulated.map((evt) => evt.id)

    // Calculate how many more we need to reach the limit
    const locationsNeeded = Math.max(0, LIMIT_DEFAULT - featuredLocationsPopulated.length)
    const servicesNeeded = Math.max(0, LIMIT_DEFAULT - topServicesPopulated.length)
    const eventsNeeded = Math.max(0, LIMIT_DEFAULT - upcomingEventsPopulated.length)

    // Fetch additional listings if needed, excluding ones already in home collection
    const [additionalLocations, additionalServices, additionalEvents] = await Promise.all([
      // Fill featured locations if needed
      locationsNeeded > 0
        ? getExtraListings(
            'featured',
            payload,
            'locations',
            locationsNeeded,
            '-rating',
            featuredLocationIds,
          )
        : Promise.resolve({ docs: [] }),
      // Fill top services if needed
      servicesNeeded > 0
        ? getExtraListings('top', payload, 'services', servicesNeeded, '-rating', topServiceIds)
        : Promise.resolve({ docs: [] }),
      // Fill upcoming events if needed
      eventsNeeded > 0
        ? getExtraListings(
            'upcoming',
            payload,
            'events',
            eventsNeeded,
            'startDate',
            upcomingEventIds,
          )
        : Promise.resolve({ docs: [] }),
      // New listings (exclude featured/top/upcoming)
    ])
    const additionalLocationIds = additionalLocations.docs.map((loc) => loc.id)
    const additionalServiceIds = additionalServices.docs.map((serv) => serv.id)
    const additionalEventIds = additionalEvents.docs.map((evt) => evt.id)

    const [newLocations, newServices, newEvents] = await Promise.all([
      getExtraListings('new', payload, 'locations', LIMIT_DEFAULT, '-createdAt', [
        ...featuredLocationIds,
        ...additionalLocationIds,
      ]),
      getExtraListings('new', payload, 'services', LIMIT_DEFAULT, '-createdAt', [
        ...topServiceIds,
        ...additionalServiceIds,
      ]),
      getExtraListings(
        'new',
        payload,
        'events',
        LIMIT_DEFAULT,
        ['-createdAt', 'startDate'],
        [...upcomingEventIds, ...additionalEventIds],
      ),
    ])

    // Combine populated listings with additional ones (up to limit)
    const finalListings = {
      featuredLocations: [
        ...featuredLocationsPopulated,
        ...additionalLocations.docs.slice(0, locationsNeeded),
      ].slice(0, LIMIT_DEFAULT),
      topServices: [
        ...topServicesPopulated,
        ...additionalServices.docs.slice(0, servicesNeeded),
      ].slice(0, LIMIT_DEFAULT),
      upcomingEvents: [
        ...upcomingEventsPopulated,
        ...additionalEvents.docs.slice(0, eventsNeeded),
      ].slice(0, LIMIT_DEFAULT),
      newLocations: newLocations.docs,
      newServices: newServices.docs,
      newEvents: newEvents.docs,
    }

    const shaped = shapeHomeResponse(finalListings as ShapedHomeListings)

    return new Response(JSON.stringify(shaped), { status: 200 })
  } catch (error) {
    console.error(error)

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', 'home')
        scope.setContext('request', {
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

    return new Response('Internal server error', { status: 500 })
  }
}

function getExtraListings(
  type: 'featured' | 'top' | 'upcoming' | 'new',
  payload: Payload,
  collection: 'locations' | 'services' | 'events',
  limit: number,
  sort: string | string[],
  exclude: Array<number>,
) {
  const where: {
    tier?: { in: Array<string> }
    moderationStatus: { equals: 'approved' }
    _status: { equals: 'published' }
    id: { not_in: Array<number> }
    deletedAt?: { exists: false }
    eventStatus?: { not_equals: 'finished' }
    endDate?: { greater_than_equal: string }
    claimStatus?: { not_equals: 'unclaimed' }
  } = {
    moderationStatus: { equals: 'approved' },
    _status: { equals: 'published' },
    claimStatus: { not_equals: 'unclaimed' },
    id: { not_in: exclude },
    deletedAt: { exists: false }, // Exclude soft-deleted listings
  }
  if (type !== 'new') {
    where.tier = {
      in: ['sponsored', 'recommended'],
    }
  }

  // For events, exclude finished events and events that have ended
  if (collection === 'events') {
    where.eventStatus = { not_equals: 'finished' }
    where.endDate = { greater_than_equal: new Date().toISOString() }
  }

  return payload.find({
    collection: collection,
    where,
    limit: limit,
    sort: sort,
    depth: 2,
  })
}

function shapeHomeResponse(home: {
  featuredLocations: Location[] | null | undefined
  topServices: Service[] | null | undefined
  upcomingEvents: Event[] | null | undefined
  newLocations: Location[] | null | undefined
  newServices: Service[] | null | undefined
  newEvents: Event[] | null | undefined
}) {
  return {
    featuredLocations: home.featuredLocations?.map((loc) => toCardItem('locations', loc)),
    topServices: home.topServices?.map((serv) => toCardItem('services', serv)),
    upcomingEvents: home.upcomingEvents?.map((evt) => toCardItem('events', evt)),
    newLocations: home.newLocations?.map((loc) => toCardItem('locations', loc)),
    newServices: home.newServices?.map((serv) => toCardItem('services', serv)),
    newEvents: home.newEvents?.map((evt) => toCardItem('events', evt)),
  }
}
