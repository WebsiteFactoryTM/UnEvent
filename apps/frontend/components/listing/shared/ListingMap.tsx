"use client";

import { useMemo } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import type { LocationListing } from "@/types/listings";
import Link from "next/link";
import { GoogleMap } from "@/components/common/GoogleMaps";
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
  // Prepare map items based on whether we have geo coordinates
  const mapItems = useMemo(() => {
    const items = [];

    // If we have geo coordinates for the listing, add it as a marker
    if (geo?.lat && geo?.lon) {
      items.push({
        id: "listing",
        title: venue?.title || address || "Locație",
        latitude: geo.lat,
        longitude: geo.lon,
        detailPath: venue ? `/locatii/${venue.slug}` : "#",
      });
    }

    return items;
  }, [geo, venue, address]);

  // Map center: use listing coords if available, otherwise city coords or default
  const mapCenter = useMemo(() => {
    if (geo?.lat && geo?.lon) {
      return { lat: geo.lat, lng: geo.lon };
    }
    // Backend geo is [lon, lat]; Google expects { lat, lng }
    if (city?.geo && Array.isArray(city.geo) && city.geo.length === 2) {
      return { lat: city.geo[1], lng: city.geo[0] };
    }
    // Default to Romania center
    return { lat: 45.9432, lng: 24.9668 };
  }, [geo, city]);

  // Prepare cities data for the map
  const cities = useMemo(() => {
    if (!city) return [];
    return [
      {
        id: city.id.toString(),
        name: city.name || "",
        slug: city.slug || "",
        // Backend geo is [lon, lat]; Google expects { lat, lng }
        lat: typeof city.geo?.[1] === "number" ? city.geo[1] : null,
        lng: typeof city.geo?.[0] === "number" ? city.geo[0] : null,
      },
    ];
  }, [city]);

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

        {/* Google Map */}
        <div className="rounded-lg overflow-hidden border border-border">
          <GoogleMap
            items={mapItems}
            center={mapCenter}
            zoom={geo?.lat && geo?.lon ? 15 : 12}
            autoFitBounds={false}
            selectedCitySlug={city?.slug || ""}
            cities={cities}
          />
        </div>
      </div>
    </div>
  );
};
