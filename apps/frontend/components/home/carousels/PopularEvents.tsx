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
import {
  FaLocationDot,
  FaCalendarDays,
  FaClock,
  FaHeart,
  FaStar,
} from "react-icons/fa6";
import { mockEvents } from "@/mocks/home/events";
import Image from "next/image";
import Link from "next/link";
import { CarouselSkeleton } from "./CarouselSkeleton";
import { ListingCard } from "@/components/archives/ListingCard";
import { ListingType } from "@/types/listings";

export function PopularEvents({ upcomingEvents }: { upcomingEvents: any }) {
  if (!upcomingEvents) return <CarouselSkeleton count={3} showAvatar={false} />;

  if (upcomingEvents.length === 0)
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nu sunt rezultate pentru această căutare</p>
      </div>
    );
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Evenimente populare</h2>
          <Button asChild variant="ghost">
            <Link href="/evenimente">Vezi toate</Link>
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
            {upcomingEvents?.map((event: any) => (
              <CarouselItem
                key={event.id}
                className="md:basis-1/2 lg:basis-1/3"
              >
                {/* <Card className="glass-card overflow-hidden h-full flex flex-col">
                  <CardHeader className="p-0 relative">
                    <div className="relative h-48 w-full">
                      <Image
                        src={event.featuredImage?.url || "/placeholder.svg"}
                        alt={event.featuredImage?.alt || event.title}
                        fill
                        className="object-cover"
                      />
                      {event.verified && (
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
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <FaCalendarDays className="h-4 w-4" />
                        <span>
                          {event.day}, {event.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaLocationDot className="h-4 w-4" />
                        <span>{event.city.name}</span>
                      </div>
                    </div>

                    {event.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{event.rating}</span>
                        <span className="text-muted-foreground">
                          · {event.reviewCount} participanți
                        </span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full glow-on-hover">
                      <Link href={`/evenimente/${event.slug}`}>
                        Vezi detalii
                      </Link>
                    </Button>
                  </CardFooter>
                </Card> */}
                <ListingCard
                  id={event.id}
                  name={event.title}
                  slug={event.slug}
                  description={event.description}
                  image={event.featuredImage?.url || "/placeholder.svg"}
                  city={event.city.name}
                  type={event.type.map((type: any) => type.title).join(", ")}
                  verified={event.verified}
                  rating={
                    event.rating && event.reviewCount
                      ? {
                          average: event.rating,
                          count: event.reviewCount,
                        }
                      : undefined
                  }
                  views={event.views || 0}
                  listingType={"evenimente" as ListingType}
                  date={event.startDate}
                  participants={event.participants}
                  initialIsFavorited={event.isFavoritedByViewer}
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
