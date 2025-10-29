import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listingTypes } from "@/config/archives";
import { prettifySlug } from "@/lib/slug";
import {
  mockEvent,
  mockReviews as mockEventReviews,
  mockSimilarEvents,
} from "@/mocks/eveniment";
import {
  mockLocation,
  mockReviews as mockLocationReviews,
  mockSimilarLocations,
} from "@/mocks/locatie";
import {
  mockService,
  mockReviews as mockServiceReviews,
  mockSimilarServices,
} from "@/mocks/serviciu";
import { normalizeToViewModel } from "@/components/listing/shared/normalize";
import { ListingBreadcrumbs } from "@/components/listing/shared/ListingBreadcrumbs";
import { ListingMedia } from "@/components/listing/shared/ListingMedia";
import { ListingHero } from "@/components/listing/shared/ListingHero";
import { ListingDescription } from "@/components/listing/shared/ListingDescription";
import { ListingVideos } from "@/components/listing/shared/ListingVideos";
import { ListingMap } from "@/components/listing/shared/ListingMap";
import { ListingProviderCard } from "@/components/listing/shared/ListingProviderCard";
import { ListingReviews } from "@/components/listing/shared/ListingReviews";
import { buildJsonLd } from "@/components/listing/shared/jsonld";
import type { ListingType } from "@/types/listings";
import { Listing } from "@/types/listings";
import { Event, Media, Location } from "@/types/payload-types";
import { getListingTypeSlug } from "@/lib/getListingType";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export const revalidate = 3600; // ISR: revalidate every hour

export async function generateMetadata({
  params,
}: {
  params: { listingType: string; slug: string };
}): Promise<Metadata> {
  const { listingType, slug } = await params;
  if (!listingTypes.includes(listingType as any))
    return { title: "Pagină negăsită | UN:EVENT" };

  // Fetch mock data per type (UI-only)
  const data =
    listingType === "evenimente"
      ? mockEvent
      : listingType === "locatii"
        ? mockLocation
        : mockService;
  const vm = normalizeToViewModel(listingType as ListingType, data);
  const title = vm.title || prettifySlug(slug);
  const description = vm.description?.slice(0, 160) || `${title}`;

  return {
    title: `${title} | UN:EVENT`,
    description,
    openGraph: {
      title,
      description,
      images: vm.featuredImageUrl
        ? [{ url: vm.featuredImageUrl, width: 1200, height: 630, alt: title }]
        : [],
      type: "website",
    },
  };
}

export default async function DetailPage({
  params,
}: {
  params: { listingType: string; slug: string };
}) {
  const { listingType, slug } = await params;
  if (!listingTypes.includes(listingType as any)) notFound();

  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  const listingTypeUrl = getListingTypeSlug(listingType);
  let listing: Listing | null = null;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${listingTypeUrl}?where[slug][equals]=${slug}&includeReviewState=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const data = await response.json();
    listing = data.docs[0];
    // console.log(listing);
  } catch (error) {
    console.error(error);
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

          <ListingDescription description={description} />

          {Array.isArray(listing?.youtubeLinks) &&
            listing?.youtubeLinks.length > 0 && (
              <ListingVideos youtubeLinks={listing?.youtubeLinks} />
            )}

          <ListingMap
            cityName={cityName}
            venue={
              (listing as Event)?.venue
                ? ((listing as Event).venue as Location)
                : undefined
            }
            address={listing?.address ?? ""}
          />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ListingReviews
                type={listingType as ListingType}
                listingId={listing?.id ?? null}
                listingRating={listing?.rating ?? null}
                listingReviewCount={listing?.reviewCount ?? null}
                hasReviewedByViewer={listing?.hasReviewedByViewer ?? false}
              />
            </div>

            <div className="space-y-6">
              <ListingProviderCard
                type={listingType as ListingType}
                listing={listing as Listing}
              />
            </div>
          </div>

          {/* <ListingRecommendations
            type={listingType as ListingType}
            data={raw}
            similar={similar}
          /> */}
        </div>
      </div>
    </>
  );
}
