import { ListingType } from "@/types/listings";

export const getListingTypeSlug = (
  listingType: ListingType,
): "locations" | "events" | "services" => {
  const listingTypes = {
    evenimente: "events",
    locatii: "locations",
    servicii: "services",
  };
  return listingTypes[listingType as keyof typeof listingTypes] as
    | "locations"
    | "events"
    | "services";
};

/**
 * Convert backend collection slug to frontend listing type slug
 */
export const getFrontendListingTypeSlug = (
  backendSlug: "locations" | "events" | "services",
): ListingType => {
  const mapping = {
    locations: "locatii" as ListingType,
    events: "evenimente" as ListingType,
    services: "servicii" as ListingType,
  };
  return mapping[backendSlug];
};
