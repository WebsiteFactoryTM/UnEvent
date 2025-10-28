export interface LocationMock {
  id: number
  title: string
  description: string
  image: string
  city: string
  capacity: number
  type: string
  verified: boolean
  rating?: {
    average: number
    count: number
  }
}

export const mockLocations: LocationMock[] = [
  {
    id: 1,
    title: "Vila Panoramic - Locație de vis pentru evenimente speciale",
    description:
      "Spațiu elegant cu grădină amenajată, terasă acoperită și vedere panoramică. Perfect pentru nunți, botezuri și evenimente corporate. Capacitate până la 200 de persoane.",
    image: "/elegant-wedding-garden.png",
    city: "București",
    capacity: 200,
    type: "Sală de evenimente",
    verified: true,
    rating: {
      average: 4.8,
      count: 47,
    },
  },
  {
    id: 2,
    title: "Castel Bran Events - Experiență medievală unică",
    description:
      "Locație istorică cu arhitectură medievală, perfectă pentru evenimente tematice și nunți de poveste. Oferim catering inclus și decorațiuni personalizate.",
    image: "/medieval-castle-venue.jpg",
    city: "Brașov",
    capacity: 150,
    type: "Castel",
    verified: true,
    rating: {
      average: 4.9,
      count: 89,
    },
  },
  {
    id: 3,
    title: "Loft Industrial Timișoara - Spațiu modern și versatil",
    description:
      "Loft industrial cu design contemporan, lumină naturală abundentă și echipamente audio-video profesionale. Ideal pentru workshop-uri, lansări de produse și petreceri private.",
    image: "/industrial-loft-event-space.jpg",
    city: "Timișoara",
    capacity: 120,
    type: "Loft",
    verified: false,
    rating: {
      average: 4.7,
      count: 23,
    },
  },
  {
    id: 4,
    title: "Grădina Botanică Cluj - Natură și eleganță",
    description:
      "Spațiu verde cu sere de sticlă și alei amenajate, perfect pentru ceremonii în aer liber și recepții elegante. Oferim pachete complete cu decorațiuni florale.",
    image: "/botanical-garden-wedding-venue.jpg",
    city: "Cluj-Napoca",
    capacity: 180,
    type: "Grădină",
    verified: true,
    rating: {
      average: 4.6,
      count: 34,
    },
  },
  {
    id: 5,
    title: "Rooftop Panorama - Vedere spectaculoasă asupra orașului",
    description:
      "Terasă pe acoperiș cu vedere 360° asupra orașului, bar complet echipat și zonă lounge. Perfect pentru petreceri private, evenimente corporate și cocktail party-uri.",
    image: "/rooftop-venue-city-view.jpg",
    city: "București",
    capacity: 100,
    type: "Rooftop",
    verified: true,
    rating: {
      average: 4.9,
      count: 56,
    },
  },
]
