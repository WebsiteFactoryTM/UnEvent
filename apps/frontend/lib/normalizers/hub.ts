import type {
  City,
  Event,
  HubSnapshot,
  ListingType as TaxType,
  Location,
  Media,
  Service,
} from "@/types/payload-types";
import type { Listing, ListingType, CardItem } from "@/types/listings";

/**
 * Transformed HubSnapshot type where `listingId` is converted to `id` for API responses.
 * This matches what the backend endpoint returns after transformation.
 */
export type HubSnapshotResponse = Omit<
  HubSnapshot,
  "featured" | "popularCityRows"
> & {
  featured?: Array<
    Omit<NonNullable<HubSnapshot["featured"]>[number], "listingId"> & {
      id: number;
    }
  > | null;
  popularCityRows?: Array<
    Omit<NonNullable<HubSnapshot["popularCityRows"]>[number], "items"> & {
      items?: Array<
        Omit<
          NonNullable<
            NonNullable<HubSnapshot["popularCityRows"]>[number]["items"]
          >[number],
          "listingId"
        > & { id: number }
      > | null;
    }
  > | null;
};

/**
 * Type helper for HubSnapshot items from API responses (which use `id` after transformation)
 */
export type HubSnapshotItem =
  | NonNullable<HubSnapshotResponse["featured"]>[number]
  | NonNullable<
      NonNullable<HubSnapshotResponse["popularCityRows"]>[number]["items"]
    >[number];

/**
 * Shape consumed by `ListingCard` across the app.
 * Anything rendering cards should normalize to this type first.
 */
export type ListingCardData = {
  id: number;
  title: string;
  slug: string;
  image: { url: string; alt: string };
  city: string;
  type: string;
  verified: boolean;
  rating?: { average: number; count: number };
  views: number;
  listingType: ListingType;
  capacity?: Location["capacity"] | null | undefined;
  priceRange?: string;
  date?: string;
  participants?: number;
  initialIsFavorited?: boolean;
  tier?: "new" | "standard" | "sponsored" | "recommended" | null | undefined;
  claimStatus?: "claimed" | "unclaimed" | null;
  description?: string;
  description_rich?: (Location | Event | Service)["description_rich"];
};

/**
 * Derive a human-readable type label string from a `type` relationship.
 * Mirrors the backend `toCardItem` logic (unique categories, max 3, joined by comma).
 */
function getTypeLabelFromRelation(rel: unknown, fallback: string): string {
  // If it's already a string (e.g. coming from CardItem), just return it
  if (typeof rel === "string") {
    return rel;
  }

  if (!Array.isArray(rel) || rel.length === 0) return fallback;

  const categories = [
    ...new Set(
      (rel as (number | TaxType)[])
        .map((t) =>
          typeof t === "object" && t && "category" in t
            ? (t as TaxType).category
            : null,
        )
        .filter((v): v is string => Boolean(v)),
    ),
  ];

  if (categories.length === 0) return fallback;

  return categories.slice(0, 3).join(", ");
}

function mediaToImage(
  m: number | Media | null | undefined,
  altFallback: string = "Imagine",
) {
  const media = typeof m === "object" ? (m as Media) : null;
  return {
    url: media?.url || "/placeholder.svg",
    alt: media?.alt || altFallback,
  };
}

/**
 * Helper to extract image from either:
 * - Raw Payload doc (has featuredImage as Media object)
 * - CardItem format (has imageUrl as string)
 */
function extractImage(
  listing: Partial<Location | Service | Event> & { imageUrl?: string },
  altFallback: string = "Imagine",
): { url: string; alt: string } {
  // If it's already in CardItem format (has imageUrl)
  if ("imageUrl" in listing && typeof listing.imageUrl === "string") {
    return {
      url: listing.imageUrl || "/placeholder.svg",
      alt: (listing.title as string) || altFallback,
    };
  }
  // Otherwise, it's a raw Payload doc (has featuredImage)
  return mediaToImage(
    (listing as Location | Service | Event).featuredImage,
    (listing.title as string) || altFallback,
  );
}

function cityToName(c?: number | City | null): string {
  return typeof c === "object" && c ? c.name : "România";
}

/**
 * Helper to extract city name from either:
 * - Raw Payload doc (has city as City object or number)
 * - CardItem format (has cityLabel as string)
 */
function extractCityName(
  listing: Partial<Location | Service | Event> & { cityLabel?: string },
): string {
  // If it's already in CardItem format (has cityLabel)
  if ("cityLabel" in listing && typeof listing.cityLabel === "string") {
    return listing.cityLabel || "România";
  }
  // Otherwise, it's a raw Payload doc (has city)
  return cityToName((listing as Location | Service | Event).city);
}

function normalizeLocationToCardData(
  listing: Partial<Location> & { type: string },
): ListingCardData {
  return {
    id: listing.id as number,
    title: listing.title as string,
    slug: listing.slug || String(listing.id),
    image: extractImage(listing, listing.title),
    city: extractCityName(listing),
    type: getTypeLabelFromRelation(listing.type, "Locație"),
    verified: listing.verifiedStatus === "approved",
    rating:
      typeof listing.rating === "number" &&
      typeof listing.reviewCount === "number"
        ? { average: listing.rating, count: listing.reviewCount }
        : undefined,
    views: listing.views || 0,
    listingType: "locatii",
    capacity: listing.capacity,
    priceRange: undefined,
    initialIsFavorited: listing.isFavoritedByViewer ?? undefined,
    tier: listing.tier,
    claimStatus: listing.claimStatus || undefined,
    description: listing.description || undefined,
    description_rich: listing.description_rich || undefined,
  };
}

