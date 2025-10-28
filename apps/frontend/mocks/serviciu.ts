import type { Service, Profile, Media, Review, City, ListingType } from "@/payload-types"

// Mock Media
const mockMedia: Media[] = [
  {
    id: 201,
    url: "/dj-professional-equipment-setup.jpg",
    alt: "DJ Marian - Echipament profesional",
    filename: "dj-marian-profile.jpg",
    mimeType: "image/jpeg",
    filesize: 1024000,
    width: 400,
    height: 400,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 202,
    url: "/dj-performing-at-wedding.jpg",
    alt: "DJ Marian - Nuntă",
    filename: "dj-wedding.jpg",
    mimeType: "image/jpeg",
    filesize: 2048000,
    width: 1200,
    height: 800,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 203,
    url: "/dj-equipment-and-lights-at-event.jpg",
    alt: "DJ Marian - Echipament",
    filename: "dj-equipment.jpg",
    mimeType: "image/jpeg",
    filesize: 2048000,
    width: 1200,
    height: 800,
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

// Mock Profile (Provider/Owner)
const mockProvider: Profile = {
  id: 101,
  user: 101,
  slug: "dj-marian",
  userType: ["provider"],
  name: "DJ Marian",
  displayName: "DJ Marian",
  bio: "DJ profesionist cu peste 10 ani de experiență în organizarea de evenimente. Specializat în nunți, botezuri și evenimente corporate.",
  phone: "+40728567830",
  website: "https://djmarian.ro",
  city: "București",
  avatar: mockMedia[0],
  socialMedia: {
    facebook: "https://facebook.com/djmarian",
    instagram: "https://instagram.com/djmarian",
    youtube: "https://youtube.com/@djmarian",
  },
  verified: {
    status: "approved",
  },
  rating: {
    average: 4.9,
    count: 31,
  },
  memberSince: "2018-03-15T10:00:00Z",
  views: 8420,
  updatedAt: "2025-01-15T10:00:00Z",
  createdAt: "2018-03-15T10:00:00Z",
}

// Mock Listing Types
const mockServiceTypes: ListingType[] = [
  {
    id: 101,
    slug: "dj-sonorizare",
    title: "DJ & Sonorizare",
    category: "MUZICĂ & ENTERTAINMENT",
    categorySlug: "muzica-entertainment",
    type: "services",
    sortOrder: 1,
    isActive: true,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
]

const mockEventTypes: ListingType[] = [
  {
    id: 201,
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
  {
    id: 202,
    slug: "botez",
    title: "Botez",
    category: "NUNȚI & CEREMONII",
    categorySlug: "nunti-ceremonii",
    type: "events",
    sortOrder: 2,
    isActive: true,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 203,
    slug: "corporate",
    title: "Corporate",
    category: "BUSINESS & CORPORATE",
    categorySlug: "business-corporate",
    type: "events",
    sortOrder: 1,
    isActive: true,
    updatedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
]

// Mock Service (Main listing)
export const mockService: Service = {
  id: 1001,
  title: "DJ Marian - Servicii DJ profesionale pentru evenimente",
  slug: "dj-marian-bucuresti",
  owner: mockProvider,
  description: `Bun venit! Sunt DJ Marian, un DJ profesionist cu peste 10 ani de experiență în organizarea și animarea evenimentelor speciale. Pasiunea mea pentru muzică și dedicarea față de fiecare eveniment m-au transformat într-unul dintre cei mai solicitați DJ-i din București.

**De ce să mă alegi?**

Fiecare eveniment este unic și merită o abordare personalizată. Lucrez îndeaproape cu fiecare client pentru a înțelege viziunea și preferințele muzicale, creând o atmosferă perfectă care să reflecte personalitatea și stilul evenimentului tău.

**Experiență vastă**

Am avut privilegiul de a anima peste 500 de evenimente, de la nunți intime la petreceri corporate de amploare. Portofoliul meu include colaborări cu cele mai prestigioase locații și organizatori de evenimente din București și din țară.

**Echipament profesional**

Investesc constant în echipament de ultimă generație pentru a oferi cea mai bună calitate audio și vizuală. Sistemul meu de sonorizare profesional și efectele de lumini LED creează o experiență completă pentru invitații tăi.

**Flexibilitate și profesionalism**

Mă adaptez oricărui tip de eveniment și oricărei cerințe speciale. Sunt punctual, organizat și mă asigur că totul funcționează perfect din punct de vedere tehnic, astfel încât tu să te poți bucura de evenimentul tău fără griji.`,
  city: mockCity,
  address: "Sector 1, București",
  geo: [44.4768, 26.0925],
  contact: {
    email: "contact@djmarian.ro",
    phone: "+40728567830",
    website: "https://djmarian.ro",
  },
  status: "approved",
  featuredImage: mockMedia[0],
  gallery: mockMedia,
  views: 842,
  favoritesCount: 67,
  bookingsCount: 31,
  rating: 4.9,
  reviewCount: 31,
  tier: "recommended",
  tags: [
    { tag: "dj", id: "1" },
    { tag: "sonorizare", id: "2" },
    { tag: "lumini", id: "3" },
    { tag: "nunta", id: "4" },
  ],
  socialLinks: {
    facebook: "https://facebook.com/djmarian",
    instagram: "https://instagram.com/djmarian",
    youtube: "https://youtube.com/@djmarian",
  },
  youtubeLinks: [
    { youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", id: "1" },
    { youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", id: "2" },
  ],
  type: mockServiceTypes,
  suitableFor: mockEventTypes,
  pricing: {
    type: "from",
    amount: 2500,
    currency: "RON",
    period: "event",
  },
  availability: {
    type: "custom",
    schedule: [
      { day: "friday", startTime: "18:00", endTime: "04:00", id: "1" },
      { day: "saturday", startTime: "12:00", endTime: "04:00", id: "2" },
      { day: "sunday", startTime: "12:00", endTime: "02:00", id: "3" },
    ],
  },
  features: [
    {
      feature: "Sistem de sonorizare profesional",
      description: "Echipament audio de ultimă generație pentru sunet cristal",
      id: "1",
    },
    {
      feature: "Efecte de lumini LED",
      description: "Lumini profesionale pentru o atmosferă spectaculoasă",
      id: "2",
    },
    {
      feature: "Playlist personalizat",
      description: "Muzică adaptată preferințelor tale și ale invitaților",
      id: "3",
    },
    {
      feature: "MC / Prezentator",
      description: "Animare și prezentare profesională a evenimentului",
      id: "4",
    },
    {
      feature: "Backup echipament",
      description: "Echipament de rezervă pentru siguranță maximă",
      id: "5",
    },
    {
      feature: "Consultanță muzicală",
      description: "Sfaturi profesionale pentru alegerea muzicii perfecte",
      id: "6",
    },
  ],
  updatedAt: "2025-01-15T10:00:00Z",
  createdAt: "2023-01-15T10:00:00Z",
}

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: 1001,
    listing: { relationTo: "services", value: 1001 },
    user: {
      id: 1002,
      user: 1002,
      slug: "elena-ionescu",
      name: "Elena Ionescu",
      displayName: "Elena I.",
      avatar: {
        id: 2001,
        url: "/placeholder.svg?height=50&width=50",
        alt: "Elena Ionescu",
        filename: "elena.jpg",
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
      "DJ Marian a fost absolut fantastic la nunta noastră! Muzica a fost perfectă, toți invitații au dansat toată seara. Foarte profesionist și atent la detalii. Recomand cu încredere!",
    createdAt: "2024-12-20T10:00:00Z",
    updatedAt: "2024-12-20T10:00:00Z",
  },
  {
    id: 1002,
    listing: { relationTo: "services", value: 1001 },
    user: {
      id: 1003,
      user: 1003,
      slug: "andrei-popescu",
      name: "Andrei Popescu",
      displayName: "Andrei P.",
      avatar: {
        id: 2002,
        url: "/placeholder.svg?height=50&width=50",
        alt: "Andrei Popescu",
        filename: "andrei.jpg",
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
      "Am colaborat cu DJ Marian pentru un eveniment corporate și a fost o experiență excelentă. Echipament profesional, punctualitate și o selecție muzicală perfectă pentru publicul nostru. Vom colabora din nou!",
    createdAt: "2024-11-15T10:00:00Z",
    updatedAt: "2024-11-15T10:00:00Z",
  },
  {
    id: 1003,
    listing: { relationTo: "services", value: 1001 },
    user: {
      id: 1004,
      user: 1004,
      slug: "maria-georgescu",
      name: "Maria Georgescu",
      displayName: "Maria G.",
      avatar: {
        id: 2003,
        url: "/placeholder.svg?height=50&width=50",
        alt: "Maria Georgescu",
        filename: "maria.jpg",
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
    rating: 5,
    comment:
      "Cel mai bun DJ cu care am lucrat! Marian a înțeles perfect ce ne doream și a creat o atmosferă de neuitat la botezul fiului nostru. Mulțumim pentru tot!",
    createdAt: "2024-10-05T10:00:00Z",
    updatedAt: "2024-10-05T10:00:00Z",
  },
]

// Mock Similar Services (for recommendations)
export const mockSimilarServices: Service[] = [
  {
    ...mockService,
    id: 1002,
    title: "DJ Alex - Muzică și animare pentru orice eveniment",
    slug: "dj-alex-bucuresti",
    description: "DJ profesionist cu experiență în evenimente de toate tipurile. Echipament modern și repertoriu vast.",
    owner: {
      ...mockProvider,
      id: 102,
      name: "DJ Alex",
      displayName: "DJ Alex",
      slug: "dj-alex",
    },
    featuredImage: {
      id: 300,
      url: "/dj-performing-at-night-club.jpg",
      alt: "DJ Alex - Muzică și animare",
      filename: "dj-alex.jpg",
      mimeType: "image/jpeg",
      filesize: 1024000,
      width: 800,
      height: 800,
      updatedAt: "2025-01-15T10:00:00Z",
      createdAt: "2025-01-15T10:00:00Z",
    },
    gallery: [
      {
        id: 300,
        url: "/dj-performing-at-night-club.jpg",
        alt: "DJ Alex",
        filename: "dj-alex.jpg",
        mimeType: "image/jpeg",
        filesize: 1024000,
        width: 800,
        height: 800,
        updatedAt: "2025-01-15T10:00:00Z",
        createdAt: "2025-01-15T10:00:00Z",
      },
    ],
    rating: 4.8,
    reviewCount: 45,
    pricing: {
      type: "from",
      amount: 2000,
      currency: "RON",
      period: "event",
    },
  },
  {
    ...mockService,
    id: 1003,
    title: "Foto Video Pro - Servicii foto-video profesionale",
    slug: "foto-video-pro-bucuresti",
    description: "Fotografie și videografie profesională pentru evenimente. Capturăm cele mai frumoase momente.",
    owner: {
      ...mockProvider,
      id: 103,
      name: "Foto Video Pro",
      displayName: "Foto Video Pro",
      slug: "foto-video-pro",
    },
    featuredImage: {
      id: 301,
      url: "/photographer-with-professional-camera.jpg",
      alt: "Foto Video Pro - Servicii foto-video",
      filename: "foto-video-pro.jpg",
      mimeType: "image/jpeg",
      filesize: 1024000,
      width: 800,
      height: 800,
      updatedAt: "2025-01-15T10:00:00Z",
      createdAt: "2025-01-15T10:00:00Z",
    },
    gallery: [
      {
        id: 301,
        url: "/photographer-with-professional-camera.jpg",
        alt: "Foto Video Pro",
        filename: "foto-video-pro.jpg",
        mimeType: "image/jpeg",
        filesize: 1024000,
        width: 800,
        height: 800,
        updatedAt: "2025-01-15T10:00:00Z",
        createdAt: "2025-01-15T10:00:00Z",
      },
    ],
    type: [
      {
        id: 102,
        slug: "foto-video",
        title: "Foto & Video",
        category: "FOTOGRAFIE & VIDEO",
        categorySlug: "fotografie-video",
        type: "services",
        sortOrder: 1,
        isActive: true,
        updatedAt: "2025-01-15T10:00:00Z",
        createdAt: "2025-01-15T10:00:00Z",
      },
    ],
    rating: 4.9,
    reviewCount: 67,
    pricing: {
      type: "from",
      amount: 3500,
      currency: "RON",
      period: "event",
    },
  },
  {
    ...mockService,
    id: 1004,
    title: "Trupa Harmony - Formație live pentru evenimente",
    slug: "trupa-harmony-bucuresti",
    description: "Formație live cu repertoriu variat. Muzică de calitate pentru orice tip de eveniment.",
    owner: {
      ...mockProvider,
      id: 104,
      name: "Trupa Harmony",
      displayName: "Trupa Harmony",
      slug: "trupa-harmony",
    },
    featuredImage: {
      id: 302,
      url: "/live-band-musicians.jpg",
      alt: "Trupa Harmony - Formație live",
      filename: "trupa-harmony.jpg",
      mimeType: "image/jpeg",
      filesize: 1024000,
      width: 800,
      height: 800,
      updatedAt: "2025-01-15T10:00:00Z",
      createdAt: "2025-01-15T10:00:00Z",
    },
    gallery: [
      {
        id: 302,
        url: "/live-band-musicians.jpg",
        alt: "Trupa Harmony",
        filename: "trupa-harmony.jpg",
        mimeType: "image/jpeg",
        filesize: 1024000,
        width: 800,
        height: 800,
        updatedAt: "2025-01-15T10:00:00Z",
        createdAt: "2025-01-15T10:00:00Z",
      },
    ],
    type: [
      {
        id: 103,
        slug: "formatie-live",
        title: "Formație Live",
        category: "MUZICĂ & ENTERTAINMENT",
        categorySlug: "muzica-entertainment",
        type: "services",
        sortOrder: 2,
        isActive: true,
        updatedAt: "2025-01-15T10:00:00Z",
        createdAt: "2025-01-15T10:00:00Z",
      },
    ],
    rating: 4.7,
    reviewCount: 38,
    pricing: {
      type: "from",
      amount: 4000,
      currency: "RON",
      period: "event",
    },
  },
]

// Mock current user (for UI-only features)
export const mockCurrentUser = {
  id: 101,
  isOwner: false, // Set to true to see owner-only features
  isAdmin: false,
}
