import EventHero from "@/components/listing/event/EventHero";
import { LocationHero } from "@/components/listing/location/LocationHero";
import ServiceHero from "@/components/listing/service/ServiceHero";

import { Listing, ListingType } from "@/types/listings";
import { Event, Location, Service } from "@/types/payload-types";

export function ListingHero({
  listingType,
  listing,
}: {
  listingType: ListingType;
  listing: Listing;
}) {
  let hero = null;

  if (listingType === "evenimente") {
    hero = <EventHero event={listing as Event} />;
  } else if (listingType === "locatii") {
    hero = <LocationHero location={listing as Location} />;
  } else if (listingType === "servicii") {
    hero = <ServiceHero service={listing as Service} />;
  }

  return hero;
}
