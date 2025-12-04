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
import { ArchiveSchema } from "@/components/archives/ArchiveSchema";
import { PaginationSEO } from "@/components/archives/PaginationSEO";

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
  const searchFilters = await searchParams;
  const page = Number(searchFilters?.page ?? 1);

  const listingLabel = getListingTypeLabel(listingType);
  const cityLabel = getCityLabel(city);

  const baseUrl = `https://unevent.ro/${listingType}/oras/${city}`;
  const title = `Top ${listingLabel} ${cityLabel}${
    page > 1 ? ` – Pagina ${page}` : ""
  } | UN:EVENT`;
  const description = `Descoperă cele mai bune ${listingLabel.toLowerCase()} din ${cityLabel}. Compară locații, servicii și evenimente verificate.`;

  // Smart Canonical Logic
  // Filter params (these indicate filtered results, not unique pages)
  const filterParams = ['priceMin', 'priceMax', 'capacityMin', 'facilities', 
                        'facilitiesMode', 'lat', 'lng', 'radius', 'ratingMin', 
                        'type', 'suitableFor', 'limit'];
  
  // Check if any filter params exist (excluding 'page')
  const hasFilters = Object.keys(searchFilters || {}).some(
    key => filterParams.includes(key) && searchFilters[key]
  );

  // Canonical URL logic:
  // - If filters applied → point to clean URL (no params)
  // - If only page param → self-canonical with page (page 2 is unique content)
  // - If no params → self-canonical
  const canonicalUrl = hasFilters 
    ? baseUrl // Clean URL without any params
    : page > 1 
      ? `${baseUrl}?page=${page}` // Self-canonical with page number
      : baseUrl; // Clean URL

  // Robots meta: noindex filtered pages to prevent duplicate content
  const shouldIndex = !hasFilters;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
      },
    },
    openGraph: {
      title,
      description,
      url: baseUrl, // OG always uses clean URL
      siteName: "UN:EVENT",
      type: "website",
      locale: "ro_RO",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
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

  const baseUrl = `https://unevent.ro/${listingType}/oras/${city}`;

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
