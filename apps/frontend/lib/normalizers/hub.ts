import type {
  City,
  Event,
  ListingType as TaxType,
  Location,
  Media,
  Service,
} from "@/types/payload-types";
import type { Listing, ListingType } from "@/types/listings";

export type ListingCardData = {
  id: number;
  title: string;
  slug: string;
  description: string;
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
};

function getTypeLabelFromRelation(
  rel: (number | TaxType)[] | null | undefined,
  fallback: string,
): string {
  if (!Array.isArray(rel) || rel.length === 0) return fallback;
  const first = rel[0];
  if (typeof first === "object" && first && "title" in first)
    return (first as TaxType).title;
  return fallback;
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

export function normalizeLocation(listing: Location): ListingCardData {
  return {
    id: listing.id,
    title: listing.title,
    slug: listing.slug || String(listing.id),
    description: listing.description || "",
    image: mediaToImage(listing.featuredImage, listing.title),
    city: cityToName(listing.city),
    type: getTypeLabelFromRelation(listing.type, "Locație"),
    verified: listing.status === "approved",
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
  };
}

export function normalizeService(listing: Service): ListingCardData {
  return {
    id: listing.id,
    title: listing.title,
    slug: listing.slug || String(listing.id),
    description: listing.description || "",
    image: mediaToImage(listing.featuredImage, listing.title),
    city: cityToName(listing.city),
    type: getTypeLabelFromRelation(listing.type, "Serviciu"),
    verified: listing.status === "approved",
    rating:
      typeof listing.rating === "number" &&
      typeof listing.reviewCount === "number"
        ? { average: listing.rating, count: listing.reviewCount }
        : undefined,
    views: listing.views || 0,
    listingType: "servicii",
    priceRange: undefined,
    initialIsFavorited: listing.isFavoritedByViewer ?? undefined,
  };
}

export function normalizeEvent(listing: Event): ListingCardData {
  return {
    id: listing.id,
    title: listing.title,
    slug: listing.slug || String(listing.id),
    description: listing.description || "",
    image: mediaToImage(listing.featuredImage, listing.title),
    city: cityToName(listing.city),
    type: getTypeLabelFromRelation(listing.type, "Eveniment"),
    verified: listing.status === "approved",
    rating:
      typeof listing.rating === "number" &&
      typeof listing.reviewCount === "number"
        ? { average: listing.rating, count: listing.reviewCount }
        : undefined,
    views: listing.views || 0,
    listingType: "evenimente",
    date: listing.startDate,
    participants: listing.participants ?? undefined,
    initialIsFavorited: listing.isFavoritedByViewer ?? undefined,
  };
}

export function normalizeListing(
  listingType: ListingType,
  listing: Listing,
): ListingCardData {
  if (listingType === "locatii") return normalizeLocation(listing as Location);
  if (listingType === "servicii") return normalizeService(listing as Service);
  return normalizeEvent(listing as Event);
}
