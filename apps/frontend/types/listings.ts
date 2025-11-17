import { Event, Location, Service } from "./payload-types";

// Extend listing types to include 'status' as an alias for 'moderationStatus'
// This maintains backward compatibility with frontend code
export type Listing = (Event | Location | Service) & {
  status: "pending" | "approved" | "rejected" | "draft";
};

export type ListingType = "evenimente" | "locatii" | "servicii";

export type HomeListings = {
  featuredLocations: Partial<Location>[];
  topServices: Partial<Service>[];
  upcomingEvents: Partial<Event>[];
  newListings: Partial<Location>[];
};
