import { FaLocationDot, FaMapLocationDot } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import type { LocationListing } from "@/types/listings";
import Link from "next/link";

interface ListingMapProps {
  cityName: string;
  venue?: LocationListing;
  address: string;
}

export const ListingMap = ({ cityName, venue, address }: ListingMapProps) => {
  // const cityName =
  //   typeof data.city === "object" && data.city ? data.city.name : "";
  // const venue =
  //   typeof (data as Event).venue === "object" ? ((data as Event).venue as Location) : null;

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

        {/* Map placeholder */}
        <div className="aspect-video rounded-lg bg-muted/30 border border-border flex items-center justify-center">
          <div className="text-center space-y-2">
            <FaMapLocationDot className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Hartă interactivă (în curând)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
