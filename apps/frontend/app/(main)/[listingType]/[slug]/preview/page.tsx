import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { listingTypes } from "@/config/archives";
import { prettifySlug } from "@/lib/slug";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

import { ListingBreadcrumbs } from "@/components/listing/shared/ListingBreadcrumbs";
import { ListingMedia } from "@/components/listing/shared/ListingMedia";
import { ListingHero } from "@/components/listing/shared/ListingHero";
import { ListingDescription } from "@/components/listing/shared/ListingDescription";
import { ListingVideos } from "@/components/listing/shared/ListingVideos";
import { ListingMap } from "@/components/listing/shared/ListingMap";
import { ListingProviderCard } from "@/components/listing/shared/ListingProviderCard";
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
import { ListingType as SuitableForType } from "@/types/payload-types";
import nextDynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingViewTracker } from "@/components/metrics/ListingViewTracker";

const ListingReviews = nextDynamic(
  () =>
    import("@/components/listing/shared/ListingReviews").then(
      (mod) => mod.ListingReviews,
    ),
  {
    loading: () => (
      <div className="glass-card p-4 sm:p-6 space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    ),
  },
);

const ListingRecommendations = nextDynamic(
  () =>
    import("@/components/listing/shared/ListingRecommendations").then(
      (mod) => mod.ListingRecommendations,
    ),
  {
    loading: () => (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="flex gap-4">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    ),
  },
);

const statusLocalized = {
  pending: "În așteptare",
  approved: "Aprobat",
  rejected: "Respins",
  draft: "Draft",
};
// Force dynamic rendering for preview mode
export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ listingType: string; slug: string }>;
}) {
  const { listingType, slug } = await params;
  const { isEnabled } = await draftMode();

  // Preview mode requires draft mode to be enabled
  if (!isEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Acces interzis</h1>
          <p className="text-muted-foreground">
            Modul de previzualizare nu este activat.
          </p>
        </div>
      </div>
    );
  }

  if (!listingTypes.includes(listingType as any)) notFound();

  const listingTypeUrl = getListingTypeSlug(listingType as ListingType);

  // Get session to pass access token for fetching draft content
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  const {
    data: listing,
    error,
  }: { data: Listing | null; error: Error | null } = await fetchListing(
    listingTypeUrl as "locations" | "events" | "services",
    slug,
    accessToken, // Pass the access token
    true, // Enable draft mode to fetch unpublished content
  );

  if (!listing) {
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
      <ListingViewTracker
        listingId={listing.id}
        kind={listingTypeUrl}
        listing={listing}
      />
      {/* Preview Mode Banner */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2">
        <div className="container mx-auto">
          <p className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
            <strong>Mod de previzualizare:</strong> Aceasta este o
            previzualizare a listării tale. Status:{" "}
            <span className="font-semibold">
              {
                statusLocalized[
                  listing.moderationStatus as keyof typeof statusLocalized
                ]
              }
            </span>
          </p>
        </div>
      </div>
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

            <Suspense
              fallback={
                <div className="glass-card p-4 sm:p-6 space-y-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              }
            >
              <ListingReviews
                type={listingType as ListingType}
                listingId={listing?.id ?? null}
                listingRating={listing?.rating ?? null}
                listingReviewCount={listing?.reviewCount ?? null}
                hasReviewedByViewer={listing?.hasReviewedByViewer ?? false}
              />
            </Suspense>
          </div>
          {listingType === "evenimente" && (
            <Suspense
              fallback={
                <div className="container mx-auto px-4 py-6">
                  <Skeleton className="h-10 w-64 mb-6" />
                  <div className="flex gap-4">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                  </div>
                </div>
              }
            >
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
            </Suspense>
          )}

          {["servicii"].includes(listingType) && (
            <Suspense
              fallback={
                <div className="container mx-auto px-4 py-6">
                  <Skeleton className="h-10 w-64 mb-6" />
                  <div className="flex gap-4">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                  </div>
                </div>
              }
            >
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
            </Suspense>
          )}

          {listingType === "locatii" && (
            <Suspense
              fallback={
                <div className="container mx-auto px-4 py-6">
                  <Skeleton className="h-10 w-64 mb-6" />
                  <div className="flex gap-4">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                  </div>
                </div>
              }
            >
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
            </Suspense>
          )}

          {listingType !== "evenimente" && (
            <Suspense
              fallback={
                <div className="container mx-auto px-4 py-6">
                  <Skeleton className="h-10 w-64 mb-6" />
                  <div className="flex gap-4">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                  </div>
                </div>
              }
            >
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
            </Suspense>
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
  const { isEnabled } = await draftMode();

  if (!listingTypes.includes(listingType as any))
    return { title: "Pagină negăsită | UN:EVENT" };

  const listingTypeUrl = getListingTypeSlug(listingType as ListingType);
  const { data, error } = await fetchListing(
    listingTypeUrl as "locations" | "events" | "services",
    slug,
    undefined,
    isEnabled, // Use draft mode if enabled
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
    title: `${title} (Preview) | UN:EVENT`,
    description,
    robots: {
      index: false,
      follow: false,
    },
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
