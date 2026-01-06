import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { constructMetadata } from "@/lib/metadata";
import { buildFeedFilters } from "@/lib/feed-helpers";

import { ArchiveFilter } from "@/components/archives/ArchiveFilter";
import { AddListingButton } from "@/components/archives/AddListingButton";
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
import { fetchTaxonomies } from "@/lib/api/taxonomies";
import { ListingType as PayloadListingType } from "@/types/payload-types";
import { ListingBreadcrumbs } from "@/components/listing/shared/ListingBreadcrumbs";
import ArchiveTitle from "@/components/archives/ArchiveTitle";

export const revalidate = 3600;

function getTypesFromTaxonomies(
  listingType: string,
  taxonomies: {
    eventTypes: PayloadListingType[];
    locationTypes: PayloadListingType[];
    serviceTypes: PayloadListingType[];
  },
) {
  if (listingType === "locatii") return taxonomies.locationTypes;
  if (listingType === "servicii") return taxonomies.serviceTypes;
  if (listingType === "evenimente") return taxonomies.eventTypes;
  return [];
}

function constructTitleBasedOnType(
  listingType: string,
  cityLabel: string,
  categoryLabel: string,
) {
  let title;
  let description;
  switch (listingType) {
    case "locatii":
      title = `Top locații ${categoryLabel} în ${cityLabel} | UN:EVENT`;
      description = `Cauți locații pentru ${categoryLabel.toLowerCase()} în ${cityLabel}? Vezi lista celor mai bune locații pentru evenimente și rezervă direct.`;
      break;
    case "servicii":
      title = `${categoryLabel} în ${cityLabel} | UN:EVENT`;
      description = `Cauți servicii pentru ${categoryLabel.toLowerCase()} în ${cityLabel}? Vezi lista celor mai bune servicii pentru evenimente și contactază direct.`;
      break;
    case "evenimente":
      title = `${categoryLabel} în ${cityLabel} | UN:EVENT`;
      description = `Descriere: Cauți ${categoryLabel.toLowerCase()} în ${cityLabel}? Vezi lista celor mai populare evenimente și rezervă direct.`;
      break;
  }
  return { title, description };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ listingType: string; city: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { listingType, city, category } = await params;

  const filters = buildFeedFilters({
    listingType,
    city,
    category,
    searchParams: await searchParams,
  });

  const feedData = await fetchFeed(filters);
  const hasItems =
    (feedData?.pinnedSponsored && feedData.pinnedSponsored.length > 0) ||
    (feedData?.organic && feedData.organic.length > 0);

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
    (key) => filterParams.includes(key) && searchFiltersObj[key],
  );

  const shouldIndex = !hasFilters && hasItems;

  const page = filters.page || 1;

  const taxonomies = await fetchTaxonomies({ fullList: true });
  const types = getTypesFromTaxonomies(listingType, taxonomies);
  const categoryLabel =
    types.find((t) => t.categorySlug === category)?.category ||
    category.charAt(0).toUpperCase() + category.slice(1);

  const cityLabel = getCityLabel(city);

  const baseUrl = `https://unevent.ro/${listingType}/oras/${city}/${category}`;
  const { title, description } = constructTitleBasedOnType(
    listingType,
    cityLabel,
    categoryLabel,
  );

  const canonicalUrl = hasFilters
    ? baseUrl
    : page > 1
      ? `${baseUrl}?page=${page}`
      : baseUrl;

  return constructMetadata({
    title,
    description,
    canonicalUrl,
    noIndex: !shouldIndex,
  });
}

export default async function CityCategoryArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ listingType: string; city: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { listingType, city, category } = await params;
  const searchFilters = await searchParams;

  const baseUrl = `https://unevent.ro/${listingType}/oras/${city}/${category}`;

  if (!listingTypes.includes(listingType as any)) notFound();

  const cityLabel = getCityLabel(city);
  const listingLabel = getListingTypeLabel(listingType);

  const taxonomies = await fetchTaxonomies({ fullList: true });
  const types = getTypesFromTaxonomies(listingType, taxonomies);
  const categoryLabel =
    types.find((t) => t.categorySlug === category)?.category ||
    category.charAt(0).toUpperCase() + category.slice(1);

  const filters = buildFeedFilters({
    listingType,
    city,
    category,
    searchParams: searchFilters,
  });

  const page = filters.page || 1;
  const limit = filters.limit || 24;

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
            <ListingBreadcrumbs
              type={listingType as ListingType}
              cityName={cityLabel.split(" ")[0]}
              citySlug={city}
              categoryName={categoryLabel}
              categorySlug={category}
            />

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <ArchiveTitle
                title={`Top ${listingLabel} pentru evenimente de ${categoryLabel} în ${cityLabel}`}
                subtitle={`Descoperă cele mai bune ${listingLabel.toLowerCase()} de ${categoryLabel.toLowerCase()} din ${cityLabel}.`}
              />
              <AddListingButton listingType={listingType as any} />
            </div>

            <ArchiveFilter listingType={listingType as any} />

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
          listingLabel={`${listingLabel} - ${categoryLabel}`}
        />
      </div>
    </>
  );
}
