import { z } from "zod"

// Helper function for user-friendly URL validation
const createUserFriendlyUrlSchema = (errorMessage: string = "URL invalid") => {
  return z.preprocess(
    (val) => {
      if (typeof val === "string" && val && !val.match(/^https?:\/\//)) {
        // Reject obviously invalid patterns
        if (val.match(/^ww\./)) {
          // Reject "ww.domain.com" typo
          return val; // Let URL validation fail
        }
        // Check for basic domain format (must have at least one dot, not just "domain")
        if (!val.includes('.') || val.split('.').length < 2) {
          return val; // Let URL validation fail
        }
        return `https://${val}`;
      }
      return val;
    },
    z.string().url(errorMessage).optional().or(z.literal("")),
  );
};

// Schema for the Add Event form
// Matches Event interface from payload-types.ts
export const eventFormSchema = z.object({
  // Tab 1: Info
  title: z.string().min(5, "Titlul trebuie să aibă minim 5 caractere"),
  type: z.array(z.string()).min(1, "Selectează cel puțin un tip de eveniment"),
  description: z
    .string()
    .min(50, "Descrierea trebuie să aibă minim 50 caractere")
    .max(5000, "Descrierea nu poate depăși 5000 caractere")
    .optional(),
  pricing: z.object({
    enabled: z.boolean(),
    type: z.enum(["free", "paid", "contact"]).optional(),
    amount: z.number().min(1, "Prețul trebuie să fie mai mare decât 0").optional(),
    currency: z.enum(["RON", "EUR", "USD"]).optional(),
  }),

  // Tab 2: Address
  city: z.string().min(1, "Selectează orașul"),
  address: z.string().min(5, "Adresa trebuie să aibă minim 5 caractere"),
  geo: z.object({
    lat: z.number(),
    lon: z.number(),
    manualPin: z.boolean(),
  }).optional(),

  // Tab 3: Images
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

  // Tab 4: Schedule
  allDayEvent: z.boolean(),
  startDate: z.string().min(1, "Selectează data de început"),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),

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
    website: createUserFriendlyUrlSchema(),
  }),
  socialLinks: z.object({
    facebook: z.string().url("URL invalid").optional().or(z.literal("")),
    instagram: z.string().url("URL invalid").optional().or(z.literal("")),
    x: z.string().url("URL invalid").optional().or(z.literal("")),
    linkedin: z.string().url("URL invalid").optional().or(z.literal("")),
    youtube: z.string().url("URL invalid").optional().or(z.literal("")),
    tiktok: z.string().url("URL invalid").optional().or(z.literal("")),
  }).optional(),
}).refine((data) => {
  // Validate date/time logic
  if (!data.allDayEvent) {
    // For non-all-day events, require time fields
    if (!data.startTime) return false
    if (data.endDate && !data.endTime) return false
    
    // Validate start < end
    if (data.endDate) {
      const start = new Date(`${data.startDate}T${data.startTime}`)
      const end = new Date(`${data.endDate}T${data.endTime}`)
      return start < end
    }
  }
  return true
}, {
  message: "Data/ora de start trebuie să fie înainte de data/ora de sfârșit",
  path: ["endDate"],
})

export type EventFormData = z.infer<typeof eventFormSchema>

export const defaultEventFormValues: EventFormData = {
  title: "",
  type: [],
  description: "",
  pricing: {
    enabled: false,
    type: "free",
    amount: undefined,
    currency: "RON",
  },
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
  allDayEvent: false,
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
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





