import { getFrontendListingTypeSlug } from "@/lib/getListingType";
import type { SearchCollection } from "./types";

/**
 * Maps backend collection slug to frontend listing detail route
 * @param collection - Backend collection slug (locations, services, events)
 * @param slug - Listing slug
 * @returns Frontend route path
 */
export function getListingDetailRoute(
  collection: SearchCollection,
  slug: string,
): string {
  if (!slug) {
    return "#";
  }

  const frontendType = getFrontendListingTypeSlug(collection);
  return `/${frontendType}/${slug}`;
}
