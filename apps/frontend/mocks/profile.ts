import type { User, Profile } from "@/types/payload-types"
import type { LocationMock } from "./home/locations"
import type { ServiceMock } from "./home/services"
import type { EventMock } from "./home/events"

// Review type (not in Payload, local to profile page)
export interface ReviewMock {
  id: number
  authorName: string
  authorAvatar?: string
  rating: number
  date: string
  comment: string
}

// Mock user with profile
export const mockProfileUser: User & { profile: Profile } = {
  id: 1,
  displayName: "Ernest Slach",
  avatarURL: "/professional-avatar.png",
  roles: ["organizer", "host", "provider"],
  status: "active",
  email: "ernest.slach@example.com",
  agreeTermsAndConditions: true,
  agreePrivacyPolicy: true,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2025-01-10T15:30:00Z",
  profile: {
    id: 1,
    user: 1,
    userType: ["organizer", "host", "provider"],
    name: "Ernest Slach Events & Venues",
    displayName: "Ernest Slach",
    bio: "Organizator de evenimente cu peste 10 ani experiență. Ofer locații premium și servicii complete pentru evenimente corporate și private în București și Ilfov.",
    phone: "+40 721 234 567",
    website: "https://ernestslach.ro",
    city: "București",
    socialMedia: {
      facebook: "https://facebook.com/ernestslach",
      instagram: "https://instagram.com/ernestslach",
      linkedin: "https://linkedin.com/in/ernestslach",
      youtube: "https://youtube.com/@ernestslach",
      tiktok: null,
      twitch: null,
      x: "https://x.com/ernestslach",
    },
    verified: {
      status: "approved",
      documents: [],
      verificationData: {
        fullName: "Ernest Slach",
        address: "București, Sector 1",
        isCompany: true,
        companyName: "Ernest Slach Events SRL",
        cui: "RO12345678",
        companyAddress: "Str. Exemplu nr. 1, București",
      },
    },
    rating: {
      average: 5.0,
      count: 1,
    },
    memberSince: "2024-01-15T10:00:00Z",
    lastOnline: "2025-01-16T14:20:00Z",
    views: 1247,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2025-01-10T15:30:00Z",
  },
}

// Mock listings for this profile
export const mockProfileLocations: LocationMock[] = [
  {
    id: 101,
    title: "Vila Panoramic - Locație de vis",
    description: "Spațiu elegant cu grădină amenajată și vedere panoramică.",
    image: "/elegant-wedding-venue.png",
    city: "București",
    capacity: 200,
    type: "Sală de evenimente",
    verified: true,
    rating: { average: 4.9, count: 23 },
  },
  {
    id: 102,
    title: "Loft Industrial Berceni",
    description: "Spațiu modern perfect pentru evenimente corporate.",
    image: "/industrial-loft-venue.jpg",
    city: "București",
    capacity: 150,
    type: "Loft",
    verified: true,
    rating: { average: 4.8, count: 17 },
  },
]

export const mockProfileServices: ServiceMock[] = [
  {
    id: 201,
    name: "Organizare evenimente complete",
    type: "Organizare evenimente",
    avatar: "/event-planning.jpg",
    city: "București",
    verified: true,
    rating: { average: 5.0, count: 34 },
  },
]

export const mockProfileEvents: EventMock[] = [
  {
    id: 301,
    title: "Gala Antreprenorilor 2025",
    description: "Eveniment de networking pentru antreprenori și investitori.",
    image: "/business-gala-event.jpg",
    day: "Vineri",
    date: "28 februarie 2025",
    time: "19:00 - 23:00",
    city: "București",
    verified: true,
    rating: { average: 4.9, count: 45 },
  },
]

// Mock reviews
export const mockProfileReviews: ReviewMock[] = [
  {
    id: 1,
    authorName: "Testache Tester",
    authorAvatar: "/diverse-user-avatars.png",
    rating: 5,
    date: "2025-01-06T10:00:00Z",
    comment:
      "Experiență excelentă! Ernest a organizat evenimentul nostru corporate impecabil. Locația a fost perfectă și toate detaliile au fost gestionate profesional. Recomand cu încredere!",
  },
]
