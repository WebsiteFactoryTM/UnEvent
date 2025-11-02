"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  toggleFavorite,
  type ToggleFavoriteResponse,
} from "@/lib/api/favorites";
import { getListingTypeSlug } from "@/lib/getListingType";
import { favoritesKeys } from "@/lib/react-query/favorites.keys";
import { listingsKeys } from "@/lib/react-query/listings.keys";

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

  // Seed cache with initial flag if provided
  if (
    typeof initialIsFavorited === "boolean" &&
    queryClient.getQueryData<boolean>(favoriteKey) === undefined
  ) {
    queryClient.setQueryData<boolean>(favoriteKey, initialIsFavorited);
  }

  const mutation = useMutation<
    ToggleFavoriteResponse,
    Error,
    void,
    { previous?: boolean }
  >({
    mutationFn: async () => {
      console.log("triggering favorite mutation");

      const slug = getListingTypeSlug(listingType);
      return toggleFavorite(
        slug as "events" | "locations" | "services",
        listingId,
        (session as any)?.accessToken,
      );
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: favoriteKey });
      const previous = queryClient.getQueryData<boolean>(favoriteKey);
      queryClient.setQueryData<boolean>(favoriteKey, (prev) => !prev);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
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
        queryKey: listingsKeys._type(getListingTypeSlug(listingType)),
        exact: false,
      });
    },
  });

  const isFavorited =
    queryClient.getQueryData<boolean>(favoriteKey) ??
    initialIsFavorited ??
    false;

  return {
    isFavorited,
    toggle: mutation.mutate,
    toggleAsync: mutation.mutateAsync,
    isToggling: mutation.isPending,
    error: mutation.error,
  };
}
