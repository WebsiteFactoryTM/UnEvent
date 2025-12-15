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
    if (session === undefined) {
      return;
    }

    const dedupeKey = `unevent:view:${kind}:${listingId}`;

    try {
      const lastSentAt = Number(sessionStorage.getItem(dedupeKey) || 0);
      if (Date.now() - lastSentAt < 1000 * 60 * 30) {
        return;
      }
    } catch {
      // ignore sessionStorage errors
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    (async () => {
      try {
        const sessionId = getOrCreateSessionId();
        const userId = session?.user?.id ? String(session.user.id) : undefined;

        if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
          const payload = JSON.stringify({
            listingId,
            kind,
            sessionId,
            userId,
          });
          const blob = new Blob([payload], { type: "application/json" });
          const ok = navigator.sendBeacon("/api/public/metrics/view", blob);
          if (ok) {
            try {
              sessionStorage.setItem(dedupeKey, String(Date.now()));
            } catch {
              // ignore sessionStorage errors
            }
            timeoutId = setTimeout(() => {
              queryClient.invalidateQueries({
                queryKey: metricsKeys.listing(kind, listingId),
              });
            }, 2000);
            return;
          }
        }

        const response = await fetch("/api/public/metrics/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, kind, sessionId, userId }),
          keepalive: true,
        });

        if (response.ok) {
          try {
            sessionStorage.setItem(dedupeKey, String(Date.now()));
          } catch {
            // ignore sessionStorage errors
          }
          timeoutId = setTimeout(() => {
            queryClient.invalidateQueries({
              queryKey: metricsKeys.listing(kind, listingId),
            });
          }, 2000);
        }
      } catch (error) {
        console.error("Failed to send view metric", error);
      }
    })();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [listingId, kind, session?.user?.id]);

  useEffect(() => {
    if (!listing) return;

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
  }, [listingId, kind, listing, trackEvent]);

  return null;
}
