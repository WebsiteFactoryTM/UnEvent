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
 * Unified schema for all listing types (locations, services, events)
 * Uses discriminated unions for type-safe handling
 * Implements conditional validation for draft vs. submission
 */

// Base schema - common fields across all listing types
// Minimal validation for drafts
const baseListingSchema = z.object({
  // Basic info
  title: z.string().min(1, "Titlul este obligatoriu"),
  description: z
    .string()
    .max(5000, "Descrierea nu poate depăși 5000 caractere")
    .optional(),
  description_rich: z.any().optional(),

  // Address
  city: z.number().min(1, "Selectează orașul"), // Not required in backend
  address: z.string().optional(),
  geo: z
    .object({
      lat: z.number().optional(),
      lon: z.number().optional(),
      manualPin: z.boolean(),
    })
    .optional(),

  // Images
  featuredImage: z
    .object({
      id: z.number(),
      url: z.string(),
    })
    .optional(),
  gallery: z
    .array(
      z.object({
        id: z.number(),
        url: z.string(),
      }),
    )
    .max(10, "Maximum 10 imagini în galerie")
    .optional(),
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

  // Contact - not required in backend but recommended
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
    email: z.string().email("Email invalid").min(1, "Emailul este obligatoriu"),
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

  // Status for draft functionality
  moderationStatus: z
    .enum(["draft", "pending", "approved", "rejected"])
    .default("pending"),
  _status: z.enum(["draft", "published"]).default("draft"),
});

// Location-specific schema
const locationSchema = baseListingSchema.extend({
  listingType: z.literal("location"),
  type: z.array(z.number()).min(1, "Selectează cel puțin un tip de locație"),
  suitableFor: z
    .array(z.number())
    .min(1, "Selectează cel puțin un tip de eveniment"), // Required in backend
  capacity: z
    .object({
      indoor: z.preprocess(
        (val) =>
          val === "" || val === null || Number.isNaN(val) ? undefined : val,
        z.number().optional(),
      ),
      outdoor: z.preprocess(
        (val) =>
          val === "" || val === null || Number.isNaN(val) ? undefined : val,
        z.number().optional(),
      ),
      seating: z.preprocess(
        (val) =>
          val === "" || val === null || Number.isNaN(val) ? undefined : val,
        z.number().optional(),
      ),
      parking: z.preprocess(
        (val) =>
          val === "" || val === null || Number.isNaN(val) ? undefined : val,
        z.number().optional(),
      ),
    })
    .optional(),
  surface: z.preprocess(
    (val) =>
      val === "" || val === null || Number.isNaN(val) ? undefined : val,
    z.number().optional(),
  ),
  facilities: z.array(z.number()).optional(),
  pricing: z
    .object({
      enabled: z.boolean(),
      type: z.enum(["fixed", "from", "contact"]).optional(),
      amount: z.preprocess(
        (val) =>
          val === "" || val === null || Number.isNaN(val) ? undefined : val,
        z.number().min(1, "Introduceți un preț valid").optional(),
      ),
      currency: z.enum(["RON", "EUR", "USD"]).default("RON").optional(),
      period: z.enum(["hour", "day", "event"]).optional(),
    })
    .optional()
    .default({
      enabled: false,
      type: "contact",
      amount: undefined,
      currency: "RON",
      period: "event",
    })
    .superRefine((pricing, ctx) => {
      // If pricing is disabled, skip all validation
      if (!pricing?.enabled) return;

      // If pricing is enabled, validate required fields
      if (!pricing.type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selectați tipul de preț când prețul este activat",
          path: ["type"],
        });
      }

      // Additional validation for amount when type requires it
      if (
        pricing.type === "fixed" &&
        (!pricing.amount || pricing.amount <= 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Introduceți un preț valid pentru tipul 'fixed'",
          path: ["amount"],
        });
      }
    }),
});

