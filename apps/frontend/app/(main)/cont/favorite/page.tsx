"use client"

import { useState } from "react"
import { SectionCard } from "@/components/cont/SectionCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FaLocationDot, FaUsers, FaHeart, FaStar, FaCalendarDays, FaClock } from "react-icons/fa6"
import { mockFavoriteLocations, mockFavoriteServices, mockFavoriteEvents } from "@/mocks/cont/favorites"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

export default function FavoritePage() {
  const [favoriteLocations, setFavoriteLocations] = useState(mockFavoriteLocations)
  const [favoriteServices, setFavoriteServices] = useState(mockFavoriteServices)
  const [favoriteEvents, setFavoriteEvents] = useState(mockFavoriteEvents)

  const handleRemoveFavorite = (id: number, type: "location" | "service" | "event") => {
    if (type === "location") {
      setFavoriteLocations((prev) => prev.filter((fav) => fav.id !== id))
    } else if (type === "service") {
      setFavoriteServices((prev) => prev.filter((fav) => fav.id !== id))
    } else {
      setFavoriteEvents((prev) => prev.filter((fav) => fav.id !== id))
    }
    toast.success("Eliminat din favorite")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Favorite</h1>
        <p className="text-muted-foreground">Listările tale salvate pentru referință rapidă</p>
      </div>

      <SectionCard
        title="Listările tale favorite"
        description="Gestionează locațiile, serviciile și evenimentele salvate"
      >
        <Tabs defaultValue="locatii" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="locatii">
              Locații
              <Badge variant="secondary" className="ml-2">
                {favoriteLocations.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="servicii">
              Servicii
              <Badge variant="secondary" className="ml-2">
                {favoriteServices.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="evenimente">
              Evenimente
              <Badge variant="secondary" className="ml-2">
                {favoriteEvents.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Locații Tab */}
          <TabsContent value="locatii" className="space-y-4">
            {favoriteLocations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nu ai locații salvate încă</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteLocations.map((favorite) => (
                  <Card key={favorite.id} className="glass-card overflow-hidden h-full flex flex-col">
                    <CardHeader className="p-0 relative">
                      <div className="relative h-48 w-full">
                        <Image
                          src={favorite.listing.image || "/placeholder.svg"}
                          alt={favorite.listing.title}
                          fill
                          className="object-cover"
                        />
                        {favorite.listing.verified && (
                          <Badge className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-sm">Verificat</Badge>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90 text-red-500"
                          onClick={() => handleRemoveFavorite(favorite.id, "location")}
                        >
                          <FaHeart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-4 space-y-3">
                      <h3 className="font-semibold text-lg line-clamp-2">{favorite.listing.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{favorite.listing.description}</p>

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FaLocationDot className="h-4 w-4" />
                          <span>{favorite.listing.city}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaUsers className="h-4 w-4" />
                          <span>{favorite.listing.capacity} persoane</span>
                        </div>
                        <Badge variant="outline">{favorite.listing.type}</Badge>
                      </div>

                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{favorite.listing.rating.average}</span>
                        <span className="text-muted-foreground">· {favorite.listing.rating.count} recenzii</span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Button asChild className="w-full glow-on-hover">
                        <Link href={`/locatii/${favorite.listing.slug}`}>Vezi detalii</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Servicii Tab */}
          <TabsContent value="servicii" className="space-y-4">
            {favoriteServices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nu ai servicii salvate încă</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteServices.map((favorite) => (
                  <Card key={favorite.id} className="glass-card h-full flex flex-col">
                    <CardHeader className="space-y-4">
                      <div className="flex items-start justify-between">
                        <Avatar className="h-16 w-16">
                          <AvatarImage
                            src={favorite.listing.avatar || "/placeholder.svg"}
                            alt={favorite.listing.name}
                          />
                          <AvatarFallback>{favorite.listing.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveFavorite(favorite.id, "service")}
                        >
                          <FaHeart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg line-clamp-2">{favorite.listing.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge>{favorite.listing.type}</Badge>
                          {favorite.listing.verified && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                              Verificat
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-3">
                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{favorite.listing.rating.average}</span>
                        <span className="text-muted-foreground">· {favorite.listing.rating.count} recenzii</span>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <FaLocationDot className="h-4 w-4" />
                        <span>{favorite.listing.city}</span>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button asChild className="w-full glow-on-hover">
                        <Link href={`/servicii/${favorite.listing.slug}`}>Vezi profil</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Evenimente Tab */}
          <TabsContent value="evenimente" className="space-y-4">
            {favoriteEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nu ai evenimente salvate încă</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteEvents.map((favorite) => (
                  <Card key={favorite.id} className="glass-card overflow-hidden h-full flex flex-col">
                    <CardHeader className="p-0 relative">
                      <div className="relative h-48 w-full">
                        <Image
                          src={favorite.listing.image || "/placeholder.svg"}
                          alt={favorite.listing.title}
                          fill
                          className="object-cover"
                        />
                        {favorite.listing.verified && (
                          <Badge className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-sm">Verificat</Badge>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90 text-red-500"
                          onClick={() => handleRemoveFavorite(favorite.id, "event")}
                        >
                          <FaHeart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-4 space-y-3">
                      <h3 className="font-semibold text-lg line-clamp-2">{favorite.listing.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{favorite.listing.description}</p>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <FaCalendarDays className="h-4 w-4" />
                          <span>
                            {favorite.listing.day}, {favorite.listing.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaClock className="h-4 w-4" />
                          <span>{favorite.listing.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaLocationDot className="h-4 w-4" />
                          <span>{favorite.listing.city}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{favorite.listing.rating.average}</span>
                        <span className="text-muted-foreground">· {favorite.listing.rating.count} participanți</span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Button asChild className="w-full glow-on-hover">
                        <Link href={`/evenimente/${favorite.listing.slug}`}>Vezi detalii</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SectionCard>
    </div>
  )
}
