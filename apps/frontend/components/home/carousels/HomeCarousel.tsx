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
import { useQuery } from "@tanstack/react-query";
import { fetchHomeListings } from "@/lib/api/home";
import { ListingCardData, normalizeListing } from "@/lib/normalizers/hub";
import { Listing, ListingType } from "@/types/listings";
import { useMemo } from "react";

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
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["listings", "home"],
    queryFn: fetchHomeListings,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });

  const listings = data?.[category] ?? [];

  // Normalize listings to ListingCardData format
  const normalizedListings = useMemo(() => {
    return listings.map((listing: Listing) =>
      normalizeListing(listingType, listing),
    );
  }, [listings, listingType]);

  // 1️⃣ Loading skeleton
  if (isLoading) return <CarouselSkeleton count={3} showAvatar={true} />;

  // 2️⃣ Error state
  if (isError)
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-left">{label}</h2>
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
            {normalizedListings.map((cardData: ListingCardData) => (
              <CarouselItem
                key={cardData.id}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <ListingCard {...cardData} />
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
