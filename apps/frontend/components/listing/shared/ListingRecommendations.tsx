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
    accessToken,
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
            {similarListings.map((listing: Listing) => {
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
                  <Card className="glass-card overflow-hidden h-full flex flex-col">
                    <CardHeader className="p-0 relative">
                      <div className="relative h-48 w-full">
                        <Image
                          src={image?.url || "/placeholder.svg"}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                        {verified && (
                          <Badge className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-sm">
                            Verificat
                          </Badge>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                        >
                          <FaHeart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-4 space-y-3">
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {listing.description}
                      </p>

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FaLocationDot className="h-4 w-4" />
                          <span>{city?.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaUsers className="h-4 w-4" />
                          <span>{capacity} persoane</span>
                        </div>
                        <Badge variant="outline">{locationType}</Badge>
                      </div>

                      {typeof rating === "number" &&
                        typeof reviewCount === "number" && (
                          <div className="flex items-center gap-1 text-sm">
                            <FaStar className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">
                              {rating.toFixed(1)}
                            </span>
                            <span className="text-muted-foreground">
                              · {reviewCount} recenzii
                            </span>
                          </div>
                        )}
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Button asChild className="w-full glow-on-hover">
                        <Link href={`/${typeRecommendations}/${slug}`}>
                          Vezi detalii
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="glass-card" />
          <CarouselNext className="glass-card" />
        </Carousel>
      </div>
    </section>
  );
};
