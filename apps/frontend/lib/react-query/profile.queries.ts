import { useQuery } from "@tanstack/react-query";
import {
  fetchProfileBySlug,
  fetchProfileListings,
  fetchProfileReviews,
  type ProfileListingsResponse,
  type ProfileReviewsResponse,
} from "@/lib/api/profile";
import { profileKeys } from "@/lib/cacheKeys";
import type { Profile } from "@/types/payload-types";

export function useProfileBySlug(slug: string | undefined | null) {
  return useQuery<Profile | null>({
    queryKey: profileKeys.bySlug(slug || ""),
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) return null;
      const { data } = await fetchProfileBySlug(slug);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProfileListings(
  slug: string | undefined | null,
  profileId?: number,
) {
  return useQuery<ProfileListingsResponse | null>({
    queryKey: profileKeys.listings(profileId || slug || ""),
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) return null;
      return fetchProfileListings(slug, profileId);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProfileReviews(
  slug: string | undefined | null,
  page: number = 1,
  limit: number = 10,
  profileId?: number,
) {
  return useQuery<ProfileReviewsResponse | null>({
    queryKey: profileKeys.reviews(profileId || slug || ""),
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) return null;
      return fetchProfileReviews(slug, page, limit, profileId);
    },
    staleTime: 5 * 60 * 1000,
  });
}
