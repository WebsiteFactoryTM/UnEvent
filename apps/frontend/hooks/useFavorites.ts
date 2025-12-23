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
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Shared key for the favorite state so multiple components stay in sync
  const favoriteKey = favoritesKeys.listing(
    getListingTypeSlug(listingType),
    listingId,
  );

  // Check if we have cached data or initial data
  const cached = queryClient.getQueryData<boolean>(favoriteKey);
  const hasInitialData =
    initialIsFavorited !== undefined && cached === undefined;

  const { data: isFavorited, isLoading } = useQuery<boolean, Error>({
    queryKey: favoriteKey,
    queryFn: () =>
      checkIfIsFavorited(
        getListingTypeSlug(listingType) as "events" | "locations" | "services",
        listingId,
        (session as any)?.accessToken,
      ),
    // Only enable query if we have a token AND don't have initial data from batch call
    // If we have initialIsFavorited, treat it as already fetched (no API call needed)
    enabled: !!(session as any)?.accessToken && !hasInitialData,

    // Aggressive caching - data stays fresh for 10 minutes
    staleTime: 10 * 60 * 1000, // 10 minutes
    // Keep in cache for 30 minutes even if unused
    gcTime: 30 * 60 * 1000, // 30 minutes (was default 5 minutes)

    // If we have initialIsFavorited from batch call, use it as initialData
    // This tells React Query the data is already fetched, preventing API call
    initialData: hasInitialData ? initialIsFavorited : undefined,

    // Fallback to cached data if available (for cases where cache exists)
    placeholderData: () => {
      if (cached !== undefined) return cached;
      return undefined;
    },

    // Don't refetch on mount/window focus if we have cached data
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // Only refetch on reconnect if data is stale
    refetchOnReconnect: "always",
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

      // Get current cached value
      const cached = queryClient.getQueryData<boolean>(favoriteKey);
      const previous =
        typeof cached === "boolean" ? cached : (initialIsFavorited ?? false);

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

  return {
    isFavorited,
    toggle: mutation.mutate,
    toggleAsync: mutation.mutateAsync,
    isToggling: mutation.isPending,
    isLoading: isLoading,
    error: mutation.error,
  };
}
