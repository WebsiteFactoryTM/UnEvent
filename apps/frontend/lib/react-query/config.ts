import { QueryClient, type DefaultOptions } from "@tanstack/react-query";
import { cache } from "react";

export const defaultQueryClientOptions: DefaultOptions = {
  queries: {
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  },
  mutations: { retry: 0 },
};

export function createQueryClient() {
  return new QueryClient({ defaultOptions: defaultQueryClientOptions });
}

export const getQueryClient = cache(createQueryClient);
