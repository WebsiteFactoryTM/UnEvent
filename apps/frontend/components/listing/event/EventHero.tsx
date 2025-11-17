import { Badge } from "@/components/ui/badge";
import { FaStar, FaCalendar, FaTicket, FaUsers } from "react-icons/fa6";
import type { EventListing } from "@/types/listings";
import { ListingActions } from "../shared/ListingActions";

interface EventHeroProps {
  event: EventListing;
}

export default function EventHero({ event }: EventHeroProps) {
  const cityName =
    typeof event?.city === "object" ? event?.city?.name : "România";
  const eventType =
    Array.isArray(event?.type) && event?.type?.length > 0
      ? typeof event?.type[0] === "object"
        ? event?.type[0]?.title
        : "Eveniment"
      : "Eveniment";

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: event?.allDayEvent ? undefined : "2-digit",
      minute: event?.allDayEvent ? undefined : "2-digit",
    });
  };

  const priceText =
    event?.pricing?.type === "free"
      ? "Gratuit"
      : event?.pricing?.type === "contact"
        ? "La cerere"
        : `${event?.pricing?.amount} ${event?.pricing?.currency || "RON"}`;

  return (
    <div className="glass-card p-4 sm:p-6 space-y-6">
      {/* Title and badges */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance">
            {event?.title}
          </h1>
          <div className="flex gap-2 shrink-0">
            {event?.moderationStatus === "approved" && (
              <Badge className="bg-green-500/90 backdrop-blur-sm">
                Verificat
              </Badge>
            )}
            {event?.tier === "recommended" && (
              <Badge className="bg-blue-500/90 backdrop-blur-sm">
                Recomandat
              </Badge>
            )}
          </div>
        </div>

        {/* Rating and meta */}

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {event?.rating && event?.reviewCount ? (
            <div className="flex items-center gap-1">
              <FaStar className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{event?.rating}</span>
              <span className="text-muted-foreground">
                · {event?.reviewCount} recenzii
              </span>
            </div>
          ) : null}
          <span className="text-muted-foreground">{cityName}</span>
          <span className="text-muted-foreground">{eventType}</span>
          <span className="font-semibold text-foreground">{priceText}</span>
        </div>
      </div>

      {/* Event details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex items-start gap-3">
          <FaCalendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Data și ora</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(event?.startDate)}
            </p>
            {event?.endDate && (
              <p className="text-sm text-muted-foreground">
                până la {formatDate(event?.endDate)}
              </p>
            )}
          </div>
        </div>

        {event?.capacity && (
          <div className="flex items-start gap-3">
            <FaUsers className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Capacitate</p>
              <p className="text-sm text-muted-foreground">
                {event?.capacity?.total} locuri
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <FaTicket className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Acces</p>
            <p className="text-sm text-muted-foreground">{priceText}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <ListingActions
        listingType="evenimente"
        title={event?.title}
        id={event?.id}
        description={event?.description ?? ""}
        isFavoritedByViewer={event?.isFavoritedByViewer ?? false}
      />
    </div>
  );
}
