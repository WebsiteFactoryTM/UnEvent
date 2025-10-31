import { useQuery } from "@tanstack/react-query";
import { listingsKeys } from "./listings.keys";
import { fetchJson } from "./utils";
import { fetchSimilarListings } from "@/lib/api/listings";
import type { ListingType } from "@/types/listings";
import type { City, ListingType as SuitableForType } from "@/types/payload-types";
import type { Listing } from "@/types/listings";

export function useListings(
  ctx: string,
  type: string,
  filters?: Record<string, any>,
) {
  return useQuery({
    queryKey: listingsKeys.list(ctx, type, filters),
    queryFn: async () => {
      const qs = new URLSearchParams(filters || {}).toString();
      return fetchJson(`${process.env.NEXT_PUBLIC_API_URL}/api/${type}?${qs}`);
    },
  });
}

export function useListingDetail(type: string, id: number | string) {
  return useQuery({
    queryKey: listingsKeys.detail(type, id),
    queryFn: async () =>
      fetchJson(`${process.env.NEXT_PUBLIC_API_URL}/api/${type}/${id}`),
  });
}

export function useSimilarListings(
  listingType: ListingType,
  suitableFor: (number | SuitableForType)[],
  city: City,
  limit: number = 10,
  accessToken?: string,
  enabled: boolean = true,
) {
  const suitableForIds = suitableFor.map((item) =>
    typeof item === "number" ? item : item.id,
  );

  return useQuery<Listing[]>({
    queryKey: listingsKeys.list("similar", listingType, {
      cityId: city.id,
      suitableForIds,
      limit,
    }),
    queryFn: () =>
      fetchSimilarListings(listingType, suitableFor, city, limit, accessToken),
    enabled,
    staleTime: 60 * 60 * 1000,
  });
}

