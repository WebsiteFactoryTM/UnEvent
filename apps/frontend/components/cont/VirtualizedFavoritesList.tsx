"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import {
  FaLocationDot,
  FaUsers,
  FaHeart,
  FaStar,
  FaCalendarDays,
  FaClock,
} from "react-icons/fa6";
import {
  LocationListing,
  EventListing,
  ServiceListing,
} from "@/types/listings";
import { FavoriteWithListing } from "@/hooks/useAllFavorites";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface VirtualizedFavoritesListProps {
  favorites: FavoriteWithListing[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRemoveFavorite: (
    listingId: number,
    listingType: "locatii" | "servicii" | "evenimente",
  ) => void;
  isRemoving: boolean;
  type: "locations" | "events" | "services";
  getCityName: (
    listing: LocationListing | EventListing | ServiceListing,
  ) => string;
  getImageUrl: (
    listing: LocationListing | EventListing | ServiceListing,
  ) => string;
  isVerified: (
    listing: LocationListing | EventListing | ServiceListing,
  ) => boolean;
  getRating: (listing: LocationListing | EventListing | ServiceListing) => {
    average: number;
    count: number;
  };
}

export function VirtualizedFavoritesList({
  favorites,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onRemoveFavorite,
  isRemoving,
  type,
  getCityName,
  getImageUrl,
  isVerified,
  getRating,
}: VirtualizedFavoritesListProps) {
  if (isLoading && favorites.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Se încarcă...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    const emptyMessage =
      type === "locations"
        ? "Nu ai locații salvate încă"
        : type === "events"
          ? "Nu ai evenimente salvate încă"
          : "Nu ai servicii salvate încă";

    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((favorite) => (
          <FavoriteCard
            key={favorite.id}
            favorite={favorite}
            type={type}
            onRemove={onRemoveFavorite}
            isRemoving={isRemoving}
            getCityName={getCityName}
            getImageUrl={getImageUrl}
            isVerified={isVerified}
            getRating={getRating}
          />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          {isFetchingNextPage ? (
            <p className="text-muted-foreground">Se încarcă...</p>
          ) : (
            <Button onClick={onLoadMore} variant="outline">
              Încarcă mai multe
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Unified Favorite Card Component
function FavoriteCard({
  favorite,
  type,
  onRemove,
  isRemoving,
  getCityName,
  getImageUrl,
  isVerified,
  getRating,
}: {
  favorite: FavoriteWithListing;
  type: "locations" | "events" | "services";
  onRemove: (id: number, type: "locatii" | "servicii" | "evenimente") => void;
  isRemoving: boolean;
  getCityName: (
    listing: LocationListing | EventListing | ServiceListing,
  ) => string;
  getImageUrl: (
    listing: LocationListing | EventListing | ServiceListing,
  ) => string;
  isVerified: (
    listing: LocationListing | EventListing | ServiceListing,
  ) => boolean;
  getRating: (listing: LocationListing | EventListing | ServiceListing) => {
    average: number;
    count: number;
  };
}) {
  const listing = favorite.listing;
  const cityName = getCityName(listing);
  const verified = isVerified(listing);
  const rating = getRating(listing);

  // Type-specific data extraction
  const getLocationType = (loc: LocationListing): string => {
    if (loc.type && loc.type.length > 0) {
      const firstType = loc.type[0];
      return typeof firstType === "object" ? firstType.title || "" : "";
    }
    return "";
  };

  const getCapacity = (loc: LocationListing): number => {
    if (loc.capacity?.indoor) return loc.capacity.indoor;
    if (loc.capacity?.outdoor) return loc.capacity.outdoor;
    return 0;
  };

  const getEventDate = (
    evt: EventListing,
  ): { day: string; date: string; time: string } => {
    if (evt.startDate) {
      try {
        const startDate = new Date(evt.startDate);
        return {
          day: format(startDate, "EEEE", { locale: ro }),
          date: format(startDate, "d MMMM yyyy", { locale: ro }),
          time: format(startDate, "HH:mm"),
        };
      } catch {
        return { day: "", date: "", time: "" };
      }
    }
    return { day: "", date: "", time: "" };
  };

  const getServiceAvatar = (svc: ServiceListing): string => {
    const owner = typeof svc.owner === "object" ? svc.owner : null;
    if (owner?.avatar && typeof owner.avatar === "object") {
      return owner.avatar.url || "/placeholder.svg";
    }
    return "/placeholder.svg";
  };

  const getServiceType = (svc: ServiceListing): string => {
    if (svc.type && svc.type.length > 0) {
      const firstType = svc.type[0];
      return typeof firstType === "object" ? firstType.title || "" : "";
    }
    return "";
  };

  // Determine remove action and link paths
  const removeActionMap = {
    locations: "locatii",
    events: "evenimente",
    services: "servicii",
  } as const;

  const linkPathMap = {
    locations: "/locatii",
    events: "/evenimente",
    services: "/servicii",
  } as const;

  const linkTextMap = {
    locations: "Vezi detalii",
    events: "Vezi detalii",
    services: "Vezi profil",
  } as const;

  const removeType = removeActionMap[type];
  const linkPath = linkPathMap[type];
  const linkText = linkTextMap[type];

  // Service-specific: different layout with avatar
  if (type === "services") {
    const service = listing as ServiceListing;
    const avatarUrl = getServiceAvatar(service);
    const serviceType = getServiceType(service);
    const owner = typeof service.owner === "object" ? service.owner : null;
    const ownerName = owner?.displayName || service.title || "";

    return (
      <Card className="glass-card h-full flex flex-col">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl} alt={ownerName} />
              <AvatarFallback>
                {ownerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="ghost"
              className="text-red-500 hover:text-red-600"
              onClick={() => onRemove(service.id, removeType)}
              disabled={isRemoving}
            >
              <FaHeart className="h-4 w-4 fill-current" />
            </Button>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2">
              {service.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {serviceType && <Badge>{serviceType}</Badge>}
              {verified && (
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
          {rating.average > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <FaStar className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{rating.average.toFixed(1)}</span>
              <span className="text-muted-foreground">
                · {rating.count} recenzii
              </span>
            </div>
          )}
          {cityName && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <FaLocationDot className="h-4 w-4" />
              <span>{cityName}</span>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {service.slug && (
            <Button asChild className="w-full glow-on-hover">
              <Link href={`${linkPath}/${service.slug}`}>{linkText}</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Location and Event: similar layout with image header
  const imageUrl = getImageUrl(listing);
  const isLocation = type === "locations";
  const isEvent = type === "events";

  const locationType = isLocation
    ? getLocationType(listing as LocationListing)
    : "";
  const capacity = isLocation ? getCapacity(listing as LocationListing) : 0;
  const eventDate = isEvent ? getEventDate(listing as EventListing) : null;

  return (
    <Card className="glass-card overflow-hidden h-full flex flex-col">
      <CardHeader className="p-0 relative">
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={listing.title || ""}
            fill
            className="object-cover"
            loading="lazy"
          />
          {verified && (
            <Badge className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-sm">
              Verificat
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90 text-red-500"
            onClick={() => onRemove(listing.id, removeType)}
            disabled={isRemoving}
          >
            <FaHeart className="h-4 w-4 fill-current" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2">{listing.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {listing.description || ""}
        </p>
        <div
          className={
            isEvent
              ? "space-y-2 text-sm text-muted-foreground"
              : "flex flex-wrap gap-3 text-sm text-muted-foreground"
          }
        >
          {isEvent && eventDate?.date && (
            <>
              <div className="flex items-center gap-2">
                <FaCalendarDays className="h-4 w-4" />
                <span>
                  {eventDate.day && `${eventDate.day}, `}
                  {eventDate.date}
                </span>
              </div>
              {eventDate.time && (
                <div className="flex items-center gap-2">
                  <FaClock className="h-4 w-4" />
                  <span>{eventDate.time}</span>
                </div>
              )}
            </>
          )}
          {cityName && (
            <div className={`flex items-center ${isEvent ? "gap-2" : "gap-1"}`}>
              <FaLocationDot className="h-4 w-4" />
              <span>{cityName}</span>
            </div>
          )}
          {isLocation && capacity > 0 && (
            <div className="flex items-center gap-1">
              <FaUsers className="h-4 w-4" />
              <span>{capacity} persoane</span>
            </div>
          )}
          {isLocation && locationType && (
            <Badge variant="outline">{locationType}</Badge>
          )}
        </div>
        {rating.average > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <FaStar className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold">{rating.average.toFixed(1)}</span>
            <span className="text-muted-foreground">
              · {rating.count} recenzii
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {listing.slug && (
          <Button asChild className="w-full glow-on-hover">
            <Link href={`${linkPath}/${listing.slug}`}>{linkText}</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
