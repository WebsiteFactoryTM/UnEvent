import type { Review } from "@/types/payload-types";
import { stringify } from "qs-esm";
// Mapping helpers live in '@/lib/getListingType' for UI, but this API expects
// backend collection slugs already. Keep local mapping for convenience.

export type ListingCollectionSlug = "events" | "locations" | "services";

export interface PaginatedResult<T> {
  docs: T[];
  totalDocs: number;
  page?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function frontendTypeToCollectionSlug(
  listingType: string,
): ListingCollectionSlug {
  const listingTypes: Record<string, ListingCollectionSlug> = {
    evenimente: "events",
    locatii: "locations",
    servicii: "services",
  };
  return listingTypes[listingType];
}

export interface FetchReviewsParams {
  listingId: number;
  listingType: ListingCollectionSlug;
  page?: number;
  limit?: number;
  status?: "approved" | "pending" | "rejected";
}

export async function fetchReviews({
  listingId,
  listingType,
  page = 1,
  limit = 10,
  status = "approved",
}: FetchReviewsParams): Promise<PaginatedResult<Review>> {
  if (!API_URL) throw new Error("Missing NEXT_PUBLIC_API_URL");

  const query = {
    listing: {
      relationTo: { equals: listingType },
      value: { equals: listingId },
    },
    status: { equals: status },
  } as const;
  // This query could be much more complex
  // and qs-esm would handle it beautifully
  const stringifiedQuery = stringify(
    {
      where: query,
      limit,
      page,
      depth: 2,
    },
    { addQueryPrefix: true },
  );
  try {
    const res = await fetch(`${API_URL}/api/reviews${stringifiedQuery}`);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Failed to fetch reviews (${res.status})`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw new Error(
      `Failed to fetch reviews (${error instanceof Error ? error.message : "Unknown error"})`,
    );
  }
}

export interface CriteriaRatingInput {
  criteria:
    | "cleanliness"
    | "location"
    | "amenities"
    | "organization"
    | "entertainment"
    | "value"
    | "quality"
    | "timeliness"
    | "communication";
  rating: number;
}

export interface CreateReviewInput {
  listingId: number;
  listingType: ListingCollectionSlug;
  rating: number;
  comment?: string;
  criteriaRatings?: CriteriaRatingInput[];
}

export async function createReview(
  input: CreateReviewInput,
  accessToken?: string,
): Promise<Review> {
  if (!API_URL) throw new Error("Missing NEXT_PUBLIC_API_URL");

  const body = {
    listing: { relationTo: input.listingType, value: input.listingId },
    listingType: input.listingType,
    rating: input.rating,
    comment: input.comment,
    criteriaRatings: input.criteriaRatings,
  };

  const res = await fetch(`${API_URL}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `JWT ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to create review (${res.status})`);
  }

  return res.json();
}
