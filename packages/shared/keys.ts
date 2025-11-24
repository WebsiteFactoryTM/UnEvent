export type ListingType = "events" | "locations" | "services";

export const tag = {
  tenant: (t: string) => `tenant:${t}`,
  collection: (t: ListingType) => `collection:${t}`,
  listingSlug: (slug: string) => `listing:slug:${slug}`,
  city: (slugOrId: string) => `city:${slugOrId}`,
  taxonomies: () => "taxonomies",
  top: (t: ListingType) => `top:${t}`,
  featured: (t: ListingType) => `featured:${t}`,
  similar: (t: ListingType) => `similar:${t}`,
  hubSnapshot: (t: ListingType | "locations" | "services" | "events") =>
    `hub:snapshot:${t}`,
  hubAny: () => "hub:any",
  homeSnapshot: () => "home:snapshot",
  home: () => "home", // legacy broad tag if needed
} as const;

export function normalize(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)),
  );
}