function normalizeServiceToCardData(
  listing: Partial<Service> & { type: string },
): ListingCardData {
  return {
    id: listing.id as number,
    title: listing.title as string,
    slug: listing.slug || String(listing.id),
    image: extractImage(listing, listing.title),
    city: extractCityName(listing),
    type: getTypeLabelFromRelation(listing.type, "Serviciu"),
    verified: listing.verifiedStatus === "approved",
    rating:
      typeof listing.rating === "number" &&
      typeof listing.reviewCount === "number"
        ? { average: listing.rating, count: listing.reviewCount }
        : undefined,
    views: listing.views || 0,
    listingType: "servicii",
    priceRange: undefined,
    initialIsFavorited: listing.isFavoritedByViewer ?? undefined,
    tier: listing.tier,
    claimStatus: listing.claimStatus || undefined,
    description: listing.description || undefined,
    description_rich: listing.description_rich || undefined,
  };
}

function normalizeEventToCardData(
  listing: Partial<Event> & { type: string },
): ListingCardData {
  return {
    id: listing.id as number,
    title: listing.title as string,
    slug: listing.slug || String(listing.id),
    image: extractImage(listing, listing.title),
    city: extractCityName(listing),
    type: getTypeLabelFromRelation(listing.type, "Eveniment"),
    verified: listing.verifiedStatus === "approved",
    rating:
      typeof listing.rating === "number" &&
      typeof listing.reviewCount === "number"
        ? { average: listing.rating, count: listing.reviewCount }
        : undefined,
    views: listing.views || 0,
    listingType: "evenimente",
    date: listing.startDate ?? undefined,
    participants: listing.participants ?? undefined,
    initialIsFavorited: listing.isFavoritedByViewer ?? undefined,
    tier: listing.tier,
    claimStatus: listing.claimStatus || undefined,
    description: listing.description || undefined,
    description_rich: listing.description_rich || undefined,
  };
}

/**
 * High-level normalizer from a raw listing document to `ListingCardData`.
 * This is intentionally separate from `lib/transforms/normalizeListing` which only
 * adds the `status` alias to listing documents.
 */
export function toListingCardData(
  listingType: ListingType,
  listing: Listing,
): ListingCardData {
  if (listingType === "locatii")
    return normalizeLocationToCardData(
      listing as unknown as Partial<Location> & { type: string },
    );
  if (listingType === "servicii")
    return normalizeServiceToCardData(
      listing as unknown as Partial<Service> & { type: string },
    );
  return normalizeEventToCardData(
    listing as unknown as Partial<Event> & { type: string },
  );
}

/**
 * Convert CardItem (from feed/hub API) to ListingCardData format
 * Used by ArchiveGridView and Archive components
 *
 * Handles both `id` (from feed/home) and `listingId` (from HubSnapshot) for backwards compatibility
 */
export function cardItemToListingCardData(
  item: CardItem | HubSnapshotItem,
  entity: ListingType,
): ListingCardData {
  // Both CardItem and HubSnapshotItem now use `id` (HubSnapshotResponse transforms listingId to id)
  const id = item.id;

  // Convert capacity number to Location["capacity"] format
  let capacity: Location["capacity"] | null | undefined = undefined;
  const itemCapacity = "capacity" in item ? item.capacity : null;
  if (entity === "locatii" && itemCapacity && itemCapacity > 0) {
    capacity = { indoor: itemCapacity };
  }

  // Handle nullable fields from HubSnapshot
  const cityLabel = "cityLabel" in item ? (item.cityLabel ?? "") : "";
  const typeLabel = "type" in item ? (item.type ?? "") : "";
  const verified = "verified" in item ? Boolean(item.verified) : false;
  const ratingAvg = "ratingAvg" in item ? item.ratingAvg : undefined;
  const ratingCount = "ratingCount" in item ? item.ratingCount : undefined;
  const tier = "tier" in item ? item.tier : undefined;
  const description =
    "description" in item ? (item.description ?? undefined) : undefined;
  const description_rich =
    "description_rich" in item
      ? ((item.description_rich as
          | (Location | Event | Service)["description_rich"]
          | undefined) ?? undefined)
      : undefined;

  return {
    id,
    title: item.title,
    slug: item.slug,
    image: {
      url: item.imageUrl || "/placeholder.svg",
      alt: item.title,
    },
    city: cityLabel,
    type: typeLabel,
    verified,
    rating:
      ratingAvg !== undefined &&
      ratingAvg !== null &&
      ratingCount !== undefined &&
      ratingCount !== null
        ? { average: ratingAvg, count: ratingCount }
        : undefined,
    views: 0,
    listingType: entity,
    capacity,
    date: item.startDate ?? undefined,
    tier,
    description,
    description_rich,
  };
}
