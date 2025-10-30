import type { City } from "@/types/payload-types";

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
