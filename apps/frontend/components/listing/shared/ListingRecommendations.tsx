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
import {
  City,
  Location,
  ListingType as SuitableForType,
} from "@/types/payload-types";
import { Listing, ListingType } from "@/types/listings";
import { CarouselSkeleton } from "@/components/home/carousels/CarouselSkeleton";
import { ListingCard } from "@/components/archives/ListingCard";

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

  if (isLoading) return <CarouselSkeleton count={3} showAvatar={false} />;

  if (error)
    return (
      <div className="text-center py-8 text-muted-foreground">
        Am întâmpinat o eroare la încărcarea recomandărilor
      </div>
    );
  if (!similarListings || similarListings.length === 0)
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
            {similarListings?.map((listing: Listing) => {
              const id = listing.id;
              const slug = listing.slug;
              const image =
                typeof listing.featuredImage === "object"
                  ? listing.featuredImage
                  : null;
              const city =
                typeof listing.city === "object" ? listing.city : null;
              const locationType =
                Array.isArray(listing.type) && listing.type.length > 0
                  ? typeof listing.type[0] === "object"
                    ? listing.type[0].title
                    : "Locație"
                  : "Locație";
              const verified = listing.status === "approved";
              const capacity =
                typeof (listing as Location).capacity === "object"
                  ? (listing as Location).capacity?.indoor
                  : null;
              const rating =
                typeof listing.rating === "number" ? listing.rating : undefined;
              const reviewCount =
                typeof listing.reviewCount === "number"
                  ? listing.reviewCount
                  : undefined;

              return (
                <CarouselItem key={id} className="md:basis-1/2 lg:basis-1/3">
                  <ListingCard
                    id={id}
                    name={listing.title}
                    slug={slug || ""}
                    description={listing.description || ""}
                    image={{
                      url: image?.url || "/placeholder.svg",
                      alt: listing.title,
                    }}
                    city={city?.name || ""}
                    type={locationType}
                    verified={verified}
                    rating={
                      rating
                        ? { average: rating, count: reviewCount || 0 }
                        : undefined
                    }
                    capacity={
                      capacity as Location["capacity"] | null | undefined
                    }
                    views={listing.views || 0}
                    listingType={typeRecommendations}
                    initialIsFavorited={
                      listing.isFavoritedByViewer as boolean | undefined
                    }
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};
