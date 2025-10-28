 import { z } from "zod"

/**
 * Form schema for adding a new location
 * Maps to Location type from payload-types.ts where applicable
 * Some fields are mock-only for UI development (marked with comments)
 */

export const locationFormSchema = z.object({
  // Tab 1: Info
  title: z.string().min(5, "Titlul trebuie să aibă minim 5 caractere"),
  type: z.array(z.string()).min(1, "Selectează cel puțin un tip de locație"),
  suitableFor: z.array(z.string()).min(1, "Selectează cel puțin un tip de eveniment"),
  description: z
    .string()
    .min(50, "Descrierea trebuie să aibă minim 50 caractere")
    .max(5000, "Descrierea nu poate depăși 5000 caractere")
    .optional(),
  capacity: z.object({
    indoor: z.number().min(0, "Introduceți un număr valid").optional(),
    outdoor: z.number().min(0, "Introduceți un număr valid").optional(),
    seating: z.number().min(0, "Introduceți un număr valid").optional(),
    parking: z.number().min(0, "Introduceți un număr valid").optional(),
  }).optional(),
  surface: z.number().min(1, "Introduceți suprafața în m²").optional(),
  pricing: z.object({
    enabled: z.boolean(),
    type: z.enum(["fixed", "from", "contact"]).optional(),
    amount: z.number().min(1, "Introduceți un preț valid").optional(),
    currency: z.enum(["RON", "EUR", "USD"]).default("RON"),
    period: z.enum(["hour", "day", "event"]).optional(),
  }),

  // Tab 2: Address
  city: z.string().min(1, "Selectează orașul"),
  address: z.string().min(5, "Introduceți adresa completă"),
  geo: z.tuple([z.number(), z.number()]).optional(), // [lat, lon]
  manualPin: z.boolean().default(false),

  // Tab 3: Facilities
  facilities: z.array(z.string()),

  // Tab 4: Images (mock-only File handling for UI)
  featuredImage: z.any().optional(), // File object
  gallery: z.array(z.any()).max(10, "Maximum 10 imagini în galerie").optional(), // File[]
  youtubeLinks: z
    .array(
      z.object({
        url: z.string().url("URL invalid").refine(
          (url) => {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
            return youtubeRegex.test(url)
          },
          { message: "URL YouTube invalid" }
        ),
      })
    )
    .max(3, "Maximum 3 linkuri YouTube")
    .optional(),

  // Tab 5: Contact
  contact: z.object({
    phones: z
      .array(
        z.object({
          number: z
            .string()
            .regex(/^(\+40|0)[0-9]{9}$/, "Format invalid (ex: +40712345678 sau 0712345678)"),
        })
      )
      .max(2, "Maximum 2 numere de telefon"),
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
  }),
})

export type LocationFormData = z.infer<typeof locationFormSchema>

// Default values for the form
export const defaultLocationFormValues: Partial<LocationFormData> = {
  title: "",
  type: [],
  suitableFor: [],
  description: "",
  capacity: {
    indoor: undefined,
    outdoor: undefined,
    seating: undefined,
    parking: undefined,
  },
  surface: undefined,
  pricing: {
    enabled: false,
    type: "from",
    currency: "RON",
    period: "event",
  },
  city: "",
  address: "",
  manualPin: false,
  facilities: [],
  gallery: [],
  youtubeLinks: [],
  contact: {
    phones: [{ number: "" }],
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

