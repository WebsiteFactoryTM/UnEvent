"use server";
import { City, ListingType, Facility } from "@/types/payload-types";
import { headers } from "next/headers";

export async function fetchTaxonomies({
  fullList = false,
}: { fullList?: boolean } = {}) {
  try {
    // Construct URL for internal API call
    // Try to get the host from headers first, fallback to env vars
    let baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;

    if (!baseUrl) {
      try {
        const headersList = await headers();
        const host = headersList.get("host");
        const protocol =
          process.env.NODE_ENV === "production" ? "https" : "http";
        baseUrl = host ? `${protocol}://${host}` : "http://localhost:3000";
      } catch {
        // If headers() fails (e.g., in some contexts), use fallback
        baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000";
      }
    }

    const res = await fetch(
      `${baseUrl}/api/public/taxonomies?fullList=${fullList ? "1" : "0"}`,
      {
        // Server-side fetch should use cache
        next: { revalidate: 86400 },
      },
    );

    if (!res.ok) throw new Error("Failed to fetch taxonomies");

    const data = await res.json();

    return {
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
      eventTypes: ListingType[];
      locationTypes: ListingType[];
      serviceTypes: ListingType[];
      facilities: Facility[];
    };
  } catch (error) {
    console.error("Error fetching taxonomies:", error);
    return {
      eventTypes: [] as ListingType[],
      locationTypes: [] as ListingType[],
      serviceTypes: [] as ListingType[],
      facilities: [] as Facility[],
    };
  }
}
