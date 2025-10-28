"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FaLocationDot, FaUsers, FaHeart, FaStar, FaCalendarDays, FaClock } from "react-icons/fa6"
import Image from "next/image"
import Link from "next/link"
import type { LocationMock } from "@/mocks/home/locations"
import type { ServiceMock } from "@/mocks/home/services"
import type { EventMock } from "@/mocks/home/events"

interface ProfileListingsTabsProps {
  locations: LocationMock[]
  services: ServiceMock[]
  events: EventMock[]
}

export function ProfileListingsTabs({ locations, services, events }: ProfileListingsTabsProps) {
  const totalListings = locations.length + services.length + events.length

  return (
    <div className="glass-card p-6 animate-fade-in-up animation-delay-200">
      <h2 className="text-2xl font-bold mb-6">Listări ({totalListings})</h2>

      <Tabs defaultValue="locations" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="locations">Locații ({locations.length})</TabsTrigger>
          <TabsTrigger value="services">Servicii ({services.length})</TabsTrigger>
          <TabsTrigger value="events">Evenimente ({events.length})</TabsTrigger>
        </TabsList>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          {locations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nu există locații listate.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {locations.map((location) => (
                <Card key={location.id} className="glass-card overflow-hidden">
                  <CardHeader className="p-0 relative">
                    <div className="relative h-48 w-full">
                      <Image
                        src={location.image || "/placeholder.svg"}
                        alt={location.title}
                        fill
                        className="object-cover"
                      />
                      {location.verified && (
                        <Badge className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-sm">Verificat</Badge>
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

                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg line-clamp-2">{location.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{location.description}</p>

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
                        <span className="font-semibold">{location.rating.average}</span>
                        <span className="text-muted-foreground">· {location.rating.count} recenzii</span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full glow-on-hover">
                      <Link href={`/locatii/${location.id}`}>Vezi detalii</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          {services.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nu există servicii listate.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {services.map((service) => (
                <Card key={service.id} className="glass-card">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={service.avatar || "/placeholder.svg"} alt={service.name} />
                        <AvatarFallback>{service.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Button size="icon" variant="ghost" className="hover:text-red-500">
                        <FaHeart className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-2">{service.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{service.type}</Badge>
                        {service.verified && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            Verificat
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {service.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{service.rating.average}</span>
                        <span className="text-muted-foreground">· {service.rating.count} recenzii</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FaLocationDot className="h-4 w-4" />
                      <span>{service.city}</span>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button asChild className="w-full glow-on-hover">
                      <Link href={`/servicii/${service.id}`}>Vezi profil</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nu există evenimente listate.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((event) => (
                <Card key={event.id} className="glass-card overflow-hidden">
                  <CardHeader className="p-0 relative">
                    <div className="relative h-48 w-full">
                      <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                      {event.verified && (
                        <Badge className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-sm">Verificat</Badge>
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

                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg line-clamp-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

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
                        <span>{event.city}</span>
                      </div>
                    </div>

                    {event.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{event.rating.average}</span>
                        <span className="text-muted-foreground">· {event.rating.count} participanți</span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full glow-on-hover">
                      <Link href={`/evenimente/${event.id}`}>Vezi detalii</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
