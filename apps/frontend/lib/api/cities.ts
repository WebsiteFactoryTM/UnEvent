"use server";
import type { City } from "@/types/payload-types";
import { citiesKeys } from "../cacheKeys";
import { redisKey } from "../react-query/utils";
import { getRedis } from "../redis";
import { cacheTTL } from "../constants";
import { buildCitySearchParams } from "../react-query/cities.queries";

export interface UseCitiesProps {
  search?: string;
  limit?: number;
  verifiedOnly?: boolean;
  popularFallback?: boolean; // when search is empty, fetch top popular cities
  enabled?: boolean;
}
export async function getPopularCities(limit: number = 10): Promise<City[]> {
  try {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.warn(
        "NEXT_PUBLIC_API_URL is not set; returning empty cities list",
      );
      return [];
    }

    const url = new URL("/api/cities", process.env.NEXT_PUBLIC_API_URL);
    url.searchParams.set("where[featured][equals]", "true");
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
      // Cache per Next.js App Router rules; revalidate daily
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error("Failed to fetch popular cities", {
        status: res.status,
        statusText: res.statusText,
      });
      return [];
    }

    const data = (await res.json()) as { docs?: City[] } | null;
    if (!data || !Array.isArray(data.docs)) return [];
    return data.docs;
  } catch (error) {
    console.error("Error in getPopularCities:", error);
    return [];
  }
}

export async function getCities({
  search,
  limit = 20,
  verifiedOnly,
  popularFallback,
}: UseCitiesProps): Promise<City[]> {
  try {
    const redis = getRedis();
    const url = new URL("/api/cities", process.env.NEXT_PUBLIC_API_URL);

    const params = buildCitySearchParams({
      search,
      limit,
      verifiedOnly,
      popularFallback,
    });

    const fullUrl = `${url.toString()}?${params.toString()}`;
    // Helpful logs (server console)

    // Include query parameters in cache key to avoid stale/incorrect reuse
    const cacheKey = redisKey(citiesKeys.list({ url: fullUrl }));
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const res = await fetch(fullUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error(`Failed to fetch cities: ${res.status}`);
    const data = await res.json();
    // console.log("[cities] docs:", Array.isArray(data?.docs) ? data.docs.length : 0);

    await redis.set(cacheKey, JSON.stringify(data.docs), "EX", cacheTTL.oneDay);
    return (data?.docs ?? []) as City[];
  } catch (error) {
    console.error("Error in getCities:", error);
    return [];
  }
}
