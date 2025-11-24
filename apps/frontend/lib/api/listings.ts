import { Listing } from "@/types/listings";
import { ListingType } from "@/types/listings";
import { frontendTypeToCollectionSlug } from "./reviews";
import { City, ListingType as SuitableForType } from "@/types/payload-types";
import { getRedis } from "../redis";
import { redisKey } from "../react-query/utils";
import { listingsKeys } from "../cacheKeys";
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
          },
          cache: isDraftMode ? "no-store" : "force-cache",
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
        // Server-side fetch should use cache (unless draft mode)
        next: isDraftMode ? { revalidate: 0 } : { revalidate: 300 },
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
  accessToken?: string,
): Promise<Listing[]> => {
  try {
    const collectionSlug = frontendTypeToCollectionSlug(listingType);
    const url = new URL(
      `/api/${collectionSlug}`,
      process.env.NEXT_PUBLIC_API_URL,
    );
    url.searchParams.set("where[tier][equals]", "sponsored");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("sort", "rating:asc");
    // url.searchParams.set(
    //   "select",
    //   "id,title,slug,featuredImage,city,rating,reviewCount",
    // );
    // url.searchParams.set("populate[featuredImage][url]", "true");
    // url.searchParams.set("populate[featuredImage][alt]", "true");
    // url.searchParams.set("populate[city][name]", "true");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: {
        tags: [`${collectionSlug}_top_listings_${limit}`],
        revalidate: 3600,
      },
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    const data = await response.json();
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
  accessToken?: string,
): Promise<Listing[]> => {
  const redis = getRedis();
  const cacheKey = redisKey(
    listingsKeys.list("similar", frontendTypeToCollectionSlug(listingType), {
      listingId: listingId ?? undefined,
      cityId: city?.id ?? undefined,
      suitableForIds: suitableFor?.map((item) =>
        typeof item === "number" ? item : item.id,
      ),
      limit,
    }),
  );
  try {
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log("Cached data found for similar listings");
      // Upstash Redis may return objects directly, so check type before parsing
      if (typeof cachedData === "string") {
        return JSON.parse(cachedData);
      }
      return cachedData;
    }

    console.log("🌐 Fetching similar listings from API...");
    const collectionSlug = frontendTypeToCollectionSlug(listingType);
    const url = new URL(
      `/api/${collectionSlug}`,
      process.env.NEXT_PUBLIC_API_URL,
    );

    url.searchParams.set("limit", String(limit));
    url.searchParams.set("sort", "rating:asc");

    if (suitableFor) {
      suitableFor?.forEach((item, i) => {
        const id = typeof item === "number" ? item : item.id;
        url.searchParams.set(`where[suitableFor][in][${i}]`, String(id));
      });
    }
    if (city) {
      url.searchParams.set("where[city][equals]", city.id.toString());
    }

    if (listingId) {
      url.searchParams.set("where[id][not_equals]", listingId.toString());
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    const data = await response.json();
    await redis.set(cacheKey, JSON.stringify(data.docs as Listing[]), "EX", 60);
    const docs = normalizeListings(data.docs) as Listing[];
    await redis.set(cacheKey, JSON.stringify(docs), "EX", 60);
    return docs;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(errorMessage);
    // optional: fallback to last cached data if available
    const fallback = await redis.get(cacheKey);
    if (fallback) return JSON.parse(fallback);
    throw new Error("No cached similar listings available");
  }
};
