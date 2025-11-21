"use client";

import { useMemo } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import type { LocationListing } from "@/types/listings";
import Link from "next/link";
import { UniversalMap } from "@/components/common/UniversalMap";
import type { City } from "@/types/payload-types";

interface ListingMapProps {
  cityName: string;
  venue?: LocationListing;
  address: string;
  geo?: { lat: number; lon: number };
  city?: City;
}

export const ListingMap = ({
  cityName,
  venue,
  address,
  geo,
  city,
}: ListingMapProps) => {
  // Prepare markers based on whether we have geo coordinates
  const markers = useMemo(() => {
    if (geo?.lat && geo?.lon) {
      return [
        {
          id: "listing",
          title: venue?.title || address || "Locație",
          latitude: geo.lat,
          longitude: geo.lon,
          detailPath: venue ? `/locatii/${venue.slug}` : "#",
        },
      ];
    }
    return [];
  }, [geo, venue, address]);

  // Map center: use listing coords if available, otherwise city coords or default
  const mapCenter = useMemo(() => {
    if (geo?.lat && geo?.lon) {
      return { lat: geo.lat, lng: geo.lon };
    }
    // PayloadCMS stores geo as [lat, lng]
    if (city?.geo && Array.isArray(city.geo) && city.geo.length === 2) {
      return { lat: city.geo[0], lng: city.geo[1] };
    }
    // Default to Romania center
    return { lat: 45.9432, lng: 24.9668 };
  }, [geo, city]);

  return (
    <div className="glass-card p-6 space-y-4">
      <h2 className="text-2xl font-bold">Locație & Adresă</h2>

      <div className="space-y-4">
        {venue && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 wrap-break-words">
              Locația evenimentului:
            </p>
            <Link href={`/locatii/${venue.slug}`}>
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-sm sm:text-base text-left wrap-break-words whitespace-normal"
              >
                {venue.title}
              </Button>
            </Link>
          </div>
        )}

        <div className="flex items-start gap-3">
          <FaLocationDot className="h-5 w-5 text-muted-foreground mt-1" />
          <div>
            <p className="font-medium">{address || "Adresă nedisponibilă"}</p>
            <p className="text-sm text-muted-foreground">{cityName}</p>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-lg overflow-hidden border border-border">
          <UniversalMap
            markers={markers}
            center={mapCenter}
            zoom={geo?.lat && geo?.lon ? 15 : 12}
            initialCenter={mapCenter}
            initialZoom={geo?.lat && geo?.lon ? 15 : 12}
          />
        </div>
      </div>
    </div>
  );
};
