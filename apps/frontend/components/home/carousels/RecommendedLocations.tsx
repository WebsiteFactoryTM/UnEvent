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
import { City, Location, Media } from "@/types/payload-types";
import { useQuery } from "@tanstack/react-query";
import { fetchHomeListings } from "@/lib/api/home";

export function RecommendedLocations() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["listings", "home"],
    queryFn: fetchHomeListings,
    staleTime: 1000 * 60 * 5,
  });

  const featuredLocations = data?.featuredLocations ?? [];

  // 1️⃣ Loading skeleton
  if (isLoading) return <CarouselSkeleton count={3} showAvatar={true} />;

  // 2️⃣ Error state
  if (isError)
    return (
      <section className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">
          Nu s-au putut încărca locațiile recomandate.
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
      </section>
    );

  // 3️⃣ Empty list
  if (featuredLocations.length === 0)
    return (
      <section className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        <p>Momentan nu există locațiile recomandate.</p>
        <Button asChild variant="ghost" className="mt-2">
          <Link href="/locatii">Vezi toate locațiile</Link>
        </Button>
      </section>
    );

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Locații recomandate</h2>
          <Button asChild variant="ghost">
            <Link href="/locatii">Vezi toate</Link>
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
            {featuredLocations?.map((location: Location) => (
              <CarouselItem
                key={location.id}
                className="md:basis-1/2 lg:basis-1/3"
              >
                {/* <Card className="glass-card overflow-hidden h-full flex flex-col">
                  <CardHeader className="p-0 relative">
                    <div className="relative h-48 w-full">
                      <Image
                        src={location.featuredImage?.url || "/placeholder.svg"}
                        alt={location.featuredImage?.alt || location.title}
                        fill
                        className="object-cover"
                      />
                      {location.verified && (
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
                      {location.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {location.description}
                    </p>

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FaLocationDot className="h-4 w-4" />
                        <span>{location.city.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaUsers className="h-4 w-4" />
                        <span>{location.capacity.indoor} persoane</span>
                      </div>
                      <Badge variant="outline">
                        {location.type
                          .map((type: any) => type.title)
                          .join(", ")}
                      </Badge>
                    </div>

                    {location.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{location.rating}</span>
                        <span className="text-muted-foreground">
                          · {location.reviewCount} recenzii
                        </span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full glow-on-hover">
                      <Link href={`/locatii/${location.slug}`}>
                        Vezi detalii
                      </Link>
                    </Button>
                  </CardFooter>
                </Card> */}
                <ListingCard
                  id={location.id}
                  name={location.title}
                  slug={location.slug || ""}
                  description={location.description || ""}
                  image={
                    (location.featuredImage as Media)?.url || "/placeholder.svg"
                  }
                  city={(location.city as City | null)?.name || "România"}
                  type={location.type.map((type: any) => type.title).join(", ")}
                  verified={location.status === "approved"}
                  views={location.views || 0}
                  listingType="locatii"
                  capacity={location.capacity}
                  priceRange={
                    location.pricing?.amount
                      ? `de la ${location.pricing.amount} ${location.pricing.currency}`
                      : undefined
                  }
                  date={undefined}
                  participants={undefined}
                  rating={
                    location.rating && location.reviewCount
                      ? {
                          average: location.rating,
                          count: location.reviewCount,
                        }
                      : undefined
                  }
                  initialIsFavorited={
                    location.isFavoritedByViewer as boolean | undefined
                  }
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="glass-card" />
          <CarouselNext className="glass-card" />
        </Carousel>
      </div>
    </section>
  );
}
