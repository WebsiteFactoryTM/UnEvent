import { ListingType } from "@/types/listings";
import { getListingTypeSlug } from "../getListingType";
import { stringify } from "qs-esm";

import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const FeedQuerySchema = z.object({
  entity: z.enum(["locations", "events", "services"]),
  city: z.string().min(1).optional(), // Optional - browse all cities
  typeCategory: z.string().min(1).optional(), // Optional - filter by type category slug
  type: z.string().min(1).optional(), // Optional - browse all types
  suitableForCategory: z.string().min(1).optional(), // Optional - filter by suitableFor category slug
  suitableFor: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(24),
  ratingMin: z.coerce.number().min(0).max(5).optional(),
  facilities: z.string().optional(), // CSV: "wifi,parking" (only for locations)
  facilitiesMode: z.enum(["all", "any"]).default("all"),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  capacityMin: z.coerce.number().optional(), // Only for locations (indoor capacity)
  capacityMax: z.coerce.number().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().max(100000).default(10000).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type FeedQuery = z.infer<typeof FeedQuerySchema>;

/**
 * Fetch listings feed (locations, services, events)
 * - Uses qs-esm for proper query serialization
 * - Validates filters against FeedQuerySchema
 */
export async function fetchFeed(filters: Partial<FeedQuery>) {
  try {
    if (!API_URL) throw new Error("API_URL is not defined");

    // Sanitize filters to prevent NaN values
    const sanitizedFilters = { ...filters };
    if (
      typeof sanitizedFilters.page === "number" &&
      isNaN(sanitizedFilters.page)
    ) {
      sanitizedFilters.page = 1;
    }
    if (
      typeof sanitizedFilters.limit === "number" &&
      isNaN(sanitizedFilters.limit)
    ) {
      sanitizedFilters.limit = 24;
    }

    // Validate filters with Zod (to ensure safe params)
    const parsed = FeedQuerySchema.partial().parse(sanitizedFilters);

    // Build query string (e.g. ?entity=locations&city=timisoara&type=nunta)
    const query = stringify(parsed, { encodeValuesOnly: true });

    const isBuildTime =
      process.env.NEXT_PHASE === "phase-production-build" ||
      (typeof window === "undefined" &&
        !process.env.VERCEL_URL &&
        !process.env.NEXT_PUBLIC_FRONTEND_URL);

    if (!isBuildTime && process.env.NEXT_PUBLIC_FRONTEND_URL) {
      const baseUrl =
        process.env.NEXT_PUBLIC_FRONTEND_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");
      const bffUrl = `${baseUrl}/api/public/feed?${query}`;

      const res = await fetch(bffUrl, {
        method: "GET",
        next: { revalidate: 60 },
      });

      if (res.ok) {
        return res.json();
      }

      console.warn(
        "Feed BFF fetch failed:",
        res.status,
        await res.text(),
        "falling back to Payload",
      );
    }

    const fallbackUrl = `${API_URL}/api/feed?${query}`;
    const res = await fetch(fallbackUrl, {
      method: "GET",
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn("Feed fetch failed:", res.status, await res.text());
      return [];
    }

    return res.json();
  } catch (err) {
    console.error("Error fetching feed:", err);
    return [];
  }
}
