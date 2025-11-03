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

  const { data: isFavorited, isLoading } = useQuery<boolean, Error>({
    queryKey: favoriteKey,
    queryFn: () =>
      checkIfIsFavorited(
        getListingTypeSlug(listingType) as "events" | "locations" | "services",
        listingId,
        (session as any)?.accessToken,
      ),
    enabled: !!(session as any)?.accessToken,

    staleTime: 5 * 60 * 1000,
    initialData: initialIsFavorited ?? false,
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
      await queryClient.cancelQueries({ queryKey: favoriteKey });
      const cached = queryClient.getQueryData<boolean>(favoriteKey);
      const previous =
        typeof cached === "boolean" ? cached : (initialIsFavorited ?? false);

      queryClient.setQueryData<boolean>(favoriteKey, !previous);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) {
        queryClient.setQueryData<boolean>(favoriteKey, ctx.previous);
      }
      return Promise.reject(_err);
    },
    onSuccess: (data) => {
      queryClient.setQueryData<boolean>(favoriteKey, data.isFavorite);
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
