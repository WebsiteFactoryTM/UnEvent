// Extended types for favorites with listing data
export interface FavoriteLocation {
  id: number
  listingType: "location"
  listing: {
    id: number
    title: string
    slug: string
    description: string
    city: string
    image: string
    verified: boolean
    capacity: number
    type: string
    rating: {
      average: number
      count: number
    }
  }
  createdAt: string
}

export interface FavoriteService {
  id: number
  listingType: "service"
  listing: {
    id: number
    name: string
    slug: string
    type: string
    city: string
    avatar: string
    verified: boolean
    rating: {
      average: number
      count: number
    }
  }
  createdAt: string
}

export interface FavoriteEvent {
  id: number
  listingType: "event"
  listing: {
    id: number
    title: string
    slug: string
    description: string
    city: string
    image: string
    verified: boolean
    day: string
    date: string
    time: string
    rating: {
      average: number
      count: number
    }
  }
  createdAt: string
}

export const mockFavoriteLocations: FavoriteLocation[] = [
  {
    id: 1,
    listingType: "location",
    listing: {
      id: 1,
      title: "Grand Ballroom Elegance",
      slug: "grand-ballroom-elegance",
      description:
        "Sală de evenimente premium cu design elegant și facilități moderne pentru nunți și evenimente corporate.",
      city: "București",
      image: "/elegant-wedding-venue.png",
      verified: true,
      capacity: 300,
      type: "Sală de evenimente",
      rating: {
        average: 4.9,
        count: 127,
      },
    },
    createdAt: "2025-01-15T10:30:00Z",
  },
  {
    id: 2,
    listingType: "location",
    listing: {
      id: 2,
      title: "Vila Rustica Garden",
      slug: "vila-rustica-garden",
      description: "Vilă rustică cu grădină amplă, perfectă pentru nunți în aer liber și evenimente private.",
      city: "Cluj-Napoca",
      image: "/industrial-loft-venue.jpg",
      verified: true,
      capacity: 150,
      type: "Vilă cu grădină",
      rating: {
        average: 4.8,
        count: 89,
      },
    },
    createdAt: "2025-01-10T14:20:00Z",
  },
  {
    id: 3,
    listingType: "location",
    listing: {
      id: 3,
      title: "Sky Lounge Terrace",
      slug: "sky-lounge-terrace",
      description: "Terasă panoramică cu vedere spectaculoasă, ideală pentru petreceri și evenimente exclusive.",
      city: "Brașov",
      image: "/sky-lounge-terrace.jpg",
      verified: false,
      capacity: 80,
      type: "Terasă",
      rating: {
        average: 4.7,
        count: 45,
      },
    },
    createdAt: "2025-01-05T09:15:00Z",
  },
]

export const mockFavoriteServices: FavoriteService[] = [
  {
    id: 4,
    listingType: "service",
    listing: {
      id: 1,
      name: "Gourmet Catering Elite",
      slug: "gourmet-catering-elite",
      type: "Catering",
      city: "București",
      avatar: "/gourmet-catering-service.jpg",
      verified: true,
      rating: {
        average: 4.9,
        count: 156,
      },
    },
    createdAt: "2025-01-12T11:45:00Z",
  },
  {
    id: 5,
    listingType: "service",
    listing: {
      id: 2,
      name: "DJ Professional Sound",
      slug: "dj-professional-sound",
      type: "Muzică",
      city: "Cluj-Napoca",
      avatar: "/dj-professional-equipment.jpg",
      verified: true,
      rating: {
        average: 4.8,
        count: 98,
      },
    },
    createdAt: "2025-01-08T16:30:00Z",
  },
]

export const mockFavoriteEvents: FavoriteEvent[] = [
  {
    id: 6,
    listingType: "event",
    listing: {
      id: 1,
      title: "Târg de Nunți București 2025",
      slug: "targ-de-nunti-bucuresti-2025",
      description: "Cel mai mare târg de nunți din România cu peste 100 de expozanți și prezentări live.",
      city: "București",
      image: "/elegant-manor-wedding.jpg",
      verified: true,
      day: "Sâmbătă",
      date: "15 Martie 2025",
      time: "10:00 - 18:00",
      rating: {
        average: 4.9,
        count: 234,
      },
    },
    createdAt: "2025-01-14T13:20:00Z",
  },
  {
    id: 7,
    listingType: "event",
    listing: {
      id: 2,
      title: "Workshop Antreprenoriat în Evenimente",
      slug: "workshop-antreprenoriat-evenimente",
      description: "Învață cum să îți construiești o afacere de succes în industria evenimentelor.",
      city: "Cluj-Napoca",
      image: "/entrepreneurship-workshop.jpg",
      verified: true,
      day: "Duminică",
      date: "22 Martie 2025",
      time: "14:00 - 17:00",
      rating: {
        average: 4.7,
        count: 67,
      },
    },
    createdAt: "2025-01-09T10:00:00Z",
  },
  {
    id: 8,
    listingType: "event",
    listing: {
      id: 3,
      title: "Degustare de Vinuri Premium",
      slug: "degustare-vinuri-premium",
      description: "Seară exclusivă de degustare a celor mai rafinate vinuri românești și internaționale.",
      city: "Brașov",
      image: "/wine-tasting-event.jpg",
      verified: false,
      day: "Vineri",
      date: "28 Martie 2025",
      time: "19:00 - 22:00",
      rating: {
        average: 4.8,
        count: 89,
      },
    },
    createdAt: "2025-01-06T15:45:00Z",
  },
]
