/**
 * Search-related TypeScript types for listings-only full-text search
 */

export type SearchKind = "locations" | "services" | "events" | "all";

export type SearchCollection = "locations" | "services" | "events";

export interface SearchResult {
  id: number;
  title: string;
  description?: string | null;
  address?: string | null;
  cityName?: string | null;
  type?: string[] | string | null; // Can be array, JSON string, or comma-separated string
  priority?: number | null;
  collection: SearchCollection;
  slug?: string | null;
  image?: {
    url?: string | null;
    alt?: string | null;
  } | null;
}

export interface SearchResponse {
  docs: SearchResult[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage?: number | null;
  prevPage?: number | null;
}

export interface SearchParams {
  q: string;
  kind?: SearchKind;
  collections?: SearchCollection[];
  limit?: number;
  page?: number;
}
