import React from "react";
import { FaTicket } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import type { Event, Location, Service } from "@/types/payload-types";

type EventPricing = Event["pricing"];
type LocationPricing = Location["pricing"];
type ServicePricing = Service["pricing"];

type Pricing = EventPricing | LocationPricing | ServicePricing;

interface PriceDisplayProps {
  listingType: "evenimente" | "servicii" | "locatii";
  pricing: Pricing;
  ticketUrl?: string | null;
}

const PriceDisplay = ({
  listingType,
  pricing,
  ticketUrl,
}: PriceDisplayProps) => {
  // Helper to get period label in Romanian
  const getPeriodLabel = (
    period: "hour" | "day" | "event" | null | undefined,
  ): string => {
    if (!period) return "";
    switch (period) {
      case "hour":
        return "oră";
      case "day":
        return "zi";
      case "event":
        return "eveniment";
      default:
        return "";
    }
  };

  // Format price text based on listing type
  const formatPriceText = (): string => {
    if (!pricing) return "";

    // Handle "contact" type (same for all listing types)
    if (pricing.type === "contact") {
      return "La cerere";
    }

    // Handle events pricing
    if (listingType === "evenimente") {
      const eventPricing = pricing as EventPricing;
      if (eventPricing.type === "free") {
        return "Gratuit";
      }
      if (eventPricing.type === "paid" && eventPricing.amount) {
        return `${eventPricing.amount} ${eventPricing.currency || "RON"}`;
      }
      return "";
    }

    // Handle locations and services pricing
    if (listingType === "locatii" || listingType === "servicii") {
      const locationServicePricing = pricing as
        | LocationPricing
        | ServicePricing;

      if (!locationServicePricing.amount) {
        return "";
      }

      const prefix = locationServicePricing.type === "from" ? "de la " : "";
      const amount = `${prefix}${locationServicePricing.amount} ${locationServicePricing.currency || "RON"}`;
      const period = getPeriodLabel(locationServicePricing.period);

      return period ? `${amount} / ${period}` : amount;
    }

    return "";
  };

  const priceText = formatPriceText();
  const label = listingType === "evenimente" ? "Acces" : "Preț";

  // Don't render if no pricing information
  if (!pricing || (!priceText && pricing.type !== "contact")) {
    return null;
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex gap-2 items-center">
        <FaTicket className="h-5 w-5 text-muted-foreground mt-0.5" />
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{priceText}</p>
        {/* {listingType === "evenimente" && ticketUrl && (
          <Button asChild variant="ghost" size="sm" className="mt-2">
            <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
              Cumpără bilet
            </a>
          </Button>
        )} */}
      </div>
    </div>
  );
};

export default PriceDisplay;
