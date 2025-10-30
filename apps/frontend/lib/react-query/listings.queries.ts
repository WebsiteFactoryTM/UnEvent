import { useQuery } from "@tanstack/react-query";
import { listingsKeys } from "./listings.keys";
import { fetchJson } from "./utils";

export function useListings(
  ctx: string,
  type: string,
  filters?: Record<string, any>,
) {
  return useQuery({
    queryKey: listingsKeys.list(ctx, type, filters),
    queryFn: async () => {
      const qs = new URLSearchParams(filters || {}).toString();
      return fetchJson(`${process.env.NEXT_PUBLIC_API_URL}/api/${type}?${qs}`);
    },
  });
}

export function useListingDetail(type: string, id: number | string) {
  return useQuery({
    queryKey: listingsKeys.detail(type, id),
    queryFn: async () =>
      fetchJson(`${process.env.NEXT_PUBLIC_API_URL}/api/${type}/${id}`),
  });
}
