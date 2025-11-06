import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArchiveFilter } from "@/components/archives/ArchiveFilter";
import { AddListingButton } from "@/components/archives/AddListingButton";
import { ListingBreadcrumbs } from "@/components/listing/shared/ListingBreadcrumbs";
import { getQueryClient } from "@/lib/react-query";
import { FeedQuery, fetchFeed } from "@/lib/api/feed";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import CityArchive from "@/components/archives/Archive";
import { feedKeys } from "@/lib/cacheKeys";
import {
  getCityLabel,
  getListingTypeLabel,
  listingTypes,
} from "@/config/archives";
import { ListingType } from "@/types/listings";
import { getListingTypeSlug } from "@/lib/getListingType";

export const revalidate = 3600; // ISR: revalidate every hour

// export async function generateStaticParams() {
//   return listingTypes.flatMap((listingType) => cities.map((c) => ({ listingType, city: c.slug })))
// }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listingType: string; city: string }>;
}): Promise<Metadata> {
  const { listingType, city } = await params;
  const listingLabel = getListingTypeLabel(listingType);
  const cityLabel = getCityLabel(city);

  return {
    title: `Top ${listingLabel} ${cityLabel} | UN:EVENT`,
    description: `Descoperă cele mai bune ${listingLabel.toLowerCase()} din ${cityLabel}.`,
  };
}

export default async function CityArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ listingType: ListingType; city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { listingType, city } = await params;
  const searchFilters = await searchParams;
  if (!listingTypes.includes(listingType as any)) notFound();

  const cityLabel = getCityLabel(city);
  const listingLabel = getListingTypeLabel(listingType);

  const page = (() => {
    const pageValue = Number(searchFilters?.page || 1);
    return isNaN(pageValue) ? 1 : pageValue;
  })();

  const limit = (() => {
    const limitValue = Number(searchFilters?.limit || 24);
    return isNaN(limitValue) ? 24 : limitValue;
  })();

  const filters: FeedQuery = {
    entity: getListingTypeSlug(listingType),
    city,
    page,
    limit,
    type: searchFilters?.type as string | undefined,
    suitableFor: searchFilters?.suitableFor as string | undefined,
    ratingMin: searchFilters?.ratingMin
      ? Number(searchFilters.ratingMin)
      : undefined,
    priceMin: searchFilters?.priceMin
      ? Number(searchFilters.priceMin)
      : undefined,
    priceMax: searchFilters?.priceMax
      ? Number(searchFilters.priceMax)
      : undefined,
    capacityMin: searchFilters?.capacityMin
      ? Number(searchFilters.capacityMin)
      : undefined,
    facilitiesMode: (searchFilters?.facilitiesMode as "all" | "any") ?? "all",
    facilities: searchFilters?.facilities as string | undefined,
    lat: searchFilters?.lat ? Number(searchFilters.lat) : undefined,
    lng: searchFilters?.lng ? Number(searchFilters.lng) : undefined,
    radius: searchFilters?.radius ? Number(searchFilters.radius) : undefined,
  };
  // Initialize React Query client
  const queryClient = getQueryClient();

  // Pre-fetch first page for SSG/ISR
  await queryClient.prefetchQuery({
    queryKey: feedKeys.list(filters),
    queryFn: () => fetchFeed(filters),
  });
  const dehydratedState = dehydrate(queryClient);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Breadcrumbs */}
          <ListingBreadcrumbs
            type={listingType as ListingType}
            cityName={cityLabel}
            citySlug={city}
          />

          {/* Header with add button */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-4 flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-balance">
                Top {listingLabel} {cityLabel}
              </h1>
              <p className="text-lg text-muted-foreground text-pretty">
                Caută cele mai potrivite {listingLabel.toLowerCase()} în{" "}
                {cityLabel}.
              </p>
            </div>
            <AddListingButton listingType={listingType as any} />
          </div>

          <ArchiveFilter listingType={listingType as any} />

          {/* Client-side component */}
          <HydrationBoundary state={dehydratedState}>
            <CityArchive
              entity={listingType as ListingType}
              city={city}
              initialPage={page}
              initialLimit={limit}
              initialFilters={filters}
            />
          </HydrationBoundary>
        </div>
      </div>
    </div>
  );
}
