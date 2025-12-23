"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { metricsKeys } from "@/lib/cacheKeys";

type UseImpressionOptions = {
  listingId: number;
  kind: "locations" | "events" | "services";
};

export function useImpression({ listingId, kind }: UseImpressionOptions) {
  const hasSentRef = useRef(false);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasSentRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasSentRef.current) {
            // Check session-level deduplication (prevent duplicate impressions per session)
            const dedupeKey = `unevent:impression:${kind}:${listingId}`;

            try {
              const lastSentAt = Number(sessionStorage.getItem(dedupeKey) || 0);
              // Don't send if impression was sent in last 30 minutes
              if (Date.now() - lastSentAt < 1000 * 60 * 30) {
                hasSentRef.current = true;
                observer.disconnect();
                return;
              }
            } catch {
              // ignore sessionStorage errors (private browsing, etc.)
            }

            hasSentRef.current = true;
            (async () => {
              try {
                const response = await fetch("/api/public/metrics/impression", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ listingId, kind }),
                  keepalive: true,
                });

                if (response.ok) {
                  // Mark as sent in sessionStorage to prevent duplicates
                  try {
                    sessionStorage.setItem(dedupeKey, String(Date.now()));
                  } catch {
                    // ignore sessionStorage errors
                  }

                  // Invalidate metrics cache to refresh the displayed numbers
                  queryClient.invalidateQueries({
                    queryKey: metricsKeys.listing(kind, listingId),
                  });
                }
              } catch (error) {
                console.error("Failed to send impression", error);
              }
            })();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }, // require ~50% of card in viewport
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [listingId, kind, queryClient]);

  return elementRef;
}
