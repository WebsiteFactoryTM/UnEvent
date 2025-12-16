import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ listingType: string; city: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { listingType, city, category } = await params;
  const searchFilters = await searchParams;
  const page = Number(searchFilters?.page ?? 1);

  const taxonomies = await fetchTaxonomies({ fullList: true });
  const types = getTypesFromTaxonomies(listingType, taxonomies);
  const categoryLabel =
    types.find((t) => t.categorySlug === category)?.category ||
    category.charAt(0).toUpperCase() + category.slice(1);

  const listingLabel = getListingTypeLabel(listingType);
  const cityLabel = getCityLabel(city);

  const baseUrl = `https://unevent.ro/${listingType}/oras/${city}/${category}`;
  const title = `Top ${listingLabel} de ${categoryLabel} ${cityLabel}${
    page > 1 ? ` – Pagina ${page}` : ""
  } | UN:EVENT`;
  const description = `Descoperă cele mai bune ${listingLabel.toLowerCase()} de ${categoryLabel.toLowerCase()} din ${cityLabel}.`;

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

  const hasFilters = Object.keys(searchFilters || {}).some(
    (key) => filterParams.includes(key) && searchFilters[key],
  );

  const canonicalUrl = hasFilters
    ? baseUrl
    : page > 1
      ? `${baseUrl}?page=${page}`
      : baseUrl;

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
      url: baseUrl,
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

  const page = (() => {
    const pageValue = Number(searchFilters?.page || 1);
    return isNaN(pageValue) ? 1 : pageValue;
  })();

  const limit = (() => {
    const limitValue = Number(searchFilters?.limit || 24);
    return isNaN(limitValue) ? 24 : limitValue;
  })();

  const filters: FeedQuery = {
    entity: getListingTypeSlug(listingType as ListingType),
    city,
    page,
    limit,
    typeCategory: category,
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
            <nav className="text-sm text-muted-foreground">
              <ol className="flex items-center gap-2">
                <li>
                  <a href="/" className="hover:text-foreground">
                    Acasă
                  </a>
                </li>
                <li>/</li>
                <li>
                  <a href={`/${listingType}`} className="hover:text-foreground">
                    {listingLabel}
                  </a>
                </li>
                <li>/</li>
                <li>
                  <a
                    href={`/${listingType}/oras/${city}`}
                    className="hover:text-foreground"
                  >
                    {cityLabel}
                  </a>
                </li>
                <li>/</li>
                <li className="text-foreground font-medium">{categoryLabel}</li>
              </ol>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-4 flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-balance">
                  Top {listingLabel} de {categoryLabel} {cityLabel}
                </h1>
                <p className="text-lg text-muted-foreground text-pretty">
                  Descoperă cele mai bune {listingLabel.toLowerCase()} de{" "}
                  {categoryLabel.toLowerCase()} din {cityLabel}.
                </p>
              </div>
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
