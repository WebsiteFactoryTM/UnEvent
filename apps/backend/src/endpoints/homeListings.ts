import { Event, Location, Service } from '@/payload-types'
import { Payload, PayloadHandler, PayloadRequest } from 'payload'

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
    id: { not_in: Array<number> }
  } = {
    moderationStatus: { equals: 'approved' },
    id: { not_in: exclude },
  }
  if (type !== 'new') {
    where.tier = { in: ['recommended', 'sponsored'] }
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
  featuredLocations: Partial<Location>[] | null | undefined
  topServices: Partial<Service>[] | null | undefined
  upcomingEvents: Partial<Event>[] | null | undefined
  newLocations: Partial<Location>[] | null | undefined
  newServices: Partial<Service>[] | null | undefined
  newEvents: Partial<Event>[] | null | undefined
}) {
  return {
    featuredLocations: home.featuredLocations?.map(shapeListing),
    topServices: home.topServices?.map(shapeListing),
    upcomingEvents: home.upcomingEvents?.map(shapeListing),
    newLocations: home.newLocations?.map(shapeListing),
    newServices: home.newServices?.map(shapeListing),
    newEvents: home.newEvents?.map(shapeListing),
  }
}

function shapeListing(
  doc: Partial<Location> | Partial<Service> | Partial<Event>,
): Partial<Location | Service | Event> {
  return {
    id: doc?.id,
    title: doc?.title,
    slug: doc?.slug,
    rating: typeof doc?.rating === 'number' ? doc.rating : undefined,
    reviewCount: typeof doc?.reviewCount === 'number' ? doc.reviewCount : undefined,
    tier: doc?.tier,
    featuredImage: typeof doc?.featuredImage === 'object' ? doc.featuredImage : null,
    city: typeof doc?.city === 'object' ? doc.city : undefined,
    description: doc?.description,
    capacity: (doc as Location)?.capacity,
    startDate: (doc as Event)?.startDate,
    endDate: (doc as Event)?.endDate,
    type: doc?.type,
    isFavoritedByViewer: doc.isFavoritedByViewer || false,
    geo: doc?.geo ? [doc.geo[0], doc.geo[1]] : null,
    verifiedStatus: doc?.verifiedStatus,
  }
}
