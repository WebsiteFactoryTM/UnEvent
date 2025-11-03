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

type RawHomeListings = {
  featuredLocations?: (number | Location)[] | null | undefined
  topServices?: (number | Service)[] | null | undefined
  upcomingEvents?: (number | Event)[] | null | undefined
}

export const homeHandler: PayloadHandler = async (req: PayloadRequest) => {
  const { payload } = req
  try {
    let homeListings: RawHomeListings | null = null

    homeListings = await req.payload.findGlobal({
      slug: 'homeListings',
      depth: 2,
    })
    const newLocations = await payload.find({
      collection: 'locations',
      where: { status: { equals: 'approved' } },
      limit: 6,
      sort: '-createdAt',
      depth: 2,
    })
    const newServices = await payload.find({
      collection: 'services',
      where: { status: { equals: 'approved' } },
      limit: 6,
      sort: '-createdAt',
      depth: 2,
    })
    const newEvents = await payload.find({
      collection: 'events',
      where: { status: { equals: 'approved' } },
      limit: 6,
      sort: 'startDate',
      depth: 2,
    })

    if (!homeListings) {
      homeListings = await getHomeListings(req.payload)
    }

    const finalListings = {
      ...homeListings,
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

const getHomeListings = async (
  payload: Payload,
): Promise<{
  featuredLocations: (number | Location)[] | null | undefined
  topServices: (number | Service)[] | null | undefined
  upcomingEvents: (number | Event)[] | null | undefined
}> => {
  try {
    const [featuredLocations, topServices, upcomingEvents] = await Promise.all([
      payload.find({
        collection: 'locations',
        where: { featured: { equals: true }, status: { equals: 'approved' } },
        limit: 6,
        sort: '-rating',
        depth: 1,
      }),
      payload.find({
        collection: 'services',
        where: { status: { equals: 'approved' } },
        limit: 6,
        sort: '-rating',
        depth: 1,
      }),
      payload.find({
        collection: 'events',
        where: { status: { equals: 'approved' } },
        limit: 6,
        sort: 'startDate',
        depth: 1,
      }),
    ])

    return {
      featuredLocations: featuredLocations.docs,
      topServices: topServices.docs,
      upcomingEvents: upcomingEvents.docs,
    }
  } catch (err) {
    payload.logger.error('Home endpoint error:', err)
    throw new Error('Failed to fetch home data')
  }
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
    city: typeof doc?.city === 'object' ? doc.city : null,
    description: doc?.description,
    capacity: (doc as Location)?.capacity,
    startDate: (doc as Event)?.startDate,
    endDate: (doc as Event)?.endDate,
    type: doc?.type,
    isFavoritedByViewer: doc.isFavoritedByViewer || false,
  }
}
