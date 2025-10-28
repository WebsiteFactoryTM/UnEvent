import type { Service, City, User } from "@/types/payload-types"

// Extended Service type with all needed fields for the account area
export interface MyService extends Omit<Service, "city" | "owner"> {
  title: string
  owner: number | User
  city: number | City | null
  status: "pending" | "approved" | "rejected" | "sponsored" | null
  rejectionReason?: string | null
  views?: number | null
  tier?: "free" | "basic" | "premium" | "sponsored" | null
  featuredImage?: string | null
  category?: string | null // Service category for badge/icon
}

export const mockMyServices: MyService[] = [
  {
    id: 1,
    name: "Catering Premium Events",
    title: "Catering Premium Events",
    slug: "catering-premium-events",
    description:
      "Servicii complete de catering pentru evenimente corporate și private. Meniuri personalizate, prezentare impecabilă și echipă profesionistă.",
    type: "events",
    category: "Catering",
    owner: 1,
    city: { id: 1, name: "București", slug: "bucuresti", createdAt: "2024-01-15", updatedAt: "2024-01-15" },
    status: "approved",
    views: 1247,
    tier: "premium",
    featuredImage: "/gourmet-catering-service.jpg",
    rating: {
      average: 4.9,
      count: 34,
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "Studio Foto Memories",
    title: "Studio Foto Memories",
    slug: "studio-foto-memories",
    description:
      "Fotografie profesională pentru nunți, botezuri și evenimente speciale. Pachet complet: foto + video + drone + album premium.",
    type: "events",
    category: "Fotografie",
    owner: 1,
    city: { id: 2, name: "Cluj-Napoca", slug: "cluj-napoca", createdAt: "2024-02-10", updatedAt: "2024-02-10" },
    status: "pending",
    views: 523,
    tier: "basic",
    featuredImage: "/professional-photography.jpg",
    rating: {
      average: 4.7,
      count: 18,
    },
    createdAt: "2024-03-20T14:30:00Z",
    updatedAt: "2024-03-20T14:30:00Z",
  },
  {
    id: 3,
    name: "DJ Alex Entertainment",
    title: "DJ Alex Entertainment",
    slug: "dj-alex-entertainment",
    description:
      "Servicii DJ profesionist pentru nunți și petreceri private. Echipament de ultimă generație și playlist personalizat.",
    type: "events",
    category: "Muzică",
    owner: 1,
    city: { id: 3, name: "Timișoara", slug: "timisoara", createdAt: "2024-02-20", updatedAt: "2024-02-20" },
    status: "rejected",
    rejectionReason: "Vă rugăm să adăugați certificări profesionale și referințe verificabile.",
    views: 234,
    tier: "free",
    featuredImage: "/dj-professional-equipment.jpg",
    rating: {
      average: 4.5,
      count: 12,
    },
    createdAt: "2024-03-10T09:15:00Z",
    updatedAt: "2024-03-10T09:15:00Z",
  },
  {
    id: 4,
    name: "Decorațiuni Elegante",
    title: "Decorațiuni Elegante",
    slug: "decoratiuni-elegante",
    description:
      "Decorațiuni florale și tematice pentru evenimente. Design personalizat, montaj și demontaj incluse. Experiență de peste 10 ani.",
    type: "events",
    category: "Decorațiuni",
    owner: 1,
    city: { id: 1, name: "București", slug: "bucuresti", createdAt: "2024-01-15", updatedAt: "2024-01-15" },
    status: "sponsored",
    views: 2156,
    tier: "sponsored",
    featuredImage: "/elegant-decorations.jpg",
    rating: {
      average: 5.0,
      count: 47,
    },
    createdAt: "2023-11-05T11:20:00Z",
    updatedAt: "2023-11-05T11:20:00Z",
  },
  {
    id: 5,
    name: "Invitații Personalizate Art",
    title: "Invitații Personalizate Art",
    slug: "invitatii-personalizate-art",
    description:
      "Design și tipărire invitații pentru nunți, botezuri și evenimente corporate. Materiale premium și finisaje speciale.",
    type: "events",
    category: "Papetărie",
    owner: 1,
    city: { id: 4, name: "Brașov", slug: "brasov", createdAt: "2024-03-01", updatedAt: "2024-03-01" },
    status: "approved",
    views: 678,
    tier: "basic",
    featuredImage: "/custom-invitations.jpg",
    rating: {
      average: 4.8,
      count: 23,
    },
    createdAt: "2024-02-14T16:45:00Z",
    updatedAt: "2024-02-14T16:45:00Z",
  },
]
