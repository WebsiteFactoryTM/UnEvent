import { useQuery } from "@tanstack/react-query";
import { searchKeys } from "../cacheKeys";
import type { SearchParams, SearchResponse } from "../search/types";

/**
 * Sanitize error message for user display
 */
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("cannot be queried") ||
      message.includes("upstream search error")
    ) {
      return "A apărut o eroare la căutare. Te rugăm să încerci din nou.";
    }

    if (message.includes("network") || message.includes("fetch")) {
      return "Probleme de conexiune. Verifică conexiunea la internet.";
    }

    if (message.includes("timeout")) {
      return "Căutarea durează prea mult. Te rugăm să încerci din nou.";
    }

    if (message.includes("http") || message.includes("failed")) {
      return "A apărut o eroare la căutare. Te rugăm să încerci din nou.";
    }

    return "A apărut o eroare. Te rugăm să încerci din nou.";
  }

  return "A apărut o eroare. Te rugăm să încerci din nou.";
}

/**
 * Fetch search results from the API
 */
async function fetchSearchResults(
  params: SearchParams,
): Promise<SearchResponse> {
  const { q, kind, collections, limit = 5, page = 1 } = params;

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
      // Let React Query handle caching instead of browser
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => `HTTP ${response.status}`);
      console.error("Search API error:", errorText);
      throw new Error(sanitizeErrorMessage(new Error(errorText)));
    }

    const data = await response.json();
    return data as SearchResponse;
  } catch (error) {
    console.error("Search fetch error:", error);
    throw new Error(sanitizeErrorMessage(error));
  }
}

/**
 * Hook for searching listings with React Query caching
 *
 * @param params - Search parameters
 * @param options - React Query options
 * @returns Query result with search results
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSearchListings({
 *   q: "restaurant",
 *   kind: "locations",
 *   limit: 10,
 * });
 * ```
 */
export function useSearchListings(
  params: SearchParams,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  },
) {
  const { q, kind = "all", collections, limit = 5, page = 1 } = params;

  return useQuery({
    queryKey: searchKeys.query({ q, kind, collections, limit, page }),
    queryFn: () => fetchSearchResults(params),
    enabled: options?.enabled ?? q.trim().length >= 2, // Only search if query is 2+ chars
    staleTime: options?.staleTime ?? 60_000, // Cache for 1 minute (search results can be slightly stale)
    gcTime: 5 * 60_000, // Keep in cache for 5 minutes
    retry: 1, // Retry once on failure
  });
}