// Service-specific schema
const serviceSchema = baseListingSchema.extend({
  listingType: z.literal("service"),
  type: z
    .array(z.number())
    .min(1, "Selectează cel puțin o categorie de servicii"),
  suitableFor: z
    .array(z.number())
    .min(1, "Selectează cel puțin un tip de eveniment"), // Required in backend
  pricing: z
    .object({
      enabled: z.boolean(),
      type: z.enum(["fixed", "from", "contact"]).optional(),
      amount: z.preprocess(
        (val) =>
          val === "" || val === null || Number.isNaN(val) ? undefined : val,
        z.number().min(1, "Prețul trebuie să fie mai mare decât 0").optional(),
      ),
      currency: z.enum(["RON", "EUR", "USD"]).optional(),
      period: z.enum(["hour", "day", "event"]).optional(),
    })
    .optional()
    .default({
      enabled: false,
      type: "contact",
      amount: undefined,
      currency: "RON",
      period: "event",
    })
    .superRefine((pricing, ctx) => {
      // If pricing is disabled, skip all validation
      if (!pricing?.enabled) return;

      // If pricing is enabled, validate required fields
      if (!pricing.type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selectați tipul de preț când prețul este activat",
          path: ["type"],
        });
      }

      // Additional validation for amount when type requires it
      if (
        pricing.type === "fixed" &&
        (!pricing.amount || pricing.amount <= 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Introduceți un preț valid pentru tipul 'fixed'",
          path: ["amount"],
        });
      }
    }),
  features: z
    .array(
      z.object({
        feature: z.string(),
        description: z.string().optional(),
      }),
    )
    .optional(),
});

// Event-specific schema (without refinement for discriminated union compatibility)
const eventSchemaBase = baseListingSchema.extend({
  listingType: z.literal("event"),
  type: z.array(z.number()).min(1, "Selectează cel puțin un tip de eveniment"),
  pricing: z
    .object({
      enabled: z.boolean(),
      type: z.enum(["free", "paid", "contact"]).optional(),
      amount: z.preprocess(
        (val) =>
          val === "" || val === null || Number.isNaN(val) ? undefined : val,
        z.number().min(1, "Prețul trebuie să fie mai mare decât 0").optional(),
      ),
      currency: z.enum(["RON", "EUR", "USD"]).optional(),
      period: z.enum(["hour", "day", "event"]).optional(),
    })
    .optional()
    .default({
      enabled: false,
      type: "free",
      amount: undefined,
      currency: "RON",
      period: "event",
    })
    .superRefine((pricing, ctx) => {
      // If pricing is disabled, skip all validation
      if (!pricing?.enabled) return;

      // If pricing is enabled, validate required fields
      if (!pricing.type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selectați tipul de preț când prețul este activat",
          path: ["type"],
        });
      }

      // Additional validation for amount when type requires it
      if (pricing.type === "paid" && (!pricing.amount || pricing.amount <= 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Introduceți un preț valid pentru tipul 'paid'",
          path: ["amount"],
        });
      }
    }),
  allDayEvent: z.boolean(),
  startDate: z.string().optional(), // Made optional to allow drafts without dates
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  capacity: z
    .object({
      enabled: z.boolean(),
      total: z.preprocess(
        (val) =>
          val === "" || val === null || Number.isNaN(val) ? undefined : val,
        z
          .number()
          .min(1, "Capacitatea trebuie să fie mai mare decât 0")
          .optional(),
      ),
      remaining: z.preprocess(
        (val) =>
          val === "" || val === null || Number.isNaN(val) ? undefined : val,
        z.number().optional(),
      ),
    })
    .optional()
    .default({
      enabled: false,
      total: undefined,
      remaining: undefined,
    })
    .superRefine((capacity, ctx) => {
      // If capacity is disabled, skip all validation
      if (!capacity?.enabled) return;

      // If capacity is enabled, validate total field
      if (!capacity.total || capacity.total <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Introduceți o capacitate validă când capacitatea este activată",
          path: ["total"],
        });
      }
    }),
  ticketUrl: createUserFriendlyUrlSchema("URL invalid").optional(),
});

// Discriminated union of all listing types
const unifiedListingSchemaBase = z.discriminatedUnion("listingType", [
  locationSchema,
  serviceSchema,
  eventSchemaBase,
]);

