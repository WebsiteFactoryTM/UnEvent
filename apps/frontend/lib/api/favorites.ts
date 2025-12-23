import { Favorite } from "@/types/payload-types";
import {
  LocationListing,
  EventListing,
  ServiceListing,
} from "@/types/listings";
import { normalizeListing } from "@/lib/transforms/normalizeListing";

export interface ToggleFavoriteResponse {
  isFavorite: boolean;
  favorites: number;
}

export interface PaginatedFavoritesResponse {
  docs: Favorite[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UserFavoritesResponse {
  locations: Favorite[];
  events: Favorite[];
  services: Favorite[];
  meta?: {
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FavoriteWithListing {
  id: number;
  listing: LocationListing | EventListing | ServiceListing;
  createdAt: string;
  updatedAt: string;
}

export const toggleFavorite = async (
  listingTypeSlug: "events" | "locations" | "services",
  listingId: number,
  accessToken?: string,
): Promise<ToggleFavoriteResponse> => {
  if (!accessToken) {
    const error = new Error("Unauthorized");
    (error as any).status = 401;
    throw error;
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/toggle`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ entity: listingTypeSlug, id: listingId }),
    },
  );

  if (!res.ok) {
    let message = "";
    try {
      const maybeJson = await res.clone().json();
      message = maybeJson?.message || maybeJson?.error || "";
    } catch {}
    if (!message) {
      message = await res.text().catch(() => "");
    }
    const error = new Error(
      message || `Failed to toggle favorite (${res.status})`,
    );
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};

export const checkIfIsFavorited = async (
  listingTypeSlug: "events" | "locations" | "services",
  listingId: number,
  accessToken?: string,
): Promise<boolean> => {
  if (!accessToken) {
    return false;
  }
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/checkIfIsFavorited?targetKey=${listingTypeSlug}:${listingId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (!res.ok) {
      return false;
    }
    const data = await res.json();

    return data.isFavorited;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("checkIfIsFavorited error", errMsg);
    return false;
  }
};

/**
 * Batch check if multiple items are favorited
 * @param targetKeys Array of targetKeys in format "collection:id" (e.g. ["locations:1", "events:2"])
 * @param accessToken Auth token
 * @returns Map of targetKey to boolean (e.g. { "locations:1": true, "events:2": false })
 */
export const checkBatchFavorites = async (
  targetKeys: string[],
  accessToken?: string,
): Promise<Record<string, boolean>> => {
  if (!accessToken || targetKeys.length === 0) {
    // Return all false for unauthenticated or empty batch
    return Object.fromEntries(targetKeys.map((key) => [key, false]));
  }

  // Check if we're in build context - during static generation, BFF routes don't exist
  const isBuildTime =
    process.env.NEXT_PHASE === "phase-production-build" ||
    (typeof window === "undefined" &&
      !process.env.VERCEL_URL &&
      !process.env.NEXT_PUBLIC_FRONTEND_URL);

  // Use BFF route at runtime, direct Payload call during build
  if (!isBuildTime && process.env.NEXT_PUBLIC_FRONTEND_URL) {
    const baseUrl =
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    try {
      const keysParam = targetKeys.join(",");
      const res = await fetch(
        `${baseUrl}/api/account/favorites/batch?targetKeys=${encodeURIComponent(keysParam)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      );

      if (res.ok) {
        return await res.json();
      }

      // Fall through to fallback if BFF fails
      console.warn(
        "BFF batch favorites route failed, falling back to Payload:",
        await res.text().catch(() => `HTTP ${res.status}`),
      );
    } catch (bffError) {
      console.error(
        "BFF batch favorites fetch error, falling back to Payload:",
        bffError,
      );
      // Fall through to fallback
    }
  }

  // Fallback to direct Payload call (build time or BFF failure)
  if (!process.env.NEXT_PUBLIC_API_URL) {
    // Return all false if no API URL configured
    return Object.fromEntries(targetKeys.map((key) => [key, false]));
  }

  try {
    // Join targetKeys with commas for query param
    const keysParam = targetKeys.join(",");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/checkBatch?targetKeys=${encodeURIComponent(keysParam)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      // Return all false on error
      return Object.fromEntries(targetKeys.map((key) => [key, false]));
    }

    const data = await res.json();
    return data;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("checkBatchFavorites error", errMsg);
    // Return all false on error
    return Object.fromEntries(targetKeys.map((key) => [key, false]));
  }
};

export const getUserFavorites = async (
  accessToken?: string,
  options?: {
    page?: number;
    limit?: number;
    kind?: "locations" | "events" | "services";
  },
): Promise<UserFavoritesResponse | PaginatedFavoritesResponse> => {
  if (!accessToken) {
    const error = new Error("Unauthorized");
    (error as any).status = 401;
    throw error;
  }

  const { page = 1, limit = 50, kind } = options || {};

  // Build query params
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (kind) {
    params.set("kind", kind);
  }

  // Check if we're in build context - during static generation, BFF routes don't exist
  const isBuildTime =
    process.env.NEXT_PHASE === "phase-production-build" ||
    (typeof window === "undefined" &&
      !process.env.VERCEL_URL &&
      !process.env.NEXT_PUBLIC_FRONTEND_URL);

  // Use BFF route at runtime, direct Payload call during build
  if (!isBuildTime && process.env.NEXT_PUBLIC_FRONTEND_URL) {
    const baseUrl =
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    try {
      const res = await fetch(`${baseUrl}/api/account/favorites?${params}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (res.ok) {
        return await res.json();
      }

      // Fall through to fallback if BFF fails
      console.warn(
        "BFF favorites route failed, falling back to Payload:",
        await res.text().catch(() => `HTTP ${res.status}`),
      );
    } catch (bffError) {
      console.error(
        "BFF favorites fetch error, falling back to Payload:",
        bffError,
      );
      // Fall through to fallback
    }
  }

  // Fallback to direct Payload call (build time or BFF failure)
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL not configured");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/getUserFavorites?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    let message = "";
    try {
      const maybeJson = await res.clone().json();
      message = maybeJson?.message || maybeJson?.error || "";
    } catch {}
    if (!message) {
      message = await res.text().catch(() => "");
    }
    const error = new Error(
      message || `Failed to fetch favorites (${res.status})`,
    );
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};
