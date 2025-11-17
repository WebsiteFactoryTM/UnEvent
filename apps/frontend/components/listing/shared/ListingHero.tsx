import EventHero from "@/components/listing/event/EventHero";
import { LocationHero } from "@/components/listing/location/LocationHero";
import ServiceHero from "@/components/listing/service/ServiceHero";

import {
  Listing,
  ListingType,
  LocationListing,
  EventListing,
  ServiceListing,
} from "@/types/listings";

export function ListingHero({
  listingType,
  listing,
}: {
  listingType: ListingType;
  listing: Listing;
}) {
  let hero = null;

  if (listingType === "evenimente") {
    hero = <EventHero event={listing as EventListing} />;
  } else if (listingType === "locatii") {
    hero = <LocationHero location={listing as LocationListing} />;
  } else if (listingType === "servicii") {
    hero = <ServiceHero service={listing as ServiceListing} />;
  }

  return hero;
}
