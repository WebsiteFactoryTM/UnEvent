import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { constructMetadata } from "@/lib/metadata";
import { buildFeedFilters } from "@/lib/feed-helpers";

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
import { ArchiveSchema } from "@/components/archives/ArchiveSchema";
import { PaginationSEO } from "@/components/archives/PaginationSEO";
import ArchiveTitle from "@/components/archives/ArchiveTitle";

export const revalidate = 3600;
// export async function generateStaticParams() {
//   return listingTypes.flatMap((listingType) => cities.map((c) => ({ listingType, city: c.slug })))
// }

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ listingType: ListingType; city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { listingType, city } = await params;
  if (!listingTypes.includes(listingType)) {
    return constructMetadata({
      title: "Pagina nu a fost găsită",
      noIndex: true,
    });
  }

  const filters = buildFeedFilters({
    listingType,
    city,
    searchParams: await searchParams,
  });
  
  // Fetch feed items to verify content existence
  const feedData = await fetchFeed(filters);
  const hasItems = 
    (feedData?.pinnedSponsored && feedData.pinnedSponsored.length > 0) || 
    (feedData?.organic && feedData.organic.length > 0);
  
  // Use "noindex" if page is empty and no specific filters are active (clean hub page)
  // If filters are active, "noindex" is already handled by canonical/robots logic in constructMetadata if we want, 
  // but here we specifically want to de-index EMPTY hub pages.
  // The original code had `shouldIndex = !hasFilters`. 
  // We want: if clean URL (no filters) AND empty -> noindex.
  // If has filters -> noindex (as per original logic).
  
  const filterParams = [
    "priceMin",
    "priceMax",
    "capacityMin",
    "facilities",
    "facilitiesMode",
    "lat",
    "lng",
    "radius",
    "ratingMin",
    "type",
    "suitableFor",
    "limit",
  ];
  
  const searchFiltersObj = await searchParams;
  const hasFilters = Object.keys(searchFiltersObj || {}).some(
    (key) => filterParams.includes(key) && searchFiltersObj[key]
  );

  const shouldIndex = !hasFilters && hasItems;

  const listingLabel = getListingTypeLabel(listingType);
  const cityLabel = getCityLabel(city);
  const page = filters.page || 1;

  const baseUrl = `https://unevent.ro/${listingType}/oras/${city}`;
  const title = `Top ${listingLabel} ${listingType !== 'evenimente' ? 'Evenimente' : ''} în ${cityLabel}${
    page > 1 ? ` – Pagina ${page}` : ""
  } | UN:EVENT`;

  const description = `Găsește ${listingLabel.toLowerCase()} în ${cityLabel}. Vezi prețuri, recenzii și parteneri verificați. Compară și rezervă direct pe UN:EVENT`;

  const canonicalUrl = hasFilters
    ? baseUrl // Clean URL without any params
    : page > 1
      ? `${baseUrl}?page=${page}` // Self-canonical with page number
      : baseUrl; // Clean URL

  return constructMetadata({
    title,
    description,
    canonicalUrl,
    noIndex: !shouldIndex,
  });
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

  const baseUrl = `https://unevent.ro/${listingType}/oras/${city}`;

  if (!listingTypes.includes(listingType as any)) notFound();

  const cityLabel = getCityLabel(city);
  const listingLabel = getListingTypeLabel(listingType);

  const filters = buildFeedFilters({
    listingType,
    city,
    searchParams: searchFilters,
  });

  const page = filters.page || 1;
  const limit = filters.limit || 24;
  // Initialize React Query client
  const queryClient = getQueryClient();
  const feedData = await fetchFeed(filters);
  await queryClient.setQueryData(feedKeys.list(filters), feedData);

  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <PaginationSEO baseUrl={baseUrl} page={page} hasMore={feedData.hasMore} />
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
              <ArchiveTitle
                title={`Top ${listingLabel} pentru evenimente în ${cityLabel}`}
                subtitle={`Caută cele mai potrivite ${listingLabel.toLowerCase()} pentru evenimente în ${cityLabel}.`}
              />
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
        <ArchiveSchema
          listings={[
            ...(feedData?.pinnedSponsored || []),
            ...(feedData?.organic || []),
          ]}
          cityLabel={cityLabel}
          listingLabel={listingLabel}
        />
      </div>
    </>
  );
}
