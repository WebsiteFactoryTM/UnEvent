import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listingTypes } from "@/config/archives";
import { prettifySlug } from "@/lib/slug";

import { ListingBreadcrumbs } from "@/components/listing/shared/ListingBreadcrumbs";
import { ListingMedia } from "@/components/listing/shared/ListingMedia";
import { ListingHero } from "@/components/listing/shared/ListingHero";
import { ListingDescription } from "@/components/listing/shared/ListingDescription";
import { ListingVideos } from "@/components/listing/shared/ListingVideos";
import { ListingMap } from "@/components/listing/shared/ListingMap";
import { ListingProviderCard } from "@/components/listing/shared/ListingProviderCard";
import { ListingReviews } from "@/components/listing/shared/ListingReviews";
import { buildJsonLd } from "@/components/listing/shared/jsonld";
import type {
  EventListing,
  ListingType,
  LocationListing,
  ServiceListing,
} from "@/types/listings";
import { Listing } from "@/types/listings";
import {
  Event,
  Media,
  Location,
  Facility,
  Service,
  City,
} from "@/types/payload-types";
import { getListingTypeSlug } from "@/lib/getListingType";
import { fetchListing } from "@/lib/api/listings";
import { LocationFacilities } from "@/components/listing/location/LocationFacilities";
import { LocationCapacity } from "@/components/listing/location/LocationCapacity";
import { ServiceOfferTags } from "@/components/listing/service/ServiceOfferTags";
import { ListingRecommendations } from "@/components/listing/shared/ListingRecommendations";
import { ListingType as SuitableForType } from "@/types/payload-types";
// import { RecommendedListings } from "@/components/home/carousels/RecommendedLocations";

import { fetchHubSnapshot } from "@/lib/api/hub";
import { draftMode } from "next/headers";

export const revalidate = 1800; // ISR: revalidate every hour

export async function generateStaticParams() {
  const types: ListingType[] = ["locatii", "servicii", "evenimente"];

  const all = await Promise.all(
    types.map(async (t) => {
      try {
        const s = await fetchHubSnapshot(t);
        const fromFeatured = (s?.featured ?? [])
          .slice(0, 80)
          .map((i: any) => ({ listingType: t, slug: i.slug }));
        const fromCities = (s?.popularCityRows ?? []).flatMap((row: any) =>
          (row.items ?? [])
            .slice(0, 10)
            .map((i: any) => ({ listingType: t, slug: i.slug })),
        );
        return [...fromFeatured, ...fromCities];
      } catch {
        return [];
      }
    }),
  );

  // de-dup + cap
  const map = new Map<string, { listingType: ListingType; slug: string }>();
  for (const arr of all)
    for (const p of arr) map.set(`${p.listingType}:${p.slug}`, p);

  return Array.from(map.values()).slice(0, 400);
}

