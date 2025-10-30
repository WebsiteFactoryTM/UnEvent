import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  mockLocation,
  mockReviews,
  mockSimilarLocations,
} from "@/mocks/locatie";
import { LocationBreadcrumbs } from "@/components/listing/location/LocationBreadcrumbs";
import { LocationHero } from "@/components/listing/location/LocationHero";
import { LocationMedia } from "@/components/listing/location/LocationMedia";
import { LocationDescription } from "@/components/listing/location/LocationDescription";
import { LocationVideos } from "@/components/listing/location/LocationVideos";
import { LocationFacilities } from "@/components/listing/location/LocationFacilities";
import { LocationCapacity } from "@/components/listing/location/LocationCapacity";
import { LocationAddressMap } from "@/components/listing/location/LocationAddressMap";
import { LocationHostCard } from "@/components/listing/location/LocationHostCard";
import { LocationReviews } from "@/components/listing/location/LocationReviews";
import { LocationRecommendations } from "@/components/listing/location/LocationRecommendations";
import { ScrollToTop } from "@/components/ScrollToTop";

// TODO: Replace with real data fetching
async function getLocation(slug: string) {
  // For UI-only testing, return mock data for any slug
  // In production, this will fetch real data based on the slug
  return mockLocation;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocation(slug);

  if (!location) {
    return {
      title: "Locație negăsită | UN:EVENT",
    };
  }

  const cityName =
    typeof location.city === "object" ? location.city.name : "România";
  const description =
    location.description?.slice(0, 160) ||
    `${location.title} - locație ${cityName}`;

  return {
    title: `${location.title} – locație ${cityName} | UN:EVENT`,
    description,
    openGraph: {
      title: location.title,
      description,
      images: [
        {
          url: location.featuredImage?.url || "/placeholder.svg",
          width: 1200,
          height: 630,
          alt: location.title,
        },
      ],
      type: "website",
    },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = await getLocation(slug);

  if (!location) {
    notFound();
  }

  const cityName =
    typeof location.city === "object" ? location.city.name : "România";

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: location.title,
    description: location.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address,
      addressLocality: cityName,
      addressCountry: "RO",
    },
    ...(location.geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: location.geo[0],
        longitude: location.geo[1],
      },
    }),
    ...(location.rating &&
      location.reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: location.rating,
          reviewCount: location.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    ...(location.contact?.phone && { telephone: location.contact.phone }),
    ...(location.contact?.website && { url: location.contact.website }),
  };

  return (
    <>
      <ScrollToTop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <LocationBreadcrumbs location={location} />

          {/* Gallery at the top */}
          <LocationMedia location={location} />

          {/* Title and details with contact info */}
          <LocationHero location={location} />

          {/* Main content sections */}
          <div className="space-y-6">
            <LocationDescription location={location} />
            <LocationVideos location={location} />
            <LocationFacilities facilities={location.facilities || []} />
            <LocationCapacity location={location} />
            <LocationAddressMap location={location} />
            <LocationHostCard location={location} />
            <LocationReviews location={location} reviews={mockReviews} />
          </div>

          <LocationRecommendations
            currentLocation={location}
            similarLocations={mockSimilarLocations}
          />
        </div>
      </div>
    </>
  );
}
