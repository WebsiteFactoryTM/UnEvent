"use server";

import type { City, HubSnapshot } from "@/types/payload-types";
import type { Listing, ListingType } from "@/types/listings";
import { frontendTypeToCollectionSlug } from "@/lib/api/reviews";
import { getListingTypeSlug } from "@/lib/getListingType";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  // Avoid throwing at import time in Next.js; consumers should handle empty results
  console.warn(
    "NEXT_PUBLIC_API_URL is not set; hub fetchers will return empty results",
  );
}

export async function fetchHubPopularCities(
  limit: number = 6,
): Promise<City[]> {
  try {
    if (!API_URL) return [];
    const url = new URL("/api/cities", API_URL);
    url.searchParams.set("where[featured][equals]", "true");
    url.searchParams.set("sort", "usageCount:desc");
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { docs?: City[] } | null;
    return data?.docs ?? [];
  } catch (err) {
    console.error("fetchHubPopularCities error", err);
    return [];
  }
}

export async function fetchHubTypeaheadCities(
  limit: number = 50,
): Promise<{ slug: string; label: string }[]> {
  try {
    if (!API_URL) return [];
    const url = new URL("/api/cities", API_URL);
    url.searchParams.set("sort", "usageCount:desc");
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { docs?: City[] } | null;
    const cities = data?.docs ?? [];
    return cities
      .filter((c) => Boolean(c.slug && c.name))
      .map((c) => ({ slug: c.slug!, label: c.name }));
  } catch (err) {
    console.error("fetchHubTypeaheadCities error", err);
    return [];
  }
}

export async function fetchHubFeaturedListings(
  listingType: ListingType,
  limit: number = 12,
  accessToken?: string,
): Promise<Listing[]> {
  try {
    if (!API_URL) return [] as Listing[];
    const collection = frontendTypeToCollectionSlug(listingType);
    const url = new URL(`/api/${collection}`, API_URL);
    // Prefer recommended/sponsored nationally
    url.searchParams.set("where[tier][in][0]", "recommended");
    url.searchParams.set("where[tier][in][1]", "sponsored");
    url.searchParams.set("sort", "rating:desc");
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [] as Listing[];
    const data = await res.json();
    return (data?.docs ?? []) as Listing[];
  } catch (err) {
    console.error("fetchHubFeaturedListings error", err);
    return [] as Listing[];
  }
}

export async function fetchHubTopByCity(
  listingType: ListingType,
  cityId: number,
  limit: number = 9,
  accessToken?: string,
): Promise<Listing[]> {
  try {
    if (!API_URL) return [] as Listing[];
    const collection = frontendTypeToCollectionSlug(listingType);
    const url = new URL(`/api/${collection}`, API_URL);
    url.searchParams.set("where[city][equals]", String(cityId));
    url.searchParams.set("sort", "rating:desc");
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [] as Listing[];
    const data = await res.json();
    return (data?.docs ?? []) as Listing[];
  } catch (err) {
    console.error("fetchHubTopByCity error", err);
    return [] as Listing[];
  }
}

export async function fetchHubSnapshot(
  listingType: ListingType,
): Promise<HubSnapshot | null> {
  try {
    if (!API_URL) return null;
    const collection = getListingTypeSlug(listingType);
    const url = new URL(`/api/hub`, API_URL);
    url.searchParams.set("listingType", collection);
    console.log(url.toString());

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600, tags: [`hub-${listingType}`] },
    });

    if (!res.ok) return null;
    return (await res.json()) as HubSnapshot;
  } catch (err) {
    console.error("fetchHubSnapshot error", err);
    return null;
  }
}
