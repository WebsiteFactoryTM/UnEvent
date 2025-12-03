import { Listing } from "@/types/listings";
import { ListingType } from "@/types/listings";
import { frontendTypeToCollectionSlug } from "./reviews";
import { City, ListingType as SuitableForType } from "@/types/payload-types";
import {
  normalizeListing,
  normalizeListings,
} from "../transforms/normalizeListing";

export const fetchListing = async (
  listingType: "locations" | "events" | "services",
  slug: string,
  accessToken?: string,
  isDraftMode?: boolean,
): Promise<{ data: Listing | null; error: Error | null }> => {
  try {
    // During build time or when BFF is not available, use direct Payload call
    // At runtime, use BFF route for edge caching
    // Check if we're in build context - during static generation, BFF routes don't exist
    const isBuildTime =
      process.env.NEXT_PHASE === "phase-production-build" ||
      (typeof window === "undefined" &&
        !process.env.VERCEL_URL &&
        !process.env.NEXT_PUBLIC_FRONTEND_URL);

    // Always use direct Payload call during build or if BFF URL is not configured
    if (isBuildTime || !process.env.NEXT_PUBLIC_FRONTEND_URL) {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        return {
          data: null,
          error: new Error("NEXT_PUBLIC_API_URL not configured"),
        };
      }

      // Direct Payload call during build or when BFF unavailable
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}?where[slug][equals]=${encodeURIComponent(slug)}&includeReviewState=true&limit=1`,
        {
          headers: Object.keys(headers).length > 0 ? headers : undefined,
          next: {
            tags: [`${listingType}_${slug}`],
            revalidate: isDraftMode ? 0 : undefined, // Let page/route control revalidation
          },
          cache: isDraftMode ? "no-store" : "default",
        },
      );

      if (!response.ok) {
        const errorMessage = await response
          .text()
          .catch(() => `HTTP ${response.status}`);
        console.error(`Payload API error (${response.status}):`, errorMessage);
        return {
          data: null,
          error: new Error(
            `Failed to fetch listing from Payload: ${errorMessage}`,
          ),
        };
      }

      const data = await response.json();
      const doc = data?.docs?.[0];

      if (!doc) {
        return { data: null, error: new Error("Listing not found") };
      }

      return { data: (normalizeListing(doc) as Listing) ?? null, error: null };
    }

    // Runtime: Use BFF route for edge caching
    const baseUrl =
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    // Use BFF route, add draft parameter if in draft mode
    const draftParam = isDraftMode ? "?draft=1" : "";
    const bffUrl = `${baseUrl}/api/public/listings/${listingType}/${encodeURIComponent(slug)}${draftParam}`;

    try {
      const response = await fetch(bffUrl, {
        // Server-side fetch: let the BFF route handle caching/revalidation
        // Don't override with revalidate here - it prevents tag-based invalidation
        next: isDraftMode ? { revalidate: 0 } : undefined,
        cache: isDraftMode ? "no-store" : "default",
      });

      if (!response.ok) {
        const errorMessage = await response
          .text()
          .catch(() => `HTTP ${response.status}`);
        console.error(`BFF route failed (${response.status}):`, errorMessage);

        // Fallback to direct Payload call if BFF fails
        if (process.env.NEXT_PUBLIC_API_URL) {
          const fallbackHeaders: Record<string, string> = {};
          if (accessToken) {
            fallbackHeaders.Authorization = `Bearer ${accessToken}`;
          }

          const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}?where[slug][equals]=${encodeURIComponent(slug)}&includeReviewState=true&limit=1`;
          const fallbackResponse = await fetch(fallbackUrl, {
            headers:
              Object.keys(fallbackHeaders).length > 0
                ? fallbackHeaders
                : undefined,
            cache: isDraftMode ? "no-store" : "default",
            next: isDraftMode ? { revalidate: 0 } : undefined,
          });

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const fallbackDoc = fallbackData?.docs?.[0];
            if (fallbackDoc) {
              return {
                data: (normalizeListing(fallbackDoc) as Listing) ?? null,
                error: null,
              };
            }
          }
        }

        return {
          data: null,
          error: new Error(`BFF route failed: ${errorMessage}`),
        };
      }

      const doc = await response.json();

      return { data: (normalizeListing(doc) as Listing) ?? null, error: null };
    } catch (fetchError) {
      // If BFF fetch fails (e.g., network error), fallback to Payload
      console.error("BFF fetch error, falling back to Payload:", fetchError);

      if (process.env.NEXT_PUBLIC_API_URL) {
        const fallbackHeaders: Record<string, string> = {};
        if (accessToken) {
          fallbackHeaders.Authorization = `Bearer ${accessToken}`;
        }

        const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}?where[slug][equals]=${encodeURIComponent(slug)}&includeReviewState=true&limit=1`;
        const fallbackResponse = await fetch(fallbackUrl, {
          headers:
            Object.keys(fallbackHeaders).length > 0
              ? fallbackHeaders
              : undefined,
          cache: isDraftMode ? "no-store" : "force-cache",
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const fallbackDoc = fallbackData?.docs?.[0];
          if (fallbackDoc) {
            return {
              data: (normalizeListing(fallbackDoc) as Listing) ?? null,
              error: null,
            };
          }
        }
      }

      throw fetchError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("fetchListing error:", errorMessage);
    return { data: null, error: new Error(errorMessage) };
  }
};

export const fetchTopListings = async (
  listingType: ListingType,
  limit: number = 10,
): Promise<Listing[]> => {
  try {
    const collectionSlug = frontendTypeToCollectionSlug(listingType);
    const params = new URLSearchParams({ limit: String(limit) });
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
      const response = await fetch(
        `${baseUrl}/api/public/listings/${collectionSlug}/top?${params.toString()}`,
        { next: { revalidate: 600 } },
      );
      if (response.ok) {
        const data = await response.json();
        return normalizeListings(data.docs) as Listing[];
      }
      console.warn(
        "Top listings BFF route failed, falling back to Payload:",
        await response.text(),
      );
    }

    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error("NEXT_PUBLIC_API_URL not configured");
    }

    const fallbackUrl = new URL(
      `/api/${collectionSlug}`,
      process.env.NEXT_PUBLIC_API_URL,
    );
    fallbackUrl.searchParams.set("where[tier][equals]", "sponsored");
    fallbackUrl.searchParams.set("where[moderationStatus][equals]", "approved");
    fallbackUrl.searchParams.set("limit", String(limit));
    fallbackUrl.searchParams.set("sort", "-rating");
    fallbackUrl.searchParams.set("depth", "2");

    const payloadResponse = await fetch(fallbackUrl.toString(), {
      next: { revalidate: 600 },
    });
    if (!payloadResponse.ok) {
      const errorMessage = await payloadResponse.text();
      throw new Error(errorMessage);
    }
    const data = await payloadResponse.json();
    return normalizeListings(data.docs) as Listing[];
  } catch (error) {
    throw new Error(
      `Failed to fetch top listings: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const fetchSimilarListings = async (
  listingType: ListingType,
  listingId?: number,
  city?: City,
  suitableFor?: (number | SuitableForType)[],
  limit: number = 10,
): Promise<Listing[]> => {
  try {
    const collectionSlug = frontendTypeToCollectionSlug(listingType);
    const params = new URLSearchParams({ limit: String(limit) });
    if (listingId) params.set("listingId", String(listingId));
    if (city?.id) params.set("cityId", String(city.id));
    suitableFor?.forEach((item) => {
      const id = typeof item === "number" ? item : item.id;
      params.append("suitableFor", String(id));
    });

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

      const response = await fetch(
        `${baseUrl}/api/public/listings/${collectionSlug}/similar?${params.toString()}`,
        { next: { revalidate: 120 } },
      );

      if (response.ok) {
        const data = await response.json();
        return normalizeListings(data.docs) as Listing[];
      }

      console.warn(
        "Similar listings BFF route failed, falling back to Payload:",
        await response.text(),
      );
    }

    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error("NEXT_PUBLIC_API_URL not configured");
    }

    const fallbackUrl = new URL(
      `/api/${collectionSlug}`,
      process.env.NEXT_PUBLIC_API_URL,
    );
    fallbackUrl.searchParams.set("limit", String(limit));
    fallbackUrl.searchParams.set("depth", "2");
    fallbackUrl.searchParams.set("sort", "-rating");
    fallbackUrl.searchParams.set("where[moderationStatus][equals]", "approved");

    if (listingId) {
      // Payload uses not_in for excluding IDs, even for a single value
      fallbackUrl.searchParams.set(
        "where[id][not_in][0]",
        listingId.toString(),
      );
    }
    if (city?.id) {
      fallbackUrl.searchParams.set("where[city][equals]", city.id.toString());
    }
    suitableFor?.forEach((item, index) => {
      const id = typeof item === "number" ? item : item.id;
      fallbackUrl.searchParams.set(
        `where[suitableFor][in][${index}]`,
        String(id),
      );
    });

    const payloadResponse = await fetch(fallbackUrl.toString(), {
      next: { revalidate: 120 },
    });
    if (!payloadResponse.ok) {
      const errorMessage = await payloadResponse.text();
      throw new Error(errorMessage);
    }

    const data = await payloadResponse.json();
    return normalizeListings(data.docs) as Listing[];
  } catch (error) {
    throw new Error(
      `Failed to fetch similar listings: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};
