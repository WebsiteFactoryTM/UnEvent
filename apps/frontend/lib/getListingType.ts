export const getListingTypeSlug = (listingType: string) => {
  const listingTypes = {
    evenimente: "events",
    locatii: "locations",
    servicii: "services",
  };
  return listingTypes[listingType as keyof typeof listingTypes];
};
