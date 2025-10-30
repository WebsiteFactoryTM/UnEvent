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
import type { ListingType } from "@/types/listings";
import { Listing } from "@/types/listings";
import { Event, Media, Location } from "@/types/payload-types";
import { getListingTypeSlug } from "@/lib/getListingType";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { fetchListing } from "@/lib/api/listings";

export const revalidate = 3600; // ISR: revalidate every hour

export default async function DetailPage({
  params,
}: {
  params: { listingType: string; slug: string };
}) {
  const { listingType, slug } = await params;
  if (!listingTypes.includes(listingType as any)) notFound();

  let listing: Listing | null = null;

  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  const listingTypeUrl = getListingTypeSlug(listingType);
  const { data, error } = await fetchListing(listingTypeUrl, slug, accessToken);
  if (error) {
    console.error(error);
    notFound();
  }
  listing = data;
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

export async function generateMetadata({
  params,
}: {
  params: { listingType: string; slug: string };
}): Promise<Metadata> {
  const { listingType, slug } = await params;
  if (!listingTypes.includes(listingType as any))
    return { title: "Pagină negăsită | UN:EVENT" };

  // Fetch mock data per type (UI-only)
  const { data, error } = await fetchListing(
    getListingTypeSlug(listingType),
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
