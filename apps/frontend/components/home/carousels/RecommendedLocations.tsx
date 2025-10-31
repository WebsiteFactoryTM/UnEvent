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
import { mockLocations } from "@/mocks/home/locations";
import Image from "next/image";
import Link from "next/link";

export function RecommendedLocations() {
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
            {mockLocations.map((location) => (
              <CarouselItem
                key={location.id}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <Card className="glass-card overflow-hidden h-full flex flex-col">
                  <CardHeader className="p-0 relative">
                    <div className="relative h-48 w-full">
                      <Image
                        src={location.image || "/placeholder.svg"}
                        alt={location.title}
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
                        <span>{location.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaUsers className="h-4 w-4" />
                        <span>{location.capacity} persoane</span>
                      </div>
                      <Badge variant="outline">{location.type}</Badge>
                    </div>

                    {location.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">
                          {location.rating.average}
                        </span>
                        <span className="text-muted-foreground">
                          · {location.rating.count} recenzii
                        </span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full glow-on-hover">
                      <Link href={`/locatii/${location.id}`}>Vezi detalii</Link>
                    </Button>
                  </CardFooter>
                </Card>
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
