"use server";
import type { City } from "@/types/payload-types";
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

function buildBffQuery({
  search,
  limit,
  verifiedOnly,
  popularFallback,
}: {
  search?: string;
  limit: number;
  verifiedOnly?: boolean;
  popularFallback: boolean;
}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search.trim());
  params.set("limit", String(limit));
  if (verifiedOnly) params.set("verifiedOnly", "1");
  params.set("popularFallback", popularFallback ? "1" : "0");
  return params.toString();
}

function resolveFrontendBaseUrl() {
  if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
    return process.env.NEXT_PUBLIC_FRONTEND_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

function isBuildTime() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    (typeof window === "undefined" &&
      !process.env.VERCEL_URL &&
      !process.env.NEXT_PUBLIC_FRONTEND_URL)
  );
}

export async function getCities({
  search,
  limit = 20,
  verifiedOnly,
  popularFallback = true,
}: UseCitiesProps): Promise<City[]> {
  const trimmedSearch = search?.trim();
  const bffQuery = buildBffQuery({
    search: trimmedSearch,
    limit,
    verifiedOnly,
    popularFallback,
  });

  if (!isBuildTime()) {
    const baseUrl = resolveFrontendBaseUrl();
    const bffUrl = `${baseUrl}/api/public/cities?${bffQuery}`;
    try {
      const response = await fetch(bffUrl, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (response.ok) {
        return (await response.json()) as City[];
      }

      const errorText = await response.text().catch(() => response.statusText);
      console.error(
        `BFF /api/public/cities failed (${response.status}):`,
        errorText,
      );
    } catch (error) {
      console.error("BFF /api/public/cities error:", error);
    }
  }

  // Fallback to direct Payload call (build time or BFF unavailable)
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn(
      "NEXT_PUBLIC_API_URL is not configured; cannot fetch cities fallback",
    );
    return [];
  }

  try {
    const payloadParams = buildCitySearchParams({
      search: trimmedSearch,
      limit,
      verifiedOnly,
      popularFallback,
    });
    const payloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/cities?${payloadParams.toString()}`;

    const response = await fetch(payloadUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(
        `Payload /api/cities failed (${response.status}): ${errorText}`,
      );
    }

    const payload = (await response.json()) as { docs?: City[] };
    return Array.isArray(payload?.docs) ? payload.docs : [];
  } catch (error) {
    console.error("Fallback Payload /api/cities error:", error);
    return [];
  }
}
