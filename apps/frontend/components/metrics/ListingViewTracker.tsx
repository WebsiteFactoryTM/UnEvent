"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { getOrCreateSessionId } from "@/lib/utils/sessionId";
import { metricsKeys } from "@/lib/cacheKeys";

type ListingViewTrackerProps = {
  listingId: number;
  kind: "locations" | "events" | "services";
};

export function ListingViewTracker({
  listingId,
  kind,
}: ListingViewTrackerProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
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
  }, [listingId, kind, session?.user?.id, queryClient]);

  return null;
}
