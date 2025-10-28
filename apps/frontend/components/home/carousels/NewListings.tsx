"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import {
  FaLocationDot,
  FaCalendarDays,
  FaClock,
  FaHeart,
  FaStar,
  FaUsers,
  FaWrench,
  FaCircleCheck,
} from "react-icons/fa6"
import { mockNewListings } from "@/mocks/home/new-listings"
import Image from "next/image"
import Link from "next/link"

export function NewListings() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Listări noi</h2>
          <Button asChild variant="ghost">
            <Link href="/listari-noi">Vezi toate</Link>
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
            {mockNewListings.map((listing) => (
              <CarouselItem key={`${listing.type}-${listing.id}`} className="md:basis-1/2 lg:basis-1/3">
                <Card className="glass-card overflow-hidden h-full flex flex-col">
                  <CardHeader className="p-0 relative">
                    <div className="relative h-48 w-full">
                      <Image
                        src={listing.image || "/placeholder.svg"}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute top-2 left-2 bg-blue-500/90 backdrop-blur-sm">Nou</Badge>
                      {listing.verified && (
                        <Badge className="absolute top-2 left-16 bg-green-500/90 backdrop-blur-sm flex items-center gap-1">
                          <FaCircleCheck className="h-3 w-3" />
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
                    <h3 className="font-semibold text-lg line-clamp-2">{listing.title}</h3>
                    {listing.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{listing.description}</p>
                    )}

                    <div className="space-y-2 text-sm text-muted-foreground">
                      {listing.type === "location" && (
                        <>
                          <div className="flex items-center gap-2">
                            <FaLocationDot className="h-4 w-4" />
                            <span>{listing.city}</span>
                          </div>
                          {listing.capacity && (
                            <div className="flex items-center gap-2">
                              <FaUsers className="h-4 w-4" />
                              <span>Capacitate: {listing.capacity} persoane</span>
                            </div>
                          )}
                          {listing.listingType && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{listing.listingType}</span>
                            </div>
                          )}
                        </>
                      )}

                      {listing.type === "service" && (
                        <>
                          <div className="flex items-center gap-2">
                            <FaWrench className="h-4 w-4" />
                            <span>{listing.serviceType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaLocationDot className="h-4 w-4" />
                            <span>{listing.city}</span>
                          </div>
                        </>
                      )}

                      {listing.type === "event" && (
                        <>
                          <div className="flex items-center gap-2">
                            <FaCalendarDays className="h-4 w-4" />
                            <span>
                              {listing.day}, {listing.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaClock className="h-4 w-4" />
                            <span>{listing.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaLocationDot className="h-4 w-4" />
                            <span>{listing.city}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {listing.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{listing.rating.average}</span>
                        <span className="text-muted-foreground">· {listing.rating.count} recenzii</span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full glow-on-hover">
                      <Link
                        href={
                          listing.type === "location"
                            ? `/locatii/${listing.id}`
                            : listing.type === "service"
                              ? `/servicii/${listing.id}`
                              : `/evenimente/${listing.id}`
                        }
                      >
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
  )
}