export default async function DetailPage({
  params,
}: {
  params: Promise<{ listingType: string; slug: string }>;
}) {
  const { listingType, slug } = await params;
  const { isEnabled } = await draftMode();
  if (!listingTypes.includes(listingType as any)) notFound();

  const listingTypeUrl = getListingTypeSlug(listingType as ListingType);

  const {
    data: listing,
    error,
  }: { data: Listing | null; error: Error | null } = await fetchListing(
    listingTypeUrl as "locations" | "events" | "services",
    slug,
    undefined,
    isEnabled,
  );

  if (!listing) {
    // listing not found even for admin -> real 404
    notFound();
  }

  // listing exists → check if can be shown
  if (listing._status !== "published" && !isEnabled) {
    notFound();
  }

  const city = typeof listing?.city === "object" ? listing?.city : null;
  const cityName = city?.name ?? "";
  const citySlug = city?.slug ?? "";
  const title = listing?.title ?? "";
  const description = listing?.description ?? "";

  const jsonLd = buildJsonLd(listingType as ListingType, listing);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-8">
          <ListingBreadcrumbs
            type={listingType as ListingType}
            cityName={cityName}
            citySlug={citySlug}
            title={title ?? ""}
          />

          <ListingMedia
            type={listingType as ListingType}
            title={title}
            featuredImage={listing?.featuredImage as Media}
            gallery={listing?.gallery as Media[]}
          />

          <ListingHero
            listingType={listingType as ListingType}
            listing={listing as Listing}
          />
          <div className="space-y-6">
            <ListingDescription description={description} />

            {Array.isArray(listing?.youtubeLinks) &&
              listing?.youtubeLinks.length > 0 && (
                <ListingVideos youtubeLinks={listing?.youtubeLinks} />
              )}

            {/* Services Offered */}
            {(listing as ServiceListing)?.features ? (
              <ServiceOfferTags service={listing as ServiceListing} />
            ) : null}

            <ListingMap
              cityName={cityName}
              venue={
                (listing as EventListing)?.venue
                  ? ((listing as EventListing).venue as LocationListing)
                  : undefined
              }
              address={listing?.address ?? ""}
              geo={
                listing?.geo
                  ? { lat: listing.geo[1], lon: listing.geo[0] }
                  : undefined
              }
              city={
                typeof listing?.city === "object" ? listing.city : undefined
              }
            />
            {listingType === "locatii" && (
              <>
                <LocationFacilities
                  facilities={
                    ((listing as Location)?.facilities as Facility[]) || []
                  }
                />
                <LocationCapacity
                  capacity={
                    (listing as Location)?.capacity as Location["capacity"]
                  }
                  surface={
                    (listing as Location)?.surface as Location["surface"]
                  }
                />
              </>
            )}

            <ListingProviderCard
              type={listingType as ListingType}
              listing={listing as Listing}
            />

            <ListingReviews
              type={listingType as ListingType}
              listingId={listing?.id ?? null}
              listingRating={listing?.rating ?? null}
              listingReviewCount={listing?.reviewCount ?? null}
              hasReviewedByViewer={listing?.hasReviewedByViewer ?? false}
            />
          </div>
          {listingType === "evenimente" && (
            <ListingRecommendations
              typeRecommendations={"evenimente" as ListingType}
              city={city as City}
              suitableFor={
                (listing as Location | Service)?.suitableFor as (
                  | number
                  | SuitableForType
                )[]
              }
              label="Explorează alte evenimente in aceeasi zona"
              listingId={listing?.id}
            />
          )}

          {["servicii"].includes(listingType) && (
            <ListingRecommendations
              typeRecommendations={"locatii" as ListingType}
              city={city as City}
              suitableFor={
                (listing as Location | Service)?.suitableFor as (
                  | number
                  | SuitableForType
                )[]
              }
              label="Locații recomandate"
              subLabel="Pentru evenimentul tău"
            />
          )}

          {listingType === "locatii" && (
            <ListingRecommendations
              typeRecommendations={"servicii" as ListingType}
              city={city as City}
              suitableFor={
                (listing as Location | Service)?.suitableFor as (
                  | number
                  | SuitableForType
                )[]
              }
              label="Servicii recomandate"
              subLabel="Pentru evenimentul tău"
            />
          )}

          {listingType !== "evenimente" && (
            <ListingRecommendations
              typeRecommendations={listingType as ListingType}
              city={city as City}
              suitableFor={
                (listing as Location | Service)?.suitableFor as (
                  | number
                  | SuitableForType
                )[]
              }
              label={`${listingType.charAt(0).toUpperCase() + listingType.slice(1)} similare`}
              subLabel="Pentru evenimentul tău"
              listingId={listing?.id}
            />
          )}
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listingType: string; slug: string }>;
}): Promise<Metadata> {
  const { listingType, slug } = await params;
  if (!listingTypes.includes(listingType as any))
    return { title: "Pagină negăsită | UN:EVENT" };

  // Fetch mock data per type (UI-only)
  const listingTypeUrl = getListingTypeSlug(listingType as ListingType);
  const { data, error } = await fetchListing(
    listingTypeUrl as "locations" | "events" | "services",
    slug,
    undefined,
  );
  if (error) {
    console.error(error);
    notFound();
  }

  const featuredImage =
    typeof data?.featuredImage === "object" ? data?.featuredImage?.url : null;
  const title = data?.title || prettifySlug(slug);
  const description = data?.description?.slice(0, 160) || `${title}`;

  return {
    title: `${title} | UN:EVENT`,
    description,
    openGraph: {
      title,
      description,
      images: featuredImage
        ? [
            {
              url: featuredImage,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
      type: "website",
    },
  };
}
