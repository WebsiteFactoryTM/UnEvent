import { z } from "zod"

// Schema for the Add Service form
// Matches Service interface from payload-types.ts
export const serviceFormSchema = z.object({
  // Tab 1: Info
  title: z.string().min(3, "Numele trebuie să aibă minim 3 caractere"),
  suitableFor: z.array(z.string()).min(1, "Selectează cel puțin un tip de eveniment"),
  description: z
    .string()
    .min(50, "Descrierea trebuie să aibă minim 50 caractere")
    .max(5000, "Descrierea nu poate depăși 5000 caractere")
    .optional(),
  pricing: z.object({
    enabled: z.boolean(),
    type: z.enum(["fixed", "from", "contact"]).optional(),
    period: z.enum(["hour", "day", "event"]).optional(),
    amount: z.number().min(1, "Prețul trebuie să fie mai mare decât 0").optional(),
    currency: z.enum(["RON", "EUR", "USD"]).optional(),
  }),

  // Tab 2: Services (categories)
  type: z.array(z.string()).min(1, "Selectează cel puțin o categorie de servicii"),

  // Tab 3: Address
  city: z.string().min(1, "Selectează orașul"),
  address: z.string().min(5, "Adresa trebuie să aibă minim 5 caractere"),
  geo: z.object({
    lat: z.number(),
    lon: z.number(),
    manualPin: z.boolean(),
  }).optional(),

  // Tab 4: Images
  featuredImage: z.instanceof(File).optional(),
  gallery: z.array(z.instanceof(File)).max(10, "Maxim 10 imagini în galerie").optional(),
  youtubeLinks: z
    .array(
      z.object({
        url: z.string().url("URL invalid").regex(/youtube\.com|youtu\.be/, "Doar linkuri YouTube"),
      })
    )
    .max(3, "Maxim 3 linkuri YouTube")
    .optional(),

  // Tab 5: Contact
  contact: z.object({
    phones: z
      .array(
        z.object({
          number: z.string().regex(/^\+40\d{9}$/, "Format: +40XXXXXXXXX"),
        })
      )
      .max(2, "Maxim 2 numere de telefon"),
    email: z.string().email("Email invalid"),
    website: z.string().url("URL invalid").optional().or(z.literal("")),
  }),
  socialLinks: z.object({
    facebook: z.string().url("URL invalid").optional().or(z.literal("")),
    instagram: z.string().url("URL invalid").optional().or(z.literal("")),
    x: z.string().url("URL invalid").optional().or(z.literal("")),
    linkedin: z.string().url("URL invalid").optional().or(z.literal("")),
    youtube: z.string().url("URL invalid").optional().or(z.literal("")),
    tiktok: z.string().url("URL invalid").optional().or(z.literal("")),
  }).optional(),
})

export type ServiceFormData = z.infer<typeof serviceFormSchema>

export const defaultServiceFormValues: ServiceFormData = {
  title: "",
  suitableFor: [],
  description: "",
  pricing: {
    enabled: false,
    type: "from",
    period: "event",
    amount: undefined,
    currency: "RON",
  },
  type: [],
  city: "",
  address: "",
  geo: {
    lat: 45.7489,
    lon: 21.2087,
    manualPin: false,
  },
  featuredImage: undefined,
  gallery: [],
  youtubeLinks: [],
  contact: {
    phones: [],
    email: "",
    website: "",
  },
  socialLinks: {
    facebook: "",
    instagram: "",
    x: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
  },
}

