import type { SearchParams, SearchResponse } from "./types";

/**
 * Search listings using the frontend API proxy
 */
export async function searchListings(
  params: SearchParams,
): Promise<SearchResponse> {
  const { q, kind, collections, limit = 5, page = 1 } = params;

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.set("q", q);

  if (kind && kind !== "all") {
    searchParams.set("collections", kind);
  } else if (collections && collections.length > 0) {
    searchParams.set("collections", collections.join(","));
  }

  searchParams.set("limit", String(limit));
  searchParams.set("page", String(page));

  const baseUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");

  const url = `${baseUrl}/api/search?${searchParams.toString()}`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => `HTTP ${response.status}`);
      throw new Error(`Search failed: ${errorText}`);
    }

    const data = await response.json();
    return data as SearchResponse;
  } catch (error) {
    console.error("Search fetch error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to search listings");
  }
}
