import { Listing } from "@/types/listings";
import { City, Facility, Location } from "@/types/payload-types";
import { z } from "zod";

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
        if (!val.includes(".") || val.split(".").length < 2) {
          return val; // Let URL validation fail
        }
        return `https://${val}`;
      }
      return val;
    },
    z.string().url(errorMessage).optional().or(z.literal("")),
  );
};

/**
 * Form schema for adding a new location
 * Maps to Location type from payload-types.ts where applicable
 * Some fields are mock-only for UI development (marked with comments)
 */

export const locationFormSchema = z.object({
  // Tab 1: Info
  title: z.string().min(5, "Titlul trebuie să aibă minim 5 caractere"),
  type: z.array(z.number()).min(1, "Selectează cel puțin un tip de locație"),
  suitableFor: z
    .array(z.string())
    .min(1, "Selectează cel puțin un tip de eveniment")
    .optional(),
  description: z
    .string()
    .min(50, "Descrierea trebuie să aibă minim 50 caractere")
    .max(5000, "Descrierea nu poate depăși 5000 caractere")
    .optional(),
  capacity: z
    .object({
      indoor: z.number().min(0, "Introduceți un număr valid").optional(),
      outdoor: z.number().min(0, "Introduceți un număr valid").optional(),
      seating: z.number().min(0, "Introduceți un număr valid").optional(),
      parking: z.number().min(0, "Introduceți un număr valid").optional(),
    })
    .optional(),
  surface: z.number().min(1, "Introduceți suprafața în m²").optional(),
  pricing: z.object({
    enabled: z.boolean(),
    type: z.enum(["fixed", "from", "contact"]).optional(),
    amount: z.number().min(1, "Introduceți un preț valid").optional(),
    currency: z.enum(["RON", "EUR", "USD"]).default("RON").optional(),
    period: z.enum(["hour", "day", "event"]).optional(),
  }),

  // Tab 2: Address
  city: z.string().min(1, "Selectează orașul"),
  address: z.string().min(5, "Introduceți adresa completă").optional(),
  geo: z
    .object({
      lat: z.number().optional(),
      lon: z.number().optional(),
      manualPin: z.boolean(),
    })
    .optional(),
  manualPin: z.boolean().default(false),

  // Tab 3: Facilities
  facilities: z.array(z.string()).optional(),

  // Tab 4: Images (mock-only File handling for UI)
  featuredImage: z.any().optional(), // File object
  gallery: z.array(z.any()).max(10, "Maximum 10 imagini în galerie").optional(), // File[]
  youtubeLinks: z
    .array(
      z.object({
        url: z
          .string()
          .url("URL invalid")
          .refine(
            (url) => {
              const youtubeRegex =
                /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
              return youtubeRegex.test(url);
            },
            { message: "URL YouTube invalid" },
          ),
      }),
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
            .regex(
              /^(\+40|0)[0-9]{9}$/,
              "Format invalid (ex: +40712345678 sau 0712345678)",
            ),
        }),
      )
      .max(2, "Maximum 2 numere de telefon"),
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
  }),
});

export type LocationFormData = z.infer<typeof locationFormSchema>;

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
};

export const setDefaultValues = (
  listing?: Listing,
): Partial<LocationFormData> => {
  if (listing) {
    const city = (listing as Location).city as City;
    return {
      title: listing.title,
      type: listing.type.map((type) => type as number),
      description: listing.description || undefined,
      capacity: {
        indoor: (listing as Location).capacity?.indoor || undefined,
        outdoor: (listing as Location).capacity?.outdoor || undefined,
        seating: (listing as Location).capacity?.seating || undefined,
        parking: (listing as Location).capacity?.parking || undefined,
      },

      pricing: {
        enabled:
          listing.pricing.type === "fixed" || listing.pricing.type === "from",
        type: listing.pricing.type as "fixed" | "from" | "contact",
        amount: listing.pricing.amount || undefined,
        currency: listing.pricing.currency as "RON" | "EUR" | "USD" | undefined,
        period: (listing as Location).pricing.period as
          | "hour"
          | "day"
          | "event"
          | undefined,
      },
      city: city.name || undefined,
      address: listing.address || undefined,
      geo: {
        lat: (listing as Location).geo?.[0] || undefined,
        lon: (listing as Location).geo?.[1] || undefined,
        manualPin: false,
      },
      facilities:
        (listing as Location).facilities?.map(
          (facility) => (facility as Facility).title,
        ) || undefined,
      featuredImage: listing.featuredImage || undefined,
      gallery: listing.gallery || undefined,
      youtubeLinks:
        listing.youtubeLinks?.map((youtubeLink) => ({
          url: youtubeLink.youtubeLink || "",
        })) || undefined,
      contact: {
        phones: listing.contact?.phone
          ? [{ number: listing.contact.phone }]
          : [],
        email: listing.contact?.email || "",
        website: listing.contact?.website || undefined,
      },
      socialLinks: {
        facebook: listing.socialLinks?.facebook || undefined,
        instagram: listing.socialLinks?.instagram || undefined,
        x: listing.socialLinks?.x || undefined,
        linkedin: listing.socialLinks?.linkedin || undefined,
        youtube: listing.socialLinks?.youtube || undefined,
        tiktok: listing.socialLinks?.tiktok || undefined,
      },
    };
  }
  return {};
};
