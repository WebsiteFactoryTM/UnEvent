"use client";

import type { ListingType } from "@/types/listings";
import { City, ListingType as SuitableForType } from "@/types/payload-types";
import EventRecommendations from "@/components/listing/event/EventRecommendations";
import { LocationRecommendations } from "@/components/listing/location/LocationRecommendations";
import ServiceRecommendations from "@/components/listing/service/ServiceRecommendations";

export function ListingRecommendations({
  typeRecommendations,
  city,
  suitableFor,
}: {
  typeRecommendations: ListingType;
  city: City;
  suitableFor: (number | SuitableForType)[];
}) {
  // console.log("city", city);
  // console.log("suitableFor", suitableFor);
  // console.log("typeRecommendations", typeRecommendations);

  return (
    <div>
      <h2>Recomandări</h2>
    </div>
  );
}
