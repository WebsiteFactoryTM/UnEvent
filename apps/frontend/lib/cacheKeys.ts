import { stableKey } from "./react-query/utils";

/**
 * 🧩 Reviews
 */
export const reviewsKeys = {
  all: ["reviews"] as const,
  listing: (type: string, id: number | string) =>
    ["reviews", type, id] as const,
  list: (
    type: string,
    id: number | string,
    opts: { page?: number; limit?: number; status?: string } = {},
  ) =>
    [
      ...reviewsKeys.listing(type, id),
      {
        page: opts.page ?? 1,
        limit: opts.limit ?? 10,
        status: opts.status ?? "approved",
      },
    ] as const,
  pending: (type: string, id: number | string) =>
    [...reviewsKeys.listing(type, id), "pending"] as const,
};

/**
 * 🏛 Listings
 */
export const listingsKeys = {
  all: ["listings"] as const,

  type: (type: string) => [...listingsKeys.all, type] as const,

  list: (ctx: string, type: string, filters?: unknown) =>
    [...listingsKeys.type(type), "list", ctx, stableKey(filters)] as const,

  detail: (type: string, id: number | string) =>
    [...listingsKeys.type(type), "detail", String(id)] as const,

  recommendations: (type: string, id: number | string) =>
    [...listingsKeys.type(type), "recommendations", String(id)] as const,

  similar: (type: string, id: number | string) =>
    [...listingsKeys.type(type), "similar", String(id)] as const,

  nearby: (type: string, id: number | string) =>
    [...listingsKeys.type(type), "nearby", String(id)] as const,

  userListings: (type: string, userId: string) =>
    [...listingsKeys.all, type, userId] as const,

  search: (filters: Record<string, unknown>) =>
    [...listingsKeys.all, "search", stableKey(filters)] as const,
};

/**
 * ❤️ Favorites
 */
export const favoritesKeys = {
  all: ["favorites"] as const,
  listing: (type: string, id: number | string) =>
    ["favorite", type, id] as const,
  userFavorites: (userId: string) =>
    [...favoritesKeys.all, "user", userId] as const,
};

/**
 * 🏠 Homepage
 */
export const homeKeys = {
  all: ["home"] as const,
  listings: () => ["home", "listings"] as const,
  recommended: () => ["home", "recommended"] as const,
  popular: () => ["home", "popular"] as const,
  latest: () => ["home", "latest"] as const,
};

/**
 * 👤 Users / Profiles
 */
export const usersKeys = {
  all: ["users"] as const,
  detail: (id: string) => ["users", id] as const,
  listings: (id: string) => ["users", id, "listings"] as const,
  reviews: (id: string) => ["users", id, "reviews"] as const,
};

/**
 * 👤 Profiles
 */
export const profileKeys = {
  all: ["profiles"] as const,
  detail: (id: string | number) => [...profileKeys.all, String(id)] as const,
};

/**
 * 📰 Feed
 */
export const feedKeys = {
  all: ["feed"] as const,

  entity: (entity: string) => [...feedKeys.all, entity] as const,

  city: (entity: string, city: string) =>
    [...feedKeys.entity(entity), city] as const,

  list: (filters: Record<string, unknown>) =>
    [...feedKeys.all, "list", stableKey(filters)] as const,
};

export const taxonomiesKeys = {
  all: ["taxonomies"] as const,
  list: (filters: Record<string, unknown>) =>
    [...taxonomiesKeys.all, "list", stableKey(filters)] as const,
};

export const citiesKeys = {
  all: ["cities"] as const,
  list: (filters: Record<string, unknown>) =>
    [...citiesKeys.all, "list", stableKey(filters)] as const,
};
