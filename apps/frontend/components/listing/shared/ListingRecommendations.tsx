"use client";

import type { ListingType } from "@/types/listings";
import EventRecommendations from "@/components/listing/event/EventRecommendations";
import { LocationRecommendations } from "@/components/listing/location/LocationRecommendations";
import ServiceRecommendations from "@/components/listing/service/ServiceRecommendations";

export function ListingRecommendations({
  type,
  data,
  similar,
}: {
  type: ListingType;
  data: any;
  similar: any[];
}) {
  if (type === "evenimente") {
    const cityName =
      typeof data?.city === "object" && data?.city ? data.city.name : "România";
    return <EventRecommendations cityName={cityName} similarEvents={similar} />;
  }
  if (type === "locatii")
    return (
      <LocationRecommendations
        currentLocation={data}
        similarLocations={similar}
      />
    );
  return <ServiceRecommendations service={data} similarServices={similar} />;
}
