"use server";

import type { City } from "@/types/payload-types";
import type { Listing, ListingType } from "@/types/listings";
import type { HubSnapshotResponse } from "@/lib/normalizers/hub";
import { frontendTypeToCollectionSlug } from "@/lib/api/reviews";
import { getListingTypeSlug } from "@/lib/getListingType";
import { tag } from "@unevent/shared";

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
): Promise<HubSnapshotResponse | null> {
  try {
    const isServer = typeof window === "undefined";
    const collection = getListingTypeSlug(listingType);

    // 1. Server-Side: Direct Payload Call
    if (isServer && API_URL) {
      const url = new URL(`/api/hub`, API_URL);
      url.searchParams.set("listingType", collection);

      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        next: {
          tags: [tag.hubSnapshot(collection), tag.hubAny()],
          revalidate: 900,
        },
      });

      if (!res.ok) return null;
      return (await res.json()) as HubSnapshotResponse;
    }

    // 2. Client-Side: BFF Call
    if (process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.VERCEL_URL) {
      const baseUrl =
        process.env.NEXT_PUBLIC_FRONTEND_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");

      const bffUrl = `${baseUrl}/api/public/hub/${collection}`;

      try {
        const res = await fetch(bffUrl, {
          headers: { Accept: "application/json" },
          next: { revalidate: 900 },
        });

        if (res.ok) {
          return (await res.json()) as HubSnapshotResponse;
        }
      } catch (bffError) {
        console.error("BFF hub route failed:", bffError);
      }
    }

    // Fallback if client-side BFF fails or no URL configured
    if (!API_URL) return null;
    const url = new URL(`/api/hub`, API_URL);
    url.searchParams.set("listingType", collection);

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
    });

    if (!res.ok) return null;
    return (await res.json()) as HubSnapshotResponse;
  } catch (err) {
    console.error("fetchHubSnapshot error", err);
    return null;
  }
}
