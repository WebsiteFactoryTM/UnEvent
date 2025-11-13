import { useQuery } from "@tanstack/react-query";
import { getCities, UseCitiesProps } from "../api/cities";
import { citiesKeys } from "../cacheKeys";

export interface City {
  id: string;
  name: string;
  county?: string;
  country?: string;
  geo?: [number, number];
  slug?: string;
  verified?: boolean;
  usageCount?: number;
}

export function buildCitySearchParams({
  search,
  limit = 20,
  verifiedOnly,
  popularFallback,
}: Pick<
  UseCitiesProps,
  "search" | "limit" | "verifiedOnly" | "popularFallback"
>) {
  const params = new URLSearchParams();
  params.set("select[id]", "true");
  params.set("select[name]", "true");
  params.set("select[county]", "true");
  params.set("select[slug]", "true");
  params.set("select[geo]", "true");
  params.set("select[usageCount]", "true");
  if (!search && popularFallback) {
    params.set("sort", "-usageCount");
    params.set("limit", String(limit));
    if (verifiedOnly) params.set("where[verified][equals]", "true");
    return params;
  }
  if (search) params.set("where[name][like]", search);
  if (verifiedOnly) params.set("where[verified][equals]", "true");
  params.set("limit", String(limit));
  params.set("sort", "name");
  return params;
}

export function useCities({
  search = "",
  limit = 20,
  verifiedOnly = false,
  popularFallback = true,
  enabled = true,
}: UseCitiesProps) {
  const params = buildCitySearchParams({
    search,
    limit,
    verifiedOnly,
    popularFallback,
  });
  return useQuery({
    queryKey: citiesKeys.list({
      url: `${new URL("/api/cities", process.env.NEXT_PUBLIC_API_URL).toString()}?${params.toString()}`,
    }),
    queryFn: async () => {
      return getCities({ search, limit, verifiedOnly, popularFallback });
    },
    enabled: enabled && (!!search || popularFallback),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
