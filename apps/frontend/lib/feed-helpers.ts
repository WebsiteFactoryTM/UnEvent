import { FeedQuery } from "@/lib/api/feed";
import { getListingTypeSlug } from "@/lib/getListingType";
import { ListingType } from "@/types/listings";

interface BuildFeedFiltersParams {
  listingType: string;
  city: string;
  category?: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

export function buildFeedFilters({
  listingType,
  city,
  category,
  searchParams,
}: BuildFeedFiltersParams): FeedQuery {
  const page = Number(searchParams?.page || 1);
  const limit = Number(searchParams?.limit || 24);

  return {
    entity: getListingTypeSlug(listingType as ListingType),
    city,
    page: isNaN(page) ? 1 : page,
    limit: isNaN(limit) ? 24 : limit,
    typeCategory: category,
    type: searchParams?.type as string | undefined,
    suitableFor: searchParams?.suitableFor as string | undefined,
    ratingMin: searchParams?.ratingMin
      ? Number(searchParams.ratingMin)
      : undefined,
    priceMin: searchParams?.priceMin
      ? Number(searchParams.priceMin)
      : undefined,
    priceMax: searchParams?.priceMax
      ? Number(searchParams.priceMax)
      : undefined,
    capacityMin: searchParams?.capacityMin
      ? Number(searchParams.capacityMin)
      : undefined,
    facilitiesMode: (searchParams?.facilitiesMode as "all" | "any") ?? "all",
    facilities: searchParams?.facilities as string | undefined,
    lat: searchParams?.lat ? Number(searchParams.lat) : undefined,
    lng: searchParams?.lng ? Number(searchParams.lng) : undefined,
    radius: searchParams?.radius ? Number(searchParams.radius) : undefined,
  };
}
