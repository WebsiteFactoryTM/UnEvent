import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listingsKeys } from "../cacheKeys";
import {
  getUserListings,
  createListing,
  updateListing,
  deleteListing,
} from "@/lib/api/accountListings";
import { useSession } from "next-auth/react";
import { Listing, ListingType } from "@/types/listings";
import { getListingTypeSlug } from "../getListingType";

interface UseListingsManagerOptions {
  type: ListingType;
  filters?: Record<string, any>;
  profileId?: number;
  accessToken?: string;
}

export function useListingsManager({
  type,
  filters,
  profileId,
  accessToken,
}: UseListingsManagerOptions) {
  const queryClient = useQueryClient();

  const listingType = getListingTypeSlug(type as ListingType);
  // ---- Fetch listings ----
  const {
    data: listings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: listingsKeys.userListings(listingType, String(profileId)),
    queryFn: () => getUserListings(listingType, accessToken, profileId),
    enabled: !!profileId && !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // ---- Create listing ----
  const createMutation = useMutation({
    mutationFn: (data: any) =>
      createListing(listingType, data, accessToken, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: listingsKeys.userListings(listingType, String(profileId)),
      });
    },
    onError: (error) => {
      console.error("Error creating listing:", error);
      // Error is thrown and will be caught by the component
    },
  });

  // ---- Update listing ----
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateListing(listingType, id, data, accessToken, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: listingsKeys.userListings(listingType, String(profileId)),
      });
    },
    onError: (error) => {
      console.error("Error updating listing:", error);
      // Error is thrown and will be caught by the component
    },
  });

  // ---- Delete listing ----
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      deleteListing(listingType, id, accessToken, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: listingsKeys.userListings(listingType, String(profileId)),
      });
    },
    onError: (error) => {
      console.error("Error deleting listing:", error);
      // Error is thrown and will be caught by the component
    },
  });

  return {
    listings: (listings as Listing[]) || [],
    isLoading,
    error,
    refetch,

    createListing: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateListing: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteListing: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
