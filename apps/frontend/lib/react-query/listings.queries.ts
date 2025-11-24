import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listingsKeys } from "../cacheKeys";
import { fetchJson } from "./utils";
import { fetchSimilarListings } from "@/lib/api/listings";
import { getProfile, updateProfile } from "@/lib/api/profile";
import type { ListingType } from "@/types/listings";
import type {
  City,
  ListingType as SuitableForType,
  Profile,
} from "@/types/payload-types";
import type { Listing } from "@/types/listings";
import { frontendTypeToCollectionSlug } from "@/lib/api/reviews";
import { useSession } from "next-auth/react";
import { profileKeys } from "../cacheKeys";
import type { ProfileFormData } from "@/components/cont/ProfilePersonalDetailsForm";

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
  listingId?: number,
  city?: City,
  suitableFor?: (number | SuitableForType)[],
  limit: number = 10,
  enabled: boolean = true,
) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const suitableForIds = suitableFor?.map((item) =>
    typeof item === "number" ? item : item.id,
  );

  // Avoid firing until we have any filter context (city or suitableFor)
  const hasFilters = Boolean((suitableForIds && suitableForIds.length) || city);
  const isEnabled = enabled && hasFilters;

  return useQuery<Listing[]>({
    queryKey: listingsKeys.list(
      "similar",
      frontendTypeToCollectionSlug(listingType),
      {
        listingId: listingId ?? undefined,
        cityId: city?.id ?? undefined,
        suitableForIds,
        limit,
      },
    ),
    queryFn: () =>
      fetchSimilarListings(listingType, listingId, city, suitableFor, limit),
    enabled: isEnabled,
    staleTime: 60 * 60 * 1000,
  });
}
