import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listingTypes, getListingTypeLabel } from "@/config/archives";
import { archiveLocations } from "@/mocks/archives/locations";
import { archiveServices } from "@/mocks/archives/services";
import { archiveEvents } from "@/mocks/archives/events";
import { ListingCard } from "@/components/archives/ListingCard";
import { ArchiveFilter } from "@/components/archives/ArchiveFilter";
import { AddListingButton } from "@/components/archives/AddListingButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import Link from "next/link";
import Image from "next/image";
import { City, Media } from "@/types/payload-types";
import { getPopularCities } from "@/lib/api/cities";
import { Listing, ListingType } from "@/types/listings";
import { fetchTopListings } from "@/lib/api/listings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
export const revalidate = 86400; // ISR: revalidate every day (24 hours)

export async function generateStaticParams() {
  return listingTypes.map((listingType) => ({
    listingType,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listingType: string }>;
}): Promise<Metadata> {
  const { listingType } = await params;
  const label = getListingTypeLabel(listingType);

  return {
    title: `Top 15 ${label} în România | UnEvent`,
    description: `Descoperă cele mai bune ${label.toLowerCase()} din România. Verificate, recenzii reale și oferte exclusive.`,
  };
}

export default async function ListingTypePage({
  params,
}: {
  params: Promise<{ listingType: string }>;
}) {
  const { listingType } = await params;
  if (!listingTypes.includes(listingType as any)) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken as string | undefined;

  const [popularCities, listings] = await Promise.all([
    getPopularCities(),
    fetchTopListings(listingType as ListingType, 15, accessToken),
  ]);
  const label = getListingTypeLabel(listingType);

  return (
    <>
      <ScrollToTop />

      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header with add button */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-4 flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-balance">
                  Top {label} în România
                </h1>
                <p className="text-lg text-muted-foreground text-pretty">
                  Descoperă cele mai bune {label.toLowerCase()} din România
                  verificate și recenzate de comunitatea noastră.
                </p>
              </div>
              <AddListingButton listingType={listingType as any} />
            </div>

            {/* Filter Component */}
            <ArchiveFilter listingType={listingType as any} />

            <section className="py-12">
              <h2 className="text-5xl font-semibold mb-6 text-center">
                Caută după oraș
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {popularCities.map((city: City) => {
                  const image = city.image as Media | null;
                  if (image === null) return null;
                  return (
                    <Link
                      key={city.slug}
                      href={`/${listingType}/oras/${city.slug}`}
                      className="glass-card relative rounded-xl overflow-hidden group"
                    >
                      <Image
                        src={image?.url || "/placeholder.jpg"}
                        alt={image?.alt || city.name}
                        width={100}
                        height={100}
                        className="object-cover w-full h-64 transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xl font-semibold">
                          {city.name}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
            <div className="flex justify-center">
              <h3 className="text-3xl font-semibold mb-6 text-center">Sau</h3>
            </div>
            <section className="py-16 bg-muted/30">
              <h2 className="text-5xl font-semibold mb-6 text-center">
                Alege top {label} din România
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.slice(0, 6).map((listing, index) => (
                  <ListingCard
                    key={`${listing.slug}-${index}`}
                    id={listing.id}
                    name={listing.title}
                    slug={listing.slug || ""}
                    description={listing.description || ""}
                    image={{
                      url:
                        (listing.featuredImage as Media)?.url ||
                        "/placeholder.svg",
                      alt:
                        (listing.featuredImage as Media)?.alt || listing.title,
                    }}
                    city={(listing.city as City | null)?.name || "România"}
                    type={listingType}
                    verified={listing.status === "approved"}
                    rating={
                      listing.rating && listing.reviewCount
                        ? {
                            average: listing.rating,
                            count: listing.reviewCount,
                          }
                        : undefined
                    }
                    views={listing.views || 0}
                    listingType={listingType as ListingType}
                    initialIsFavorited={(listing as any)?.isFavoritedByViewer}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
