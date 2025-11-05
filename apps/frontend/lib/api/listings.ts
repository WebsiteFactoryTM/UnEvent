"use server";
import { Listing } from "@/types/listings";
import { ListingType } from "@/types/listings";
import { frontendTypeToCollectionSlug } from "./reviews";
import { City, ListingType as SuitableForType } from "@/types/payload-types";
import { getRedis } from "../redis";
import { redisKey } from "../react-query/utils";
import { listingsKeys } from "../cacheKeys";

export const fetchListing = async (
  listingType: ListingType,
  slug: string,
  accessToken?: string,
): Promise<{ data: Listing | null; error: Error | null }> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}?where[slug][equals]=${slug}&includeReviewState=true&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        next: {
          tags: [`${listingType}_${slug}`],
          // revalidate: 3600,
        },
      },
    );
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error(errorMessage);
      return { data: null, error: new Error(errorMessage) };
    }
    const data = await response.json();
    return { data: data.docs[0], error: null };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(errorMessage);
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
    return data.docs as Listing[];
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
      return JSON.parse(cachedData);
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
    return data.docs as Listing[];
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
