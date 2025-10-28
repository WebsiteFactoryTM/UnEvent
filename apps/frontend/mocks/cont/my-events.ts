import type { User, City, Media } from "@/types/payload-types"

// Extended Event type for "Evenimentele mele" with all necessary fields
export interface MyEvent {
  id: number
  title: string
  slug: string
  owner: number | User
  description: string
  city: number | City | null
  status: "pending" | "approved" | "rejected" | "sponsored" | null
  rejectionReason?: string | null
  featuredImage?: (number | null) | Media
  views?: number | null
  tier?: ("free" | "basic" | "premium" | "sponsored") | null
  startDate: string
  endDate: string
  participants?: number | null
  eventStatus?: "upcoming" | "active" | "completed" | null
  createdAt: string
  updatedAt: string
}

export const mockMyEvents: MyEvent[] = [
  {
    id: 1,
    title: "Târg de Nunți București 2024",
    slug: "targ-de-nunti-bucuresti-2024",
    owner: 1,
    description: "Cel mai mare târg de nunți din România cu peste 100 de expozanți și demonstrații live.",
    city: { id: 1, name: "București", slug: "bucuresti", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    status: "approved",
    featuredImage: null,
    views: 2847,
    tier: "sponsored",
    startDate: "2024-06-15T10:00:00Z",
    endDate: "2024-06-16T20:00:00Z",
    participants: 1250,
    eventStatus: "completed",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-06-17T10:00:00Z",
  },
  {
    id: 2,
    title: "Workshop Fotografie de Nuntă",
    slug: "workshop-fotografie-de-nunta",
    owner: 1,
    description: "Învață tehnicile profesionale de fotografie de nuntă de la cei mai buni fotografi din țară.",
    city: { id: 2, name: "Cluj-Napoca", slug: "cluj-napoca", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    status: "approved",
    featuredImage: null,
    views: 1523,
    tier: "premium",
    startDate: "2024-12-20T09:00:00Z",
    endDate: "2024-12-20T18:00:00Z",
    participants: 45,
    eventStatus: "upcoming",
    createdAt: "2024-02-10T14:30:00Z",
    updatedAt: "2024-11-15T10:00:00Z",
  },
  {
    id: 3,
    title: "Gala Furnizorilor de Evenimente",
    slug: "gala-furnizorilor-de-evenimente",
    owner: 1,
    description: "Eveniment de networking pentru profesioniștii din industria evenimentelor.",
    city: { id: 3, name: "Timișoara", slug: "timisoara", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    status: "pending",
    featuredImage: null,
    views: 892,
    tier: "basic",
    startDate: "2025-02-10T19:00:00Z",
    endDate: "2025-02-10T23:00:00Z",
    participants: 0,
    eventStatus: "upcoming",
    createdAt: "2024-11-20T16:00:00Z",
    updatedAt: "2024-11-20T16:00:00Z",
  },
  {
    id: 4,
    title: "Conferință Managementul Evenimentelor",
    slug: "conferinta-managementul-evenimentelor",
    owner: 1,
    description:
      "Conferință dedicată celor care doresc să învețe despre planificarea și organizarea evenimentelor de succes.",
    city: { id: 4, name: "Brașov", slug: "brasov", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    status: "rejected",
    rejectionReason: "Descrierea evenimentului nu conține suficiente detalii despre agenda și speakerii invitați.",
    featuredImage: null,
    views: 456,
    tier: "free",
    startDate: "2025-01-25T10:00:00Z",
    endDate: "2025-01-25T17:00:00Z",
    participants: 0,
    eventStatus: "upcoming",
    createdAt: "2024-11-10T11:00:00Z",
    updatedAt: "2024-11-12T09:00:00Z",
  },
  {
    id: 5,
    title: "Expoziție Decorațiuni Nunți",
    slug: "expozitie-decoratiuni-nunti",
    owner: 1,
    description: "Expoziție cu cele mai noi tendințe în decorațiuni pentru nunți și evenimente speciale.",
    city: { id: 5, name: "Iași", slug: "iasi", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    status: "approved",
    featuredImage: null,
    views: 1876,
    tier: "premium",
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Started 2 days ago
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Ends tomorrow
    participants: 320,
    eventStatus: "active",
    createdAt: "2024-10-01T08:00:00Z",
    updatedAt: new Date().toISOString(),
  },
]
