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
