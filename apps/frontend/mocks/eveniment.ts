import type { Event, Location, Profile, Media, Review, City, ListingType } from "@/payload-types"

// Mock Media
const mockMedia: Media[] = [
  {
    id: 1,
    url: "/festival-music-outdoor-stage-lights-crowd.jpg",
    alt: "Festival Muzică în Parc - Imagine principală",
    filename: "festival-main.jpg",
    mimeType: "image/jpeg",
    filesize: 2048000,
    width: 1920,
    height: 1080,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 2,
    url: "/outdoor-concert-stage-evening.jpg",
    alt: "Festival Muzică în Parc - Scenă principală",
    filename: "festival-stage.jpg",
    mimeType: "image/jpeg",
    filesize: 1024000,
    width: 1920,
    height: 1080,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 3,
    url: "/festival-crowd-enjoying-music.jpg",
    alt: "Festival Muzică în Parc - Public",
    filename: "festival-crowd.jpg",
    mimeType: "image/jpeg",
    filesize: 1024000,
    width: 1920,
    height: 1080,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
]

// Mock City
const mockCity: City = {
  id: 1,
  name: "București",
  slug: "bucuresti",
  country: "România",
  county: "București",
  source: "seeded",
  geo: [44.4268, 26.1025],
  usageCount: 150,
  verified: true,
  updatedAt: "2025-01-15T10:00:00Z",
  createdAt: "2025-01-15T10:00:00Z",
}

// Mock Profile (Organizer)
const mockOrganizer: Profile = {
  id: 1,
  user: 1,
  slug: "music-events-ro",
  userType: ["organizer"],
  name: "Music Events România",
  displayName: "Music Events RO",
  bio: "Organizăm cele mai tari festivaluri și concerte din România de peste 10 ani.",
  phone: "+40728567830",
  website: "https://musicevents.ro",
  city: "București",
  avatar: {
    id: 10,
    url: "/music-festival-logo.png",
    alt: "Music Events România Logo",
    filename: "music-events-logo.jpg",
    mimeType: "image/jpeg",
    filesize: 50000,
    width: 100,
    height: 100,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
  socialMedia: {
    facebook: "https://facebook.com/musiceventsro",
    instagram: "https://instagram.com/musiceventsro",
    youtube: "https://youtube.com/@musiceventsro",
  },
  verified: {
    status: "approved",
  },
  rating: {
    average: 4.7,
    count: 12,
  },
  memberSince: "2020-01-15T10:00:00Z",
  views: 8420,
  updatedAt: "2025-01-15T10:00:00Z",
  createdAt: "2020-01-15T10:00:00Z",
}

// Mock Listing Types
const mockListingTypes: ListingType[] = [
  {
    id: 1,
    slug: "festival",
    title: "Festival",
    category: "MUZICĂ & DIVERTISMENT",
    categorySlug: "muzica-divertisment",
    type: "events",
    sortOrder: 1,
    isActive: true,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
]

// Mock Venue Location
const mockVenue: Location = {
  id: 1,
  title: "Parcul Herăstrău - Zona Evenimente",
  slug: "parcul-herastrau-bucuresti",
  owner: mockOrganizer,
  description: "Spațiu în aer liber perfect pentru evenimente mari",
  city: mockCity,
  address: "Șoseaua Nordului nr. 7-9, Sector 1",
  geo: [44.4768, 26.0925],
  contact: {
    email: "contact@parcherastrau.ro",
    phone: "+40212345678",
  },
  status: "approved",
  featuredImage: mockMedia[0],
  gallery: mockMedia,
  views: 5420,
  favoritesCount: 234,
  bookingsCount: 89,
  rating: 4.6,
  reviewCount: 156,
  tier: "standard",
  type: [mockListingTypes[0]],
  suitableFor: [mockListingTypes[0]],
  capacity: {
    outdoor: 5000,
    parking: 200,
  },
  pricing: {
    type: "contact",
    currency: "RON",
  },
  availability: {
    type: "appointment",
  },
  updatedAt: "2025-01-15T10:00:00Z",
  createdAt: "2024-01-15T10:00:00Z",
}

// Mock Event (Main listing)
export const mockEvent: Event = {
  id: 1,
  title: "Festival Muzică în Parc - Ediția de Vară 2025",
  slug: "festival-muzica-in-parc-bucuresti-2025",
  owner: mockOrganizer,
  description: `Festival Muzică în Parc revine cu o ediție spectaculoasă în vara anului 2025! Pregătește-te pentru 3 zile de muzică live, artiști internaționali și locali, food trucks, zone de relaxare și multe surprize.

Lineup-ul acestui an include artiști din diverse genuri muzicale: rock, pop, electronic, indie și multe altele. Fiecare zi va avea o temă diferită și va oferi o experiență unică participanților.

Festivalul se va desfășura în Parcul Herăstrău, într-un cadru natural superb, cu 3 scene principale și zone dedicate pentru copii, food court cu preparate din bucătăria internațională și zone de relaxare.

Biletele sunt limitate! Asigură-ți locul la cel mai așteptat festival al verii și bucură-te de 3 zile de muzică, distracție și amintiri de neuitat alături de prietenii tăi.`,
  city: mockCity,
  address: "Parcul Herăstrău, Șoseaua Nordului nr. 7-9, Sector 1",
  geo: [44.4768, 26.0925],
  contact: {
    email: "info@festivalparc.ro",
    phone: "+40728567830",
    website: "https://festivalparc.ro",
  },
  status: "approved",
  featuredImage: mockMedia[0],
  gallery: mockMedia,
  views: 3542,
  favoritesCount: 456,
  bookingsCount: 1234,
  rating: 4.7,
  reviewCount: 12,
  tier: "sponsored",
  tags: [
    { tag: "festival", id: "1" },
    { tag: "muzică live", id: "2" },
    { tag: "outdoor", id: "3" },
  ],
  socialLinks: {
    facebook: "https://facebook.com/festivalparc",
    instagram: "https://instagram.com/festivalparc",
    youtube: "https://youtube.com/@festivalparc",
  },
  youtubeLinks: [
    { youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", id: "1" },
    { youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", id: "2" },
  ],
  type: [mockListingTypes[0]],
  eventStatus: "upcoming",
  startDate: "2025-07-18T16:00:00Z",
  endDate: "2025-07-20T23:59:00Z",
  allDayEvent: false,
  capacity: {
    total: 5000,
    remaining: 3766,
  },
  pricing: {
    type: "paid",
    amount: 250,
    currency: "RON",
  },
  registrationDeadline: "2025-07-17T23:59:00Z",
  participants: 1234,
  venue: mockVenue,
  venueAddressDetails: {
    venueAddress: "Șoseaua Nordului nr. 7-9, Sector 1",
    venueCity: mockCity,
    venueGeo: [44.4768, 26.0925],
  },
  requirements: [
    {
      requirement: "Vârstă minimă",
      description: "Participanții trebuie să aibă minimum 16 ani. Sub 18 ani doar însoțiți de părinți.",
      id: "1",
    },
    {
      requirement: "Bilet valid",
      description: "Biletul trebuie prezentat la intrare (fizic sau digital).",
      id: "2",
    },
  ],
  updatedAt: "2025-01-15T10:00:00Z",
  createdAt: "2024-12-01T10:00:00Z",
}

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: 1,
    listing: { relationTo: "events", value: 1 },
    user: {
      id: 2,
      user: 2,
      slug: "alexandra-ion",
      name: "Alexandra Ion",
      displayName: "Alexandra I.",
      avatar: {
        id: 20,
        url: "/placeholder.svg?height=50&width=50",
        alt: "Alexandra Ion",
        filename: "alexandra.jpg",
        mimeType: "image/jpeg",
        filesize: 25000,
        width: 50,
        height: 50,
        updatedAt: "2025-01-15T10:00:00Z",
        createdAt: "2025-01-15T10:00:00Z",
      },
      updatedAt: "2025-01-15T10:00:00Z",
      createdAt: "2024-06-15T10:00:00Z",
    },
    status: "approved",
    rating: 5,
    comment:
      "Am fost la ediția din 2024 și a fost incredibil! Artiștii au fost super, organizarea impecabilă și atmosfera de neuitat. Abia aștept ediția din 2025!",
    createdAt: "2024-08-20T10:00:00Z",
    updatedAt: "2024-08-20T10:00:00Z",
  },
  {
    id: 2,
    listing: { relationTo: "events", value: 1 },
    user: {
      id: 3,
      user: 3,
      slug: "mihai-popescu",
      name: "Mihai Popescu",
      displayName: "Mihai P.",
      avatar: {
        id: 21,
        url: "/placeholder.svg?height=50&width=50",
        alt: "Mihai Popescu",
        filename: "mihai.jpg",
        mimeType: "image/jpeg",
        filesize: 25000,
        width: 50,
        height: 50,
        updatedAt: "2025-01-15T10:00:00Z",
        createdAt: "2025-01-15T10:00:00Z",
      },
      updatedAt: "2025-01-15T10:00:00Z",
      createdAt: "2024-03-10T10:00:00Z",
    },
    status: "approved",
    rating: 4,
    comment:
      "Festival mișto, lineup bun și locație super. Singurul minus ar fi cozile la food trucks, dar în rest totul a fost ok. Recomand!",
    createdAt: "2024-08-15T10:00:00Z",
    updatedAt: "2024-08-15T10:00:00Z",
  },
]

// Mock Similar Events (for recommendations)
export const mockSimilarEvents: Event[] = [
  {
    ...mockEvent,
    id: 2,
    title: "Concert Rock în Aer Liber - Legends Tour",
    slug: "concert-rock-legends-bucuresti",
    featuredImage: {
      ...mockMedia[0],
      id: 100,
      url: "/rock-concert-outdoor-stage.jpg",
      alt: "Concert Rock Legends",
    },
    startDate: "2025-08-15T19:00:00Z",
    endDate: "2025-08-15T23:00:00Z",
    pricing: {
      type: "paid",
      amount: 150,
      currency: "RON",
    },
    rating: 4.8,
    reviewCount: 45,
    participants: 2500,
  },
  {
    ...mockEvent,
    id: 3,
    title: "Festival Electronic Music - Summer Vibes",
    slug: "festival-electronic-summer-vibes",
    featuredImage: {
      ...mockMedia[0],
      id: 101,
      url: "/electronic-music-festival-lights.jpg",
      alt: "Festival Electronic Summer Vibes",
    },
    city: { ...mockCity, id: 2, name: "Cluj-Napoca", slug: "cluj-napoca" },
    startDate: "2025-09-01T18:00:00Z",
    endDate: "2025-09-03T23:59:00Z",
    pricing: {
      type: "paid",
      amount: 300,
      currency: "RON",
    },
    rating: 4.9,
    reviewCount: 67,
    participants: 3200,
  },
]
