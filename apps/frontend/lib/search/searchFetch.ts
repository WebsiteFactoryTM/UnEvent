import type { SearchParams, SearchResponse } from "./types";

/**
 * Sanitize error message for user display
 */
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check for common backend errors and provide friendly messages
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

    // For HTTP errors, provide a generic message
    if (message.includes("http") || message.includes("failed")) {
      return "A apărut o eroare la căutare. Te rugăm să încerci din nou.";
    }

    // For unknown errors, return a generic message
    return "A apărut o eroare. Te rugăm să încerci din nou.";
  }

  return "A apărut o eroare. Te rugăm să încerci din nou.";
}

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

      // Log the full error for debugging, but throw sanitized version
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
