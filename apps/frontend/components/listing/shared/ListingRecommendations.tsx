"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FaLocationDot, FaUsers, FaHeart, FaStar } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { useSimilarListings } from "@/lib/react-query/listings.queries";
import { City, ListingType as SuitableForType } from "@/types/payload-types";
import { Listing, ListingType } from "@/types/listings";
import { CarouselSkeleton } from "@/components/home/carousels/CarouselSkeleton";
import { ListingCard } from "@/components/archives/ListingCard";
import { normalizeListing } from "@/lib/normalizers/hub";
import { useMemo } from "react";

interface ListingRecommendationsProps {
  typeRecommendations: ListingType;
  listingId?: number;
  city?: City;
  suitableFor?: (number | SuitableForType)[];
  accessToken?: string;
  limit?: number;
  label?: string;
  subLabel?: string;
}

export const ListingRecommendations: React.FC<ListingRecommendationsProps> = ({
  typeRecommendations,
  listingId,
  city,
  suitableFor,
  accessToken,
  limit = 10,
  label,
  subLabel,
}) => {
  const {
    data: similarListings,
    isLoading,
    error,
  } = useSimilarListings(
    typeRecommendations,
    listingId,
    city,
    suitableFor,
    limit,
  );

  // Normalize listings to ListingCardData format
  // Must be called before early returns to follow Rules of Hooks
  const normalizedListings = useMemo(() => {
    if (!similarListings || similarListings.length === 0) return [];
    return similarListings.map((listing: Listing) =>
      normalizeListing(typeRecommendations, listing),
    );
  }, [similarListings, typeRecommendations]);

  if (isLoading) return <CarouselSkeleton count={3} showAvatar={false} />;

  if (error)
    return (
      <div className="text-center py-8 text-muted-foreground">
        Am întâmpinat o eroare la încărcarea recomandărilor
      </div>
    );

  if (!normalizedListings || normalizedListings.length === 0)
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nu sunt rezultate pentru această căutare</p>
      </div>
    );

  const seeAllPath = city
    ? `${typeRecommendations}/oras/${city.slug}`
    : `${typeRecommendations}`;
  const title =
    label ||
    typeRecommendations.charAt(0).toUpperCase() +
      typeRecommendations.slice(1) +
      " recomandate";

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            {" "}
            <h2 className="text-3xl font-bold">{title}</h2>
            {subLabel && (
              <span className="text-muted-foreground">{subLabel}</span>
            )}
          </div>
          <Button asChild variant="ghost">
            <Link href={`/${seeAllPath}`}>Vezi toate</Link>
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
            {normalizedListings.map((cardData) => (
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
