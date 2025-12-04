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
