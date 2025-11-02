import { Event, Location, Service } from "./payload-types";

export type Listing = Event | Location | Service;

export type ListingType = "evenimente" | "locatii" | "servicii";

export type HomeListings = {
  featuredLocations: Partial<Location>[];
  topServices: Partial<Service>[];
  upcomingEvents: Partial<Event>[];
  newListings: Partial<Location>[];
};
