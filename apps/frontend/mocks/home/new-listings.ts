export type NewListingType = "location" | "service" | "event"

export interface NewListingMock {
  id: number
  type: NewListingType
  title: string
  description?: string
  image: string
  city: string
  verified: boolean
  // Location specific
  capacity?: number
  listingType?: string
  // Service specific
  serviceType?: string
  // Event specific
  day?: string
  date?: string
  time?: string
  rating?: {
    average: number
    count: number
  }
}

export const mockNewListings: NewListingMock[] = [
  {
    id: 1,
    type: "location",
    title: "Conacul Belvedere - Locație premium pentru nunți",
    description:
      "Conac restaurat cu grădină de 2000mp, terasă acoperită și sală interioară elegantă. Parcare privată pentru 50 de mașini.",
    image: "/elegant-manor-wedding.jpg",
    city: "Iași",
    capacity: 250,
    listingType: "Conac",
    verified: true,
    rating: {
      average: 5.0,
      count: 3,
    },
  },
  {
    id: 2,
    type: "service",
    title: "DJ Alex Pro - Muzică electronică și comercială",
    description:
      "DJ cu experiență de 10 ani, echipament profesional Pionner și sistem de sunet de 5000W. Repertoriu vast.",
    image: "/dj-professional-equipment.jpg",
    city: "București",
    serviceType: "DJ",
    verified: true,
    rating: {
      average: 4.9,
      count: 8,
    },
  },
  {
    id: 3,
    type: "event",
    title: "Târg de Vinuri Românești - Degustare și Networking",
    description:
      "Descoperă cele mai bune vinuri românești de la producători locali. Include degustare ghidată și mese tradiționale.",
    image: "/wine-tasting-event.jpg",
    day: "Vineri",
    date: "2 Iunie 2025",
    time: "19:00",
    city: "Brașov",
    verified: false,
    rating: {
      average: 4.7,
      count: 12,
    },
  },
  {
    id: 4,
    type: "location",
    title: "Sky Lounge - Terasă exclusivistă cu vedere",
    description:
      "Spațiu modern pe ultimul etaj cu vedere panoramică, bar premium și zonă VIP. Perfect pentru evenimente corporate.",
    image: "/sky-lounge-terrace.jpg",
    city: "Cluj-Napoca",
    capacity: 80,
    listingType: "Lounge",
    verified: true,
    rating: {
      average: 4.8,
      count: 5,
    },
  },
  {
    id: 5,
    type: "service",
    title: "Catering Gourmet Plus - Meniu de lux personalizat",
    description:
      "Chef cu experiență internațională, ingrediente premium și prezentare impecabilă. Meniu adaptat preferințelor.",
    image: "/gourmet-catering-service.jpg",
    city: "Timișoara",
    serviceType: "Catering",
    verified: true,
    rating: {
      average: 5.0,
      count: 6,
    },
  },
  {
    id: 6,
    type: "event",
    title: "Workshop Antreprenoriat - De la Idee la Business",
    description:
      "Învață cum să îți transformi ideea într-un business profitabil. Include sesiuni practice și mentorat individual.",
    image: "/entrepreneurship-workshop.jpg",
    day: "Sâmbătă",
    date: "10 Iunie 2025",
    time: "10:00",
    city: "București",
    verified: true,
    rating: {
      average: 4.9,
      count: 15,
    },
  },
]
