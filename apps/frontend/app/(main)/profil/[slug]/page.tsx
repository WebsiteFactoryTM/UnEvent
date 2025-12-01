import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileMetrics } from "@/components/profile/ProfileMetrics";
import { ProfileListingsTabs } from "@/components/profile/ProfileListingsTabs";
import { ProfileReviews } from "@/components/profile/ProfileReviews";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import {
  fetchProfileBySlug,
  fetchProfileListings,
  fetchProfileReviews,
} from "@/lib/api/profile";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { profileKeys } from "@/lib/cacheKeys";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Profile } from "@/types/payload-types";
import { normalizeListing } from "@/lib/transforms/normalizeListing";
import type { Listing } from "@/types/listings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: profile } = await fetchProfileBySlug(slug);

  if (!profile) {
    return {
      title: "Profil negăsit | UN:EVENT",
    };
  }

  const displayName = profile.displayName || profile.name;
  const bio = profile.bio || `${displayName} pe UN:EVENT`;
  const avatarUrl =
    profile.avatar &&
    typeof profile.avatar === "object" &&
    "url" in profile.avatar
      ? profile.avatar.url
      : typeof profile.user === "object" && profile.user?.avatarURL
        ? profile.user.avatarURL
        : null;

  return {
    title: `${displayName} | UN:EVENT`,
    description: bio,
    openGraph: {
      title: displayName,
      description: bio,
      images: avatarUrl
        ? [
            {
              url: avatarUrl,
              width: 400,
              height: 400,
              alt: displayName,
            },
          ]
        : [],
      type: "profile",
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch profile data
  const { data: profile, error: profileError } = await fetchProfileBySlug(slug);

  if (!profile || profileError) {
    notFound();
  }

  const profileId = profile.id;

  // Fetch listings and reviews in parallel
  const [listingsResult, reviewsResult] = await Promise.all([
    fetchProfileListings(slug, profileId),
    fetchProfileReviews(slug, 1, 10, profileId),
  ]);

  // Prepare listings data
  const locations: Listing[] =
    listingsResult?.locations
      ?.map((loc: unknown) => normalizeListing(loc as Record<string, any>))
      .filter((l): l is Listing => l !== null && l !== undefined) || [];
  const events: Listing[] =
    listingsResult?.events
      ?.map((evt: unknown) => normalizeListing(evt as Record<string, any>))
      .filter((l): l is Listing => l !== null && l !== undefined) || [];
  const services: Listing[] =
    listingsResult?.services
      ?.map((srv: unknown) => normalizeListing(srv as Record<string, any>))
      .filter((l): l is Listing => l !== null && l !== undefined) || [];

  // Prepare reviews data
  const reviews = reviewsResult?.docs || [];

  // Prepare profile with user relationship for components
  // Components expect Profile with populated user relationship
  const profileWithUser = profile as Profile & {
    user: typeof profile.user extends object ? typeof profile.user : never;
  };

  // Set up React Query hydration
  const queryClient = getQueryClient();

  // Pre-populate cache
  await queryClient.setQueryData(profileKeys.bySlug(slug), profile);
  if (profileId) {
    await queryClient.setQueryData(profileKeys.detail(profileId), profile);
    if (listingsResult) {
      await queryClient.setQueryData(
        profileKeys.listings(profileId),
        listingsResult,
      );
    }
    if (reviewsResult) {
      await queryClient.setQueryData(
        profileKeys.reviews(profileId),
        reviewsResult,
      );
    }
  }

  const dehydratedState = dehydrate(queryClient);

  // Build JSON-LD Schema
  const user =
    typeof profile.user === "object" && profile.user ? profile.user : null;
  const avatarURL =
    (profile.avatar &&
      typeof profile.avatar === "object" &&
      "url" in profile.avatar &&
      profile.avatar.url) ||
    user?.avatarURL ||
    null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.displayName || profile.name,
    description: profile.bio,
    ...(avatarURL && { image: avatarURL }),
    ...(profile.phone && { telephone: profile.phone }),
    ...(user?.email && { email: user.email }),
    ...(profile.city && {
      address: {
        "@type": "PostalAddress",
        addressLocality: profile.city,
        addressCountry: "RO",
      },
    }),
    ...(profile.rating &&
      profile.rating.count &&
      profile.rating.count > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: profile.rating.average,
          reviewCount: profile.rating.count,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    sameAs: [
      profile.website,
      profile.socialMedia?.facebook,
      profile.socialMedia?.instagram,
      profile.socialMedia?.linkedin,
      profile.socialMedia?.youtube,
      profile.socialMedia?.x,
    ].filter(Boolean),
  };

  return (
    <HydrationBoundary state={dehydratedState}>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Desktop: 2-column layout, Mobile: stacked */}
            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              {/* Main Content */}
              <div className="space-y-6">
                <ProfileHero profile={profileWithUser} />
                <ProfileMetrics profile={profileWithUser} />
                <ProfileListingsTabs
                  locations={locations}
                  services={services}
                  events={events}
                />
                <ProfileReviews reviews={reviews} rating={profile.rating} />
              </div>

              {/* Sidebar */}
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <ProfileSidebar profile={profileWithUser} />
              </aside>
            </div>
          </div>
        </div>
      </main>
    </HydrationBoundary>
  );
}
