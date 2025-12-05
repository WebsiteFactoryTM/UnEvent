"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { getOrCreateSessionId } from "@/lib/utils/sessionId";
import { metricsKeys } from "@/lib/cacheKeys";
import { useTracking } from "@/hooks/useTracking";

type ListingViewTrackerProps = {
  listingId: number;
  kind: "locations" | "events" | "services";
  listing?: any; // Full listing data for consent tracking
};

export function ListingViewTracker({
  listingId,
  kind,
  listing,
}: ListingViewTrackerProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { trackEvent } = useTracking();

  useEffect(() => {
    // Track backend metrics
    (async () => {
      try {
        const sessionId = getOrCreateSessionId();
        const userId = session?.user?.id ? String(session.user.id) : undefined;

        const response = await fetch("/api/public/metrics/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, kind, sessionId, userId }),
          keepalive: true,
        });

        if (response.ok) {
          // Invalidate metrics cache to refresh the displayed numbers
          queryClient.invalidateQueries({
            queryKey: metricsKeys.listing(kind, listingId),
          });
        }
      } catch (error) {
        console.error("Failed to send view metric", error);
      }
    })();

    // Track Google Analytics & Meta Pixel view if listing data available
    if (listing) {
      const listingTypeMap = {
        locations: "locatii",
        events: "evenimente",
        services: "servicii",
      } as const;

      const cityName =
        typeof listing.city === "object" ? listing.city?.name : undefined;
      const cityId =
        typeof listing.city === "object" ? listing.city?.id : listing.city;
      const ownerId =
        typeof listing.owner === "object" ? listing.owner?.id : listing.owner;
      const ownerSlug =
        typeof listing.owner === "object" ? listing.owner?.slug : undefined;

      trackEvent("viewContent", undefined, {
        listing_id: listingId,
        listing_type: listingTypeMap[kind],
        listing_slug: listing.slug,
        content_name: listing.title,
        content_category: listingTypeMap[kind],
        city_name: cityName,
        city_id: cityId as number,
        owner_id: ownerId,
        owner_slug: ownerSlug,
        value: listing.price?.amount || listing.price,
        currency: listing.price?.currency || "RON",
      });
    }
  }, [listingId, kind, session?.user?.id, queryClient, listing]);

  return null;
}
