import { Listing } from "@/types/listings";
import { ListingType } from "@/types/listings";
import { frontendTypeToCollectionSlug } from "./reviews";
import { City, ListingType as SuitableForType } from "@/types/payload-types";
import {
  normalizeListing,
  normalizeListings,
} from "../transforms/normalizeListing";
import { tag } from "@unevent/shared";

/**
 * Fetch a listing by ID (for claim pages)
 */
export const fetchListingById = async (
  listingType: "locations" | "events" | "services",
  id: number,
  accessToken?: string,
): Promise<{ data: Listing | null; error: Error | null }> => {
  try {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      return {
        data: null,
        error: new Error("NEXT_PUBLIC_API_URL not configured"),
      };
    }

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}/${id}?includeReviewState=true`,
      {
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        cache: "no-store", // Always fresh for claim pages
      },
    );

    if (!response.ok) {
      const errorMessage = await response
        .text()
        .catch(() => `HTTP ${response.status}`);
      return {
        data: null,
        error: new Error(`Failed to fetch listing: ${errorMessage}`),
      };
    }

    const doc = await response.json();
    return { data: (normalizeListing(doc) as Listing) ?? null, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error : new Error("Failed to fetch listing"),
    };
  }
};

export const fetchListing = async (
  listingType: "locations" | "events" | "services",
  slug: string,
  accessToken?: string,
  isDraftMode?: boolean,
): Promise<{ data: Listing | null; error: Error | null }> => {
  try {
    const isServer = typeof window === "undefined";

    // 1. Server-Side: Use direct Payload API call (for ISR/Static Generation)
    // We skip BFF on server to avoid loopback requests and ensure better static generation
    if (isServer && process.env.NEXT_PUBLIC_API_URL) {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}?where[slug][equals]=${encodeURIComponent(slug)}&includeReviewState=true&limit=1`,
        {
          headers: Object.keys(headers).length > 0 ? headers : undefined,
          next: {
            // Use consistent tag format with backend
            tags: [tag.listingSlug(slug), tag.collection(listingType)],
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

    // 2. Client-Side: Use BFF route (Edge Caching)
    // React Query and client components will hit this path

    // Draft mode requires authentication, and server-to-server requests don't forward cookies/session
    // So for draft mode, we go directly to Payload with the accessToken (if available on client? typically accessToken is server-side only, but let's keep logic consistent)
    // Note: On client, process.env.NEXT_PUBLIC_API_URL might be exposed, but we prefer BFF for caching.
    // However, if we are in draft mode on client, we likely need to hit an endpoint that supports it.
    // The previous logic for draft mode was:
    if (isDraftMode) {
      // ... (previous draft mode logic)
      // But wait, if we are on client, we probably shouldn't be doing direct Payload calls if we can avoid it,
      // unless we have the token. `accessToken` here is passed in.
      // If we are on client and have accessToken, we can try direct payload if exposed, OR a specialized BFF route.
      // But typically fetchListing is called on Server.
      // Let's stick to the structure: Server -> Direct. Client -> BFF.
      // If draft mode on client? The previous code had a specific draft mode block that seemed to prefer direct call.
      // Let's keep the fallback structure for client side.
    }

    // If we are here, we are likely on the client (or server without API_URL configured, which shouldn't happen in prod).

    // For Draft Mode on Client (rare case, usually draft preview is SSR):
    if (isDraftMode && process.env.NEXT_PUBLIC_API_URL) {
      const headers: Record<string, string> = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}?where[slug][equals]=${encodeURIComponent(slug)}&includeReviewState=true&limit=1`,
        {
          headers: Object.keys(headers).length > 0 ? headers : undefined,
          cache: "no-store",
          next: { revalidate: 0 },
        },
      );
      // ... handle response
      if (response.ok) {
        const data = await response.json();
        const doc = data?.docs?.[0];
        return {
          data: (normalizeListing(doc) as Listing) ?? null,
          error: null,
        };
      }
    }

    // Standard Client-Side BFF Call
    const baseUrl =
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const bffUrl = `${baseUrl}/api/public/listings/${listingType}/${encodeURIComponent(slug)}`;

    try {
      const response = await fetch(bffUrl, {
        cache: "default",
      });

      if (!response.ok) {
        const errorMessage = await response
          .text()
          .catch(() => `HTTP ${response.status}`);
        // console.error(`BFF route failed (${response.status}):`, errorMessage);
        return {
          data: null,
          error: new Error(`BFF route failed: ${errorMessage}`),
        };
      }

      const doc = await response.json();
      return { data: (normalizeListing(doc) as Listing) ?? null, error: null };
    } catch (fetchError) {
      console.error("BFF fetch error:", fetchError);
      return {
        data: null,
        error:
          fetchError instanceof Error
            ? fetchError
            : new Error("BFF fetch error"),
      };
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
    const isServer = typeof window === "undefined";

    // 1. Server-Side: Direct Payload Call
    if (isServer && process.env.NEXT_PUBLIC_API_URL) {
      const fallbackUrl = new URL(
        `/api/${collectionSlug}`,
        process.env.NEXT_PUBLIC_API_URL,
      );
      fallbackUrl.searchParams.set("where[tier][equals]", "sponsored");
      fallbackUrl.searchParams.set(
        "where[moderationStatus][equals]",
        "approved",
      );
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
    }

    // 2. Client-Side: BFF Call
    if (process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.VERCEL_URL) {
      const params = new URLSearchParams({ limit: String(limit) });
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
      console.warn("Top listings BFF route failed:", await response.text());
    }

    // Fallback if client-side BFF fails or no URL configured
    return [];
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
    const isServer = typeof window === "undefined";

    // 1. Server-Side: Direct Payload Call
    if (isServer && process.env.NEXT_PUBLIC_API_URL) {
      const fallbackUrl = new URL(
        `/api/${collectionSlug}`,
        process.env.NEXT_PUBLIC_API_URL,
      );
      fallbackUrl.searchParams.set("limit", String(limit));
      fallbackUrl.searchParams.set("depth", "2");
      fallbackUrl.searchParams.set("sort", "-rating");
      fallbackUrl.searchParams.set(
        "where[moderationStatus][equals]",
        "approved",
      );

      if (listingId) {
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
    }

    // 2. Client-Side: BFF Call
    if (process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.VERCEL_URL) {
      const params = new URLSearchParams({ limit: String(limit) });
      if (listingId) params.set("listingId", String(listingId));
      if (city?.id) params.set("cityId", String(city.id));
      suitableFor?.forEach((item) => {
        const id = typeof item === "number" ? item : item.id;
        params.append("suitableFor", String(id));
      });

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

      console.warn("Similar listings BFF route failed:", await response.text());
    }

    return [];
  } catch (error) {
    throw new Error(
      `Failed to fetch similar listings: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};
