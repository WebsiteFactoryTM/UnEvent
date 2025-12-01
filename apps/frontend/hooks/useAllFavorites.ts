"use client";
import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {
  getUserFavorites,
  type PaginatedFavoritesResponse,
  toggleFavorite,
  type ToggleFavoriteResponse,
} from "@/lib/api/favorites";
import { favoritesKeys } from "@/lib/cacheKeys";
import { getListingTypeSlug } from "@/lib/getListingType";
import { Favorite } from "@/types/payload-types";
import {
  LocationListing,
  EventListing,
  ServiceListing,
} from "@/types/listings";
import { normalizeListing } from "@/lib/transforms/normalizeListing";

type FrontendListingType = "evenimente" | "locatii" | "servicii";

export interface FavoriteWithListing {
  id: number;
  listing: LocationListing | EventListing | ServiceListing;
  createdAt: string;
  updatedAt: string;
}

function extractListingFromFavorite(
  favorite: Favorite,
): LocationListing | EventListing | ServiceListing | null {
  if (!favorite.target) return null;

  // Handle polymorphic relationship
  if (typeof favorite.target === "object" && "value" in favorite.target) {
    const targetValue = favorite.target.value;
    if (typeof targetValue === "object" && targetValue !== null) {
      return normalizeListing(targetValue) as
        | LocationListing
        | EventListing
        | ServiceListing;
    }
  }

  return null;
}

export function useAllFavorites(kind?: "locations" | "events" | "services") {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const accessToken = (session as any)?.accessToken;

  const userId = session?.user?.profile || "";

  const query = useInfiniteQuery<PaginatedFavoritesResponse, Error>({
    queryKey: favoritesKeys.userFavorites(String(userId || ""), kind),
    queryFn: ({ pageParam = 1 }) =>
      getUserFavorites(accessToken, {
        page: pageParam as number,
        limit: 50,
        kind,
      }) as Promise<PaginatedFavoritesResponse>,
    enabled: !!accessToken && !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute (reduced from 2)
    gcTime: 2 * 60 * 1000, // 2 minutes (reduced from default 5)
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Populate individual favorite caches when data is fetched
  // This way, if user visits favorites page, all individual caches get populated
  useEffect(() => {
    if (query.data) {
      const allFavorites = query.data.pages.flatMap((page) => page.docs);

      // Populate individual favorite caches
      allFavorites.forEach((fav) => {
        if (fav.kind && fav.targetKey) {
          // Extract listing ID from targetKey (format: "locations:123")
          const [kindStr, idStr] = fav.targetKey.split(":");
          const listingId = parseInt(idStr, 10);

          if (!isNaN(listingId) && kindStr) {
            const favoriteKey = favoritesKeys.listing(kindStr, listingId);
            // Set cache with same staleTime as useFavorites (10 minutes)
            queryClient.setQueryData<boolean>(favoriteKey, true);
          }
        }
      });
    }
  }, [query.data, queryClient]);

  // Transform favorites to include listings from all pages
  const allFavorites = query.data?.pages.flatMap((page) => page.docs) || [];

  const favoritesWithListings: FavoriteWithListing[] = allFavorites
    .map((fav) => {
      const listing = extractListingFromFavorite(fav);
      if (!listing) return null;
      return {
        id: fav.id,
        listing,
        createdAt: fav.createdAt,
        updatedAt: fav.updatedAt,
      };
    })
    .filter((fav): fav is FavoriteWithListing => fav !== null);

  // Group by kind if not filtering
  const locations: FavoriteWithListing[] = kind
    ? kind === "locations"
      ? favoritesWithListings
      : []
    : favoritesWithListings.filter(
        (fav) =>
          (fav.listing as any).collection === "locations" ||
          (fav.listing as any).__collection === "locations",
      );

  const events: FavoriteWithListing[] = kind
    ? kind === "events"
      ? favoritesWithListings
      : []
    : favoritesWithListings.filter(
        (fav) =>
          (fav.listing as any).collection === "events" ||
          (fav.listing as any).__collection === "events",
      );

  const services: FavoriteWithListing[] = kind
    ? kind === "services"
      ? favoritesWithListings
      : []
    : favoritesWithListings.filter(
        (fav) =>
          (fav.listing as any).collection === "services" ||
          (fav.listing as any).__collection === "services",
      );

  // Mutation for removing a favorite
  const removeMutation = useMutation<
    ToggleFavoriteResponse,
    Error,
    { listingType: FrontendListingType; listingId: number }
  >({
    mutationFn: async ({ listingType, listingId }) => {
      const slug = getListingTypeSlug(listingType);
      return toggleFavorite(
        slug as "events" | "locations" | "services",
        listingId,
        accessToken,
      );
    },
    onSuccess: (data, variables) => {
      // Update individual favorite cache immediately
      const slug = getListingTypeSlug(variables.listingType);
      const favoriteKey = favoritesKeys.listing(slug, variables.listingId);
      queryClient.setQueryData<boolean>(favoriteKey, false); // Removed, so false

      // Invalidate all favorite queries
      queryClient.invalidateQueries({
        queryKey: favoritesKeys.userFavorites(String(userId || "")),
      });
      queryClient.invalidateQueries({
        queryKey: favoritesKeys.all,
      });
    },
  });

  return {
    locations,
    events,
    services,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    removeFavorite: removeMutation.mutate,
    removeFavoriteAsync: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
  };
}