// Apply refinements for validation
export const unifiedListingSchema = unifiedListingSchemaBase
  .superRefine((data, ctx) => {
    // Only validate for events
    if (data.listingType !== "event") return;

    // Validate date/time logic for events
    if (!data.allDayEvent) {
      // For non-all-day events, require time fields when dates are set
      if (data.startDate && !data.startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selectează ora de început când ai ales data de început",
          path: ["startTime"],
        });
        return false;
      }

      if (data.endDate && !data.endTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selectează ora de sfârșit când ai ales data de sfârșit",
          path: ["endTime"],
        });
        return false;
      }

      // Validate start < end only when all date/time fields are provided
      if (data.startDate && data.startTime && data.endDate && data.endTime) {
        const start = new Date(`${data.startDate}T${data.startTime}`);
        const end = new Date(`${data.endDate}T${data.endTime}`);

        // Check if dates are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Date sau ore invalide",
            path: ["startDate"],
          });
          return false;
        } else if (start >= end) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Data/ora de start trebuie să fie înainte de data/ora de sfârșit",
            path: ["endDate"],
          });
          return false;
        }
        return true;
      }
    }
  })
  .refine(
    (data) => {
      // Strict validation only for pending (submission) status
      if (data.moderationStatus === "draft") return true;

      // For submission, require title to be at least 5 characters
      if (data.title.length < 5) return false;

      return true;
    },
    {
      message: "Pentru publicare, titlul trebuie să aibă minim 5 caractere",
      path: ["title"],
    },
  )
  .refine(
    (data) => {
      // For submission, require description (min 50 chars)
      if (data.moderationStatus === "draft") return true;

      const hasDescription = data.description && data.description.length >= 50;

      return hasDescription;
    },
    {
      message:
        "Pentru publicare, descrierea trebuie să aibă minim 50 caractere",
      path: ["description"],
    },
  )
  .refine(
    (data) => {
      // For submission, require city
      if (data.moderationStatus === "draft") return true;

      return data.city && data.city > 0;
    },
    {
      message: "Pentru publicare, orașul este obligatoriu",
      path: ["city"],
    },
  )
  .refine(
    (data) => {
      // For submission, require address
      if (data.moderationStatus === "draft") return true;

      return data.address && data.address.length >= 5;
    },
    {
      message: "Pentru publicare, adresa completă este obligatorie",
      path: ["address"],
    },
  )
  .refine(
    (data) => {
      // Only validate for events
      if (data.listingType !== "event") return true;

      // For submission, require start date
      if (data.moderationStatus === "draft") return true;

      return data.startDate && data.startDate.length >= 1;
    },
    {
      message: "Pentru publicare, data de început este obligatorie",
      path: ["startDate"],
    },
  )
  .refine(
    (data) => {
      // For submission, require contact email OR phone
      if (data.moderationStatus === "draft") return true;

      const hasEmail = data.contact.email && data.contact.email.length > 0;
      const hasPhone =
        data.contact.phones &&
        data.contact.phones.length > 0 &&
        data.contact.phones[0].number &&
        data.contact.phones[0].number.length > 0;

      return hasEmail || hasPhone;
    },
    {
      message: "Pentru publicare, este necesar cel puțin un email sau telefon",
      path: ["contact"],
    },
  );

export type UnifiedListingFormData = z.infer<typeof unifiedListingSchema>;
export type LocationFormData = z.infer<typeof locationSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type EventFormData = z.infer<typeof eventSchemaBase>;

// Default values function based on listing type
export function defaultListingFormValues(
  listingType: "location" | "service" | "event",
): Partial<UnifiedListingFormData> {
  const baseDefaults = {
    title: "",
    description: "",
    description_rich: undefined,
    city: undefined,
    address: "",
    geo: {
      lat: 45.56,
      lng: 25,
      manualPin: false,
    },
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
    moderationStatus: "draft" as const, // Default to draft
  };

  if (listingType === "location") {
    return {
      ...baseDefaults,
      listingType: "location",
      type: [],
      suitableFor: [],
      capacity: {
        indoor: undefined,
        outdoor: undefined,
        seating: undefined,
        parking: undefined,
      },
      surface: undefined,
      facilities: [],
      pricing: {
        enabled: false,
        type: "contact" as const,
        currency: "RON" as const,
        period: "event" as const,
      },
    } as Partial<LocationFormData>;
  }

  if (listingType === "service") {
    return {
      ...baseDefaults,
      listingType: "service",
      type: [],
      suitableFor: [],
      pricing: {
        enabled: false,
        type: "contact" as const,
        currency: "RON" as const,
        period: "event" as const,
      },
      features: [],
    } as Partial<ServiceFormData>;
  }

  // event
  return {
    ...baseDefaults,
    listingType: "event",
    type: [],
    pricing: {
      enabled: false,
      type: "free" as const,
      currency: "RON" as const,
    },
    allDayEvent: false,
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    capacity: {
      enabled: false,
      total: undefined,
      remaining: undefined,
    },
    ticketUrl: "",
  } as Partial<EventFormData>;
}
