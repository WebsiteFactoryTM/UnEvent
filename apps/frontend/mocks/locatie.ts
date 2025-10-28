import type { Location, Profile, Media, Review, City, Facility, ListingType } from "@/payload-types"

// Mock Media
const mockMedia: Media[] = [
  {
    id: 1,
    url: "/elegant-wedding-garden.png",
    alt: "Vila Panoramic - Imagine principală",
    filename: "vila-panoramic-main.jpg",
    mimeType: "image/jpeg",
    filesize: 2048000,
    width: 1920,
    height: 1080,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 2,
    url: "/elegant-wedding-garden.png",
    alt: "Vila Panoramic - Grădină",
    filename: "vila-panoramic-garden.jpg",
    mimeType: "image/jpeg",
    filesize: 1024000,
    width: 1920,
    height: 1080,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 3,
    url: "/elegant-wedding-garden.png",
    alt: "Vila Panoramic - Terasă",
    filename: "vila-panoramic-terrace.jpg",
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

// Mock Profile (Owner)
const mockOwner: Profile = {
  id: 1,
  user: 1,
  slug: "events-premium-srl",
  userType: ["host"],
  name: "Events Premium SRL",
  displayName: "Events Premium",
  bio: "Organizăm evenimente de neuitat de peste 15 ani. Spații premium pentru orice tip de eveniment.",
  phone: "+40728567830",
  website: "https://eventspremium.ro",
  city: "București",
  avatar: {
    id: 10,
    url: "/placeholder.svg?height=100&width=100",
    alt: "Events Premium Logo",
    filename: "events-premium-logo.jpg",
    mimeType: "image/jpeg",
    filesize: 50000,
    width: 100,
    height: 100,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
  socialMedia: {
    facebook: "https://facebook.com/eventspremium",
    instagram: "https://instagram.com/eventspremium",
    linkedin: "https://linkedin.com/company/eventspremium",
    youtube: "https://youtube.com/@eventspremium",
  },
  verified: {
    status: "approved",
  },
  rating: {
    average: 4.8,
    count: 47,
  },
  memberSince: "2020-01-15T10:00:00Z",
  views: 15420,
  updatedAt: "2025-01-15T10:00:00Z",
  createdAt: "2020-01-15T10:00:00Z",
}

// Mock Facilities
const mockFacilities: Facility[] = [
  {
    id: 1,
    slug: "bar-echipat",
    title: "Bar echipat",
    category: "CATERING & BAR",
    categorySlug: "catering-bar",
    sortOrder: 1,
    isActive: true,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 2,
    slug: "bucatarie-profesionala",
    title: "Bucătărie profesională",
    category: "CATERING & BAR",
    categorySlug: "catering-bar",
    sortOrder: 2,
    isActive: true,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 3,
    slug: "parcare-privata",
    title: "Parcare privată",
    category: "ACCES & FACILITĂȚI",
    categorySlug: "acces-facilitati",
    sortOrder: 1,
    isActive: true,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 4,
    slug: "aer-conditionat",
    title: "Aer condiționat",
    category: "CONFORT",
    categorySlug: "confort",
    sortOrder: 1,
    isActive: true,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
]

// Mock Listing Types
const mockListingTypes: ListingType[] = [
  {
    id: 1,
    slug: "sala-evenimente",
    title: "Sală de evenimente",
    category: "LOCAȚII",
    categorySlug: "locatii",
    type: "locations",
    sortOrder: 1,
    isActive: true,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 2,
    slug: "nunta",
    title: "Nuntă",
    category: "NUNȚI & CEREMONII",
    categorySlug: "nunti-ceremonii",
    type: "events",
    sortOrder: 1,
    isActive: true,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
]

// Mock Location (Main listing)
export const mockLocation: Location = {
  id: 1,
  title: "Vila Panoramic - Locație de vis pentru evenimente speciale",
  slug: "vila-panoramic-bucuresti",
  owner: mockOwner,
  description: `Vila Panoramic este locația perfectă pentru evenimentele tale speciale. Situată în zona de nord a Bucureștiului, vila noastră oferă un cadru elegant și sofisticat pentru nunți, botezuri, aniversări și evenimente corporate.

Spațiul nostru combină eleganța clasică cu facilitățile moderne, oferind oaspeților tăi o experiență de neuitat. Grădina amenajată cu grijă, terasa acoperită și vedere panoramică creează atmosfera perfectă pentru orice tip de eveniment.

Echipa noastră dedicată va fi alături de tine în fiecare etapă a organizării, asigurându-se că fiecare detaliu este perfect. De la decorațiuni personalizate până la servicii de catering de top, ne ocupăm de tot pentru ca tu să te bucuri de evenimentul tău.`,
  city: mockCity,
  address: "Strada Panoramei nr. 15, Sector 1",
  geo: [44.4768, 26.0925],
  contact: {
    email: "contact@vilapanoramic.ro",
    phone: "+40728567830",
    website: "https://vilapanoramic.ro",
  },
  status: "approved",
  featuredImage: mockMedia[0],
  gallery: mockMedia,
  views: 1542,
  favoritesCount: 89,
  bookingsCount: 47,
  rating: 4.8,
  reviewCount: 47,
  tier: "recommended",
  tags: [
    { tag: "nuntă", id: "1" },
    { tag: "botez", id: "2" },
    { tag: "corporate", id: "3" },
  ],
  socialLinks: {
    facebook: "https://facebook.com/vilapanoramic",
    instagram: "https://instagram.com/vilapanoramic",
  },
  youtubeLinks: [
    { youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", id: "1" },
    { youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", id: "2" },
  ],
  type: [mockListingTypes[0]],
  suitableFor: [mockListingTypes[1]],
  capacity: {
    indoor: 150,
    outdoor: 200,
    seating: 180,
    parking: 50,
  },
  surface: 450,
  pricing: {
    type: "from",
    amount: 5000,
    currency: "RON",
    period: "event",
  },
  availability: {
    type: "custom",
    schedule: [
      { day: "friday", startTime: "18:00", endTime: "02:00", id: "1" },
      { day: "saturday", startTime: "12:00", endTime: "02:00", id: "2" },
      { day: "sunday", startTime: "12:00", endTime: "22:00", id: "3" },
    ],
  },
  facilities: mockFacilities,
  updatedAt: "2025-01-15T10:00:00Z",
  createdAt: "2024-01-15T10:00:00Z",
}

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: 1,
    listing: { relationTo: "locations", value: 1 },
    user: {
      id: 2,
      user: 2,
      slug: "maria-popescu",
      name: "Maria Popescu",
      displayName: "Maria P.",
      avatar: {
        id: 20,
        url: "/placeholder.svg?height=50&width=50",
        alt: "Maria Popescu",
        filename: "maria.jpg",
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
      "Locație absolut superbă! Am organizat nunta aici și totul a fost perfect. Personalul foarte profesionist, mâncarea delicioasă și atmosfera de vis. Recomand cu încredere!",
    createdAt: "2024-12-20T10:00:00Z",
    updatedAt: "2024-12-20T10:00:00Z",
  },
  {
    id: 2,
    listing: { relationTo: "locations", value: 1 },
    user: {
      id: 3,
      user: 3,
      slug: "ion-ionescu",
      name: "Ion Ionescu",
      displayName: "Ion I.",
      avatar: {
        id: 21,
        url: "/placeholder.svg?height=50&width=50",
        alt: "Ion Ionescu",
        filename: "ion.jpg",
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
    rating: 5,
    comment:
      "Am organizat un eveniment corporate aici și a fost o experiență excelentă. Spațiul este generos, facilitățile moderne și echipa foarte cooperantă. Vom reveni cu siguranță!",
    createdAt: "2024-11-15T10:00:00Z",
    updatedAt: "2024-11-15T10:00:00Z",
  },
  {
    id: 3,
    listing: { relationTo: "locations", value: 1 },
    user: {
      id: 4,
      user: 4,
      slug: "ana-georgescu",
      name: "Ana Georgescu",
      displayName: "Ana G.",
      avatar: {
        id: 22,
        url: "/placeholder.svg?height=50&width=50",
        alt: "Ana Georgescu",
        filename: "ana.jpg",
        mimeType: "image/jpeg",
        filesize: 25000,
        width: 50,
        height: 50,
        updatedAt: "2025-01-15T10:00:00Z",
        createdAt: "2025-01-15T10:00:00Z",
      },
      updatedAt: "2025-01-15T10:00:00Z",
      createdAt: "2024-08-20T10:00:00Z",
    },
    status: "approved",
    rating: 4,
    comment:
      "Locație frumoasă cu grădină amenajată superb. Singurul minus ar fi parcarea care se umple repede la evenimente mari. În rest, totul a fost foarte bine organizat.",
    createdAt: "2024-10-05T10:00:00Z",
    updatedAt: "2024-10-05T10:00:00Z",
  },
]

// Mock Similar Locations (for recommendations)
export const mockSimilarLocations: Location[] = [
  {
    ...mockLocation,
    id: 2,
    title: "Castel Bran Events - Experiență medievală unică",
    slug: "castel-bran-events",
    featuredImage: {
      ...mockMedia[0],
      id: 100,
      url: "/medieval-castle-venue.jpg",
      alt: "Castel Bran Events",
    },
    city: { ...mockCity, id: 2, name: "Brașov", slug: "brasov" },
    rating: 4.9,
    reviewCount: 89,
  },
  {
    ...mockLocation,
    id: 3,
    title: "Loft Industrial Timișoara - Spațiu modern și versatil",
    slug: "loft-industrial-timisoara",
    featuredImage: {
      ...mockMedia[0],
      id: 101,
      url: "/industrial-loft-event-space.jpg",
      alt: "Loft Industrial",
    },
    city: { ...mockCity, id: 3, name: "Timișoara", slug: "timisoara" },
    rating: 4.7,
    reviewCount: 23,
  },
]

// Mock current user (for UI-only features like edit/promote buttons)
export const mockCurrentUser = {
  id: 1,
  isOwner: true, // Set to true to see owner-only features
  isAdmin: false,
}
