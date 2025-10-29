"use client";

import type { ListingType } from "@/types/listings";
import { EventOrganizerCard } from "@/components/listing/event/EventOrganizerCard";
import { LocationHostCard } from "@/components/listing/location/LocationHostCard";
import ServiceProviderCard from "@/components/listing/service/ServiceProviderCard";
import { Listing } from "@/types/listings";
import { Event, Location, Service } from "@/types/payload-types";

export function ListingProviderCard({
  type,
  listing,
}: {
  type: ListingType;
  listing: Listing;
}) {
  if (type === "evenimente")
    return <EventOrganizerCard event={listing as Event} />;
  if (type === "locatii")
    return <LocationHostCard location={listing as Location} />;
  return <ServiceProviderCard service={listing as Service} />;
}
