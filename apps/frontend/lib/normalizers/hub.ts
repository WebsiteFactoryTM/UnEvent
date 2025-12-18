import type {
  City,
  Event,
  ListingType as TaxType,
  Location,
  Media,
  Service,
} from "@/types/payload-types";
import type { Listing, ListingType, CardItem } from "@/types/listings";

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

function cityToName(c?: number | City | null): string {
  return typeof c === "object" && c ? c.name : "România";
}

function normalizeLocationToCardData(
  listing: Partial<Location> & { type: string },
): ListingCardData {
  return {
    id: listing.id as number,
    title: listing.title as string,
    slug: listing.slug || String(listing.id),
    image: mediaToImage(listing.featuredImage, listing.title),
    city: cityToName(listing.city),
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
    image: mediaToImage(listing.featuredImage, listing.title),
    city: cityToName(listing.city),
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
    image: mediaToImage(listing.featuredImage, listing.title),
    city: cityToName(listing.city),
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
 */
export function cardItemToListingCardData(
  item: CardItem,
  entity: ListingType,
): ListingCardData {
  // Convert capacity number to Location["capacity"] format
  let capacity: Location["capacity"] | null | undefined = undefined;
  if (entity === "locatii" && item.capacity > 0) {
    capacity = { indoor: item.capacity };
  }

  return {
    id: item.listingId,
    title: item.title,
    slug: item.slug,
    image: {
      url: item.imageUrl || "/placeholder.svg",
      alt: item.title,
    },
    city: item.cityLabel,
    type: item.type,
    verified: item.verified,
    rating:
      item.ratingAvg !== undefined && item.ratingCount !== undefined
        ? { average: item.ratingAvg, count: item.ratingCount }
        : undefined,
    views: 0,
    listingType: entity,
    capacity,
    date: item.startDate,
    tier: item.tier,
  };
}

export function toCardItem(
  listingType: "locations" | "services" | "events",
  doc: Location | Service | Event,
  options?: { includeGeo?: boolean },
): {
  id: number;
  slug: string;
  title: string;
  cityLabel: string;
  imageUrl: string | undefined;
  verified: boolean;
  ratingAvg: number | undefined;
  ratingCount: number | undefined;
  type: string;
  startDate: string | undefined;
  capacity: number;
  tier: "new" | "standard" | "sponsored" | "recommended" | null | undefined;
  description?: string | null;
  description_rich?: unknown;
  geo?: [number, number] | null | undefined;
} {
  let capacity = 0;
  if (listingType === "locations") {
    capacity = (doc as Location)?.capacity?.indoor ?? 0;
  } else if (listingType === "events") {
    capacity = (doc as Event)?.capacity?.total ?? 0;
  }
  return {
    id: doc.id,
    slug: doc.slug as string,
    title: doc.title as string,
    cityLabel: (doc.city as City)?.name ?? "",
    imageUrl: getImageURL(doc),
    verified: doc.verifiedStatus === "approved",
    ratingAvg: doc.rating as number | undefined,
    ratingCount: doc.reviewCount as number | undefined,
    type:
      [
        ...new Set(
          doc.type?.map((t: number | TaxType) => (t as TaxType).category),
        ),
      ]
        .slice(0, 3)
        .join(", ") ?? "",
    startDate: ((doc as Event)?.startDate as string | undefined) || undefined,
    capacity: capacity,
    tier: doc.tier,
    description: (doc as Location | Service | Event)?.description ?? null,
    description_rich:
      (doc as Location | Service | Event)?.description_rich ?? null,
    // Include geo only if requested (for feedEndpoint, not for buildHubSnapshot)
    ...(options?.includeGeo && {
      geo: doc.geo ? [doc.geo[0], doc.geo[1]] : null,
    }),
  };
}

/**
 * Helper to extract image URL from listing document
 * Prefers featuredImage, falls back to first gallery image
 */
export function getImageURL(
  doc: Location | Service | Event,
): string | undefined {
  // Prefer featuredImage.url; fallback to first gallery image; adjust to your schema
  const file =
    doc.featuredImage ?? (doc.gallery?.[0] as number | Media | undefined);
  if (!file) return undefined;
  // When depth:0, uploads are IDs; if you store full URL on create, use that.
  return typeof file === "number"
    ? undefined
    : ((file.url ?? undefined) as string | undefined);
}
