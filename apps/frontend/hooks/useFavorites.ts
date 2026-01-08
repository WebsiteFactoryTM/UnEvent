"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  toggleFavorite,
  type ToggleFavoriteResponse,
} from "@/lib/api/favorites";
import { getListingTypeSlug } from "@/lib/getListingType";
import { favoritesKeys } from "@/lib/cacheKeys";
import { listingsKeys } from "@/lib/cacheKeys";
import { checkIfIsFavorited } from "@/lib/api/favorites";
import { isAnonymousFavorite } from "@/lib/favorites/localStorage";

type FrontendListingType = "evenimente" | "locatii" | "servicii";

export function useFavorites({
  listingType,
  listingId,
  initialIsFavorited,
}: {
  listingType: FrontendListingType;
  listingId: number;
  initialIsFavorited?: boolean;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();

  // Shared key for the favorite state so multiple components stay in sync
  const favoriteKey = favoritesKeys.listing(
    getListingTypeSlug(listingType),
    listingId,
  );

  // Check if we have cached data
  const cached = queryClient.getQueryData<boolean>(favoriteKey);

  const { data: isFavorited, isLoading } = useQuery<boolean, Error>({
    queryKey: favoriteKey,
    queryFn: async () => {
      const accessToken = (session as any)?.accessToken;

      // If authenticated, ALWAYS call API (never check localStorage when logged in)
      if (accessToken) {
        return checkIfIsFavorited(
          getListingTypeSlug(listingType) as
            | "events"
            | "locations"
            | "services",
          listingId,
          accessToken,
        );
      }

      // If no accessToken, check localStorage (for anonymous users)
      return isAnonymousFavorite(
        getListingTypeSlug(listingType) as "events" | "locations" | "services",
        listingId,
      );
    },
    // Disable the query entirely - we only rely on batch data and cache
    // FavoriteButton is only used in ListingCard, which is always in a batch context
    // The batch query (useBatchFavorites) will populate the cache for us
    enabled: false,

    // Aggressive caching - data stays fresh for 10 minutes
    staleTime: 10 * 60 * 1000, // 10 minutes
    // Keep in cache for 30 minutes even if unused
    gcTime: 30 * 60 * 1000, // 30 minutes (was default 5 minutes)

    // Use initialIsFavorited from batch as initialData
    // This prevents the query from running if we already have data from the batch
    initialData: initialIsFavorited !== undefined ? initialIsFavorited : cached,
    
    // Mark initialData as fresh if it came from initialIsFavorited (batch)
    // This prevents React Query from immediately refetching
    initialDataUpdatedAt:  Date.now(),

    // Respect staleTime - don't refetch if data is fresh (e.g., from batch)
    // This allows useBatchFavorites to populate the cache and avoid redundant requests
    // For detail pages, the batch hook won't run, so this will fetch as normal
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // Refetch on reconnect to get latest state
    refetchOnReconnect: true,
  });

  const mutation = useMutation<
    ToggleFavoriteResponse,
    Error,
    void,
    { previous: boolean }
  >({
    mutationFn: async () => {
      const slug = getListingTypeSlug(listingType);
      return toggleFavorite(
        slug as "events" | "locations" | "services",
        listingId,
        (session as any)?.accessToken,
      );
    },
    onMutate: async () => {
      // Cancel any in-flight queries
      await queryClient.cancelQueries({ queryKey: favoriteKey });

      // Get current state from cache (query always runs now, so this should be accurate)
      const previous = queryClient.getQueryData<boolean>(favoriteKey) ?? false;

      // Optimistically update cache immediately
      queryClient.setQueryData<boolean>(favoriteKey, !previous);

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      // Rollback on error
      if (ctx) {
        queryClient.setQueryData<boolean>(favoriteKey, ctx.previous);
      }
      return Promise.reject(_err);
    },
    onSuccess: (data) => {
      // Update cache with server response (this is the source of truth)
      queryClient.setQueryData<boolean>(favoriteKey, data.isFavorite);

      // Invalidate user favorites cache if it exists (for useAllFavorites)
      const userId = (session as any)?.user?.profile || "";
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: favoritesKeys.userFavorites(String(userId)),
          exact: false, // Invalidate all variants (with/without kind filter)
        });
      }

      // Invalidate all batch favorites caches so grid views reflect the change
      // Batch caches are keyed as ["favorites", "batch", targetKeys[]]
      queryClient.invalidateQueries({
        queryKey: ["favorites", "batch"],
        exact: false, // Match all batch queries regardless of targetKeys
      });
    },
    onSettled: async () => {
      // Invalidate listing queries so derived fields (counts, flags) refresh
      // Invalidate listing detail and listing lists for this type
      await queryClient.invalidateQueries({
        queryKey: listingsKeys.detail(
          getListingTypeSlug(listingType),
          listingId,
        ),
        exact: false,
      });
      await queryClient.invalidateQueries({
        queryKey: listingsKeys.type(getListingTypeSlug(listingType)),
        exact: false,
      });
    },
  });

  // Return the favorite state
  // If query is disabled (session loading), isFavorited will be undefined
  // In this case, default to false BUT mark as loading so UI doesn't show wrong state
  const isActuallyLoading = isLoading || sessionStatus === "loading";
  const finalState = isFavorited ?? false;

  return {
    isFavorited: finalState,
    toggle: mutation.mutate,
    toggleAsync: mutation.mutateAsync,
    isToggling: mutation.isPending,
    isLoading: isActuallyLoading, // Include session loading state
    error: mutation.error,
  };
}
