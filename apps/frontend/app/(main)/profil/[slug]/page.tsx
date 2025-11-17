import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileMetrics } from "@/components/profile/ProfileMetrics";
import { ProfileListingsTabs } from "@/components/profile/ProfileListingsTabs";
import { ProfileReviews } from "@/components/profile/ProfileReviews";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

// Function to fetch real data based on slug
async function fetchUserBySlug(slug: string) {
  // Placeholder for actual data fetching logic
  return {
    profile: {
      displayName: "John Doe",
      name: "John Doe",
      bio: "John Doe is a software engineer at Google.",
      phone: "1234567890",
      city: "New York",
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await fetchUserBySlug(params.slug);
  const profile = user.profile;

  // // JSON-LD Schema
  // const jsonLd = {
  //   "@context": "https://schema.org",
  //   "@type": "Person",
  //   name: profile.displayName || profile.name,
  //   description: profile.bio,
  //   image: user.avatarURL,
  //   url: typeof window !== "undefined" ? window.location.href : "",
  //   telephone: profile.phone,
  //   email: user.email,
  //   address: {
  //     "@type": "PostalAddress",
  //     addressLocality: profile.city,
  //     addressCountry: "RO",
  //   },
  //   ...(profile.rating &&
  //     profile.rating.count &&
  //     profile.rating.count > 0 && {
  //       aggregateRating: {
  //         "@type": "AggregateRating",
  //         ratingValue: profile.rating.average,
  //         reviewCount: profile.rating.count,
  //         bestRating: 5,
  //         worstRating: 1,
  //       },
  //     }),
  //   sameAs: [
  //     profile.website,
  //     profile.socialMedia?.facebook,
  //     profile.socialMedia?.instagram,
  //     profile.socialMedia?.linkedin,
  //     profile.socialMedia?.youtube,
  //     profile.socialMedia?.x,
  //   ].filter(Boolean),
  // }

  return (
    <>
      {/* JSON-LD */}
      {/* <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> */}

      <main className="min-h-screen py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Desktop: 2-column layout, Mobile: stacked */}
            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              {/* Main Content */}
              <div className="space-y-6">
                <ProfileHero user={user} />
                {/* <ProfileMetrics user={user} /> */}
                {/* <ProfileListingsTabs
                  locations={mockProfileLocations}
                  services={mockProfileServices}
                  events={mockProfileEvents}
                /> */}
                {/* <ProfileReviews reviews={mockProfileReviews} rating={profile.rating} /> */}
              </div>

              {/* Sidebar */}
              <aside className="lg:sticky lg:top-24 lg:self-start">
                {/* <ProfileSidebar user={user} /> */}
              </aside>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
