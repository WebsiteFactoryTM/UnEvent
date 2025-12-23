"use client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { checkBatchFavorites } from "@/lib/api/favorites";
import { favoritesKeys } from "@/lib/cacheKeys";
import { useMemo } from "react";
import { ListingCardData } from "@/lib/normalizers/hub";
import { getListingTypeSlug } from "@/lib/getListingType";
import { getAnonymousFavorites } from "@/lib/favorites/localStorage";

/**
 * Hook to batch-fetch favorite status for multiple listings
 * Returns enriched listings with initialIsFavorited populated
 */
export function useBatchFavorites(listings: ListingCardData[]) {
  const { data: session } = useSession();
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

  // Enrich listings with favorite status
  const enrichedListings = useMemo(() => {
    if (!favoritesMap) return listings;

    return listings.map((listing) => {
      const targetKey = `${getListingTypeSlug(listing.listingType)}:${listing.id}`;
      return {
        ...listing,
        initialIsFavorited: favoritesMap[targetKey] ?? false,
      };
    });
  }, [listings, favoritesMap]);

  return {
    listings: enrichedListings,
    isLoading,
  };
}
