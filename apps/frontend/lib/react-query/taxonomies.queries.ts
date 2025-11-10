"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTaxonomies } from "../api/taxonomies";
import { cacheTTL } from "../constants";
import { taxonomiesKeys } from "../cacheKeys";

/**
 * React Query hook for fetching taxonomies (cities, listing types, facilities)
 * Cached for 1 day on the client side (also cached server-side via Redis)
 */
export function useTaxonomies({
  fullList = false,
}: { fullList?: boolean } = {}) {
  return useQuery({
    queryKey: taxonomiesKeys.list({ fullList }),
    queryFn: () => fetchTaxonomies({ fullList }),
    staleTime: cacheTTL.oneDay,
  });
}
