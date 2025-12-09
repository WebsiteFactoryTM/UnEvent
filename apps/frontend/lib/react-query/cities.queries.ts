import { useQuery } from "@tanstack/react-query";
import { getCities, getCityBySlug, UseCitiesProps } from "../api/cities";
import { citiesKeys } from "../cacheKeys";

export interface City {
  id: string;
  name: string;
  county?: string;
  country?: string;
  geo?: [number, number];
  slug?: string;
  verified?: boolean;
  featured?: boolean;
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
  params.set("select[featured]", "true");
  if (!search && popularFallback) {
    params.set("where[featured][equals]", "true");
    params.set("sort", "name");
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
  return useQuery({
    queryKey: citiesKeys.list({
      search,
      limit,
      verifiedOnly,
      popularFallback,
    }),
    queryFn: async () => {
      return getCities({ search, limit, verifiedOnly, popularFallback });
    },
    enabled: enabled && (!!search || popularFallback),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useCityBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: citiesKeys.detail(slug),
    queryFn: () => getCityBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 1000 * 60 * 60, // 1 hour - city coordinates don't change often
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
