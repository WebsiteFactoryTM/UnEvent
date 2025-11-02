"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FaLocationDot, FaHeart, FaStar } from "react-icons/fa6";
import { mockServices } from "@/mocks/home/services";
import Link from "next/link";
import { CarouselSkeleton } from "./CarouselSkeleton";

export function RecommendedServices({ topServices }: { topServices: any }) {
  if (!topServices) return <CarouselSkeleton count={3} showAvatar={true} />;

  if (topServices.length === 0)
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nu sunt rezultate pentru această căutare</p>
      </div>
    );
  return (
    <section className="container mx-auto px-4 py-12 bg-muted/30">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Servicii recomandate</h2>
          <Button asChild variant="ghost">
            <Link href="/servicii">Vezi toate</Link>
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
            {topServices?.map((service: any) => (
              <CarouselItem
                key={service.id}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <Card className="glass-card h-full flex flex-col">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={service.featuredImage?.url || "/placeholder.svg"}
                          alt={service.featuredImage?.alt || service.title}
                        />
                        <AvatarFallback>
                          {service.title.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:text-red-500"
                      >
                        <FaHeart className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {service.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {service?.type?.length > 0 ? (
                          service?.type?.map((type: any) => (
                            <Badge key={type.slug}>{type.title}</Badge>
                          ))
                        ) : (
                          <Badge>Serviciu</Badge>
                        )}

                        {service.verified && (
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-600 border-green-500/20"
                          >
                            Verificat
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3">
                    {service.rating && service.reviewCount ? (
                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{service.rating}</span>
                        <span className="text-muted-foreground">
                          · {service.reviewCount} recenzii
                        </span>
                      </div>
                    ) : null}

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FaLocationDot className="h-4 w-4" />
                      <span>{service.city.name}</span>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button asChild className="w-full glow-on-hover">
                      <Link href={`/servicii/${service.slug}`}>
                        Vezi detalii
                      </Link>
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
