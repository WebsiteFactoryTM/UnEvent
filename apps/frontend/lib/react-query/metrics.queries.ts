import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { metricsKeys } from "../cacheKeys";
import { fetchListingMetrics, type MetricsData } from "../api/metrics";

type ListingKind = "locations" | "events" | "services";

export function useListingMetrics(listingId: number, kind: ListingKind) {
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;

  return useQuery<MetricsData>({
    queryKey: metricsKeys.listing(kind, listingId),
    queryFn: () => fetchListingMetrics(listingId, kind, accessToken),
    enabled: !!accessToken && !!listingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
