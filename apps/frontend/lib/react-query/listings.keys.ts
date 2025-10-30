import { stableKey } from "./utils";

export const listingsKeys = {
  all: ["listings"] as const,
  _type: (type: string) => [...listingsKeys.all, type] as const,
  list: (ctx: string, type: string, filters?: unknown) =>
    [...listingsKeys._type(type), "list", ctx, stableKey(filters)] as const,
  detail: (type: string, id: number | string) =>
    [...listingsKeys._type(type), "detail", String(id)] as const,
  recommendations: (type: string, id: number | string) =>
    [...listingsKeys._type(type), "recommendations", String(id)] as const,
};
