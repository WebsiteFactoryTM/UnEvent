"use server";
import { getRedis } from "../redis";
import { cacheTTL } from "../constants"; // e.g. 6h
import { City, ListingType, Facility } from "@/types/payload-types";
import { redisKey } from "../react-query/utils";
import { taxonomiesKeys } from "../cacheKeys";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchTaxonomies({
  fullList = false,
}: { fullList?: boolean } = {}) {
  const redis = getRedis();
  const cacheKey = redisKey(taxonomiesKeys.list({ fullList }));
  const cached = await redis.get(cacheKey);

  if (cached) return JSON.parse(cached);

  try {
    const res = await fetch(`${API_URL}/api/taxonomies?fullList=${fullList}`);

    if (!res.ok) throw new Error("Failed to fetch taxonomies");

    const data = await res.json();
    await redis.set(cacheKey, JSON.stringify(data), "EX", cacheTTL.oneDay);

    return {
      cities: data.cities.sort((a: City, b: City) =>
        a.name.localeCompare(b.name),
      ),
      eventTypes: data.eventTypes.sort((a: ListingType, b: ListingType) =>
        a.title.localeCompare(b.title),
      ),
      locationTypes: data.locationTypes.sort((a: ListingType, b: ListingType) =>
        a.title.localeCompare(b.title),
      ),
      serviceTypes: data.serviceTypes.sort((a: ListingType, b: ListingType) =>
        a.title.localeCompare(b.title),
      ),
      facilities: data.facilities.sort((a: Facility, b: Facility) =>
        a.title.localeCompare(b.title),
      ),
    } as {
      cities: City[];
      eventTypes: ListingType[];
      locationTypes: ListingType[];
      serviceTypes: ListingType[];
      facilities: Facility[];
    };
  } catch (error) {
    console.error("Error fetching taxonomies:", error);
    return {
      cities: [] as City[],
      eventTypes: [] as ListingType[],
      locationTypes: [] as ListingType[],
      serviceTypes: [] as ListingType[],
      facilities: [] as Facility[],
    };
  }
}
