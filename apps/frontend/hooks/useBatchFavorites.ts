"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { checkBatchFavorites } from "@/lib/api/favorites";
import { favoritesKeys } from "@/lib/cacheKeys";
import { useMemo, useEffect } from "react";
import { ListingCardData } from "@/lib/normalizers/hub";
import { getListingTypeSlug } from "@/lib/getListingType";
import { getAnonymousFavorites } from "@/lib/favorites/localStorage";

/**
 * Hook to batch-fetch favorite status for multiple listings
 * Returns enriched listings with initialIsFavorited populated
 */
export function useBatchFavorites(listings: ListingCardData[]) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const accessToken = (session as any)?.accessToken;

  // Build targetKeys array
  const targetKeys = useMemo(
    () =>
      listings.map(
        (listing) => `${getListingTypeSlug(listing.listingType)}:${listing.id}`,
      ),
    [listings],
  );

  // Fetch batch favorites
  const { data: favoritesMap, isLoading } = useQuery({
    queryKey: favoritesKeys.batch(targetKeys),
    queryFn: () => {
      // If no session, read from localStorage
      if (!accessToken) {
        const anonymousFavorites = getAnonymousFavorites();
        const map: Record<string, boolean> = {};

        targetKeys.forEach((key) => {
          const [entity, idStr] = key.split(":");
          const id = parseInt(idStr, 10);
          map[key] = anonymousFavorites.some(
            (fav) => fav.entity === entity && fav.id === id,
          );
        });

        return map;
      }

      // If authenticated, use existing API
      return checkBatchFavorites(targetKeys, accessToken);
    },
    // Enable for both auth states (changed from !!accessToken)
    enabled: targetKeys.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Populate individual cache keys for useFavorites
  useEffect(() => {
    if (favoritesMap) {
      Object.entries(favoritesMap).forEach(([key, isFavorited]) => {
        // key is format "entity:id" (e.g. "locations:1")
        const [entity, idStr] = key.split(":");
        const id = parseInt(idStr, 10);
        
        // Populate the specific cache key used by useFavorites
        const individualKey = favoritesKeys.listing(entity, id);
        
        // Only set if not already in cache or if we want to ensure freshness
        // useFavorites uses staleTime: 10 mins. We should set it to fresh.
        queryClient.setQueryData(individualKey, isFavorited);
      });
    }
  }, [favoritesMap, queryClient]);

  // Enrich listings with favorite status
  const enrichedListings = useMemo(() => {
    return listings.map((listing) => {
      const targetKey = `${getListingTypeSlug(listing.listingType)}:${listing.id}`;
      return {
        ...listing,
        // Always set initialIsFavorited, use batch data if available, otherwise undefined
        // This ensures the property exists even before batch completes
        initialIsFavorited: favoritesMap?.[targetKey],
      };
    });
  }, [listings, favoritesMap]);

  return {
    listings: enrichedListings,
    isLoading,
  };
}
