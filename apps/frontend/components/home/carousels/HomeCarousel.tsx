"use client";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Link from "next/link";
import { CarouselSkeleton } from "./CarouselSkeleton";
import { ListingCard } from "@/components/archives/ListingCard";
import { City, Location, Media, Service, Event } from "@/types/payload-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHomeListings } from "@/lib/api/home";

import { ListingType } from "@/types/listings";
import { useMemo, useEffect, useRef } from "react";

interface HomeCarouselProps {
  listingType: ListingType;
  category:
    | "featuredLocations"
    | "topServices"
    | "upcomingEvents"
    | "newLocations"
    | "newServices"
    | "newEvents";
  label?: string;
}
const HomeCarousel: React.FC<HomeCarouselProps> = ({
  listingType,
  category,
  label,
}) => {
  const queryClient = useQueryClient();
  const lastCheckedRef = useRef<number>(Date.now());

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["listings", "home"],
    queryFn: fetchHomeListings,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 3, // Refetch every 3 minutes to catch updates
    refetchIntervalInBackground: true,
  });

  const listings = data?.[category] ?? [];

  // Check for server-side updates every 30 seconds
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Check if home data has been updated server-side
        const response = await fetch(
          "/api/public/home-updated?t=" + Date.now(),
        );

        if (response.ok) {
          const { lastUpdate } = await response.json();
          const lastChecked = parseInt(
            localStorage.getItem("homeLastChecked") || "0",
          );

          if (lastUpdate > lastChecked) {
            // Home data was updated server-side, invalidate and refetch
            console.log(
              "Home data updated server-side, invalidating React Query",
            );
            queryClient.invalidateQueries({
              queryKey: ["listings", "home"],
            });
            localStorage.setItem("homeLastChecked", lastUpdate.toString());
          }
        }
      } catch (error) {
        // Silently fail - this is just an optimization
      }
    };

    const interval = setInterval(checkForUpdates, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [queryClient]);

  // 1️⃣ Loading skeleton
  if (isLoading) return <CarouselSkeleton count={3} showAvatar={true} />;

  // 2️⃣ Error state
  if (isError)
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">{label}</h2>
            <Button asChild variant="ghost">
              <Link href={`/${listingType}`}>Vezi toate</Link>
            </Button>
          </div>
          <p className="text-muted-foreground">
            Nu s-au putut încărca listările.
          </p>
          <p className="text-sm text-muted-foreground/70">
            {error instanceof Error ? error.message : "A apărut o eroare."}
          </p>
          <Button
            onClick={() => location.reload()}
            variant="outline"
            className="mt-4"
          >
            Reîncarcă pagina
          </Button>
        </div>
      </section>
    );

  // 3️⃣ Empty list
  if (listings.length === 0)
    return (
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">{label}</h2>
            <Button asChild variant="ghost">
              <Link href={`/${listingType}`}>Vezi toate</Link>
            </Button>
          </div>
          <div>
            <p className="text-center text-muted-foreground">
              Momentan nu există listări.
            </p>
            <Button asChild variant="ghost" className="mt-2">
              <Link href={`/${listingType}`}>Vezi toate listările</Link>
            </Button>
          </div>
        </div>
      </section>
    );

  return (
    <section className="container mx-auto px-4 py-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">{label}</h2>
          <Button asChild variant="ghost">
            <Link href={`/${listingType}`}>Vezi toate</Link>
          </Button>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {listings?.map((listing: Location | Service | Event) => (
              <CarouselItem
                key={listing.id}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <ListingCard
                  id={listing.id}
                  name={listing.title}
                  slug={listing.slug || ""}
                  description={listing.description || ""}
                  image={{
                    url:
                      (listing.featuredImage as Media)?.url ||
                      "/placeholder.svg",
                    alt: (listing.featuredImage as Media)?.alt || listing.title,
                  }}
                  city={(listing.city as City | null)?.name || "România"}
                  type={listing.type.map((type: any) => type.title).join(", ")}
                  verified={listing.verifiedStatus === "approved"}
                  views={listing.views || 0}
                  listingType={listingType}
                  capacity={(listing as Location).capacity ?? undefined}
                  priceRange={
                    listing.pricing?.amount
                      ? `de la ${listing.pricing.amount} ${listing.pricing.currency}`
                      : undefined
                  }
                  date={(listing as Event).startDate ?? undefined}
                  participants={(listing as Event).participants ?? undefined}
                  rating={
                    listing.rating && listing.reviewCount
                      ? {
                          average: listing.rating,
                          count: listing.reviewCount,
                        }
                      : undefined
                  }
                  initialIsFavorited={
                    listing.isFavoritedByViewer as boolean | undefined
                  }
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default HomeCarousel;
