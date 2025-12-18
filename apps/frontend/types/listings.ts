import { Event, Location, Service } from "./payload-types";

// Extend listing types to include 'status' as an alias for 'moderationStatus'
// This maintains backward compatibility with frontend code

export type LocationListing = Location & {
  status: "pending" | "approved" | "rejected" | "draft";
};

export type EventListing = Event & {
  status: "pending" | "approved" | "rejected" | "draft";
};

export type ServiceListing = Service & {
  status: "pending" | "approved" | "rejected" | "draft";
};

export type Listing = EventListing | LocationListing | ServiceListing;

export type ListingType = "evenimente" | "locatii" | "servicii";

export type HomeListings = {
  featuredLocations: Partial<LocationListing>[];
  topServices: Partial<ServiceListing>[];
  upcomingEvents: Partial<EventListing>[];
  newListings: Partial<LocationListing>[];
};

export type CardItem = {
  listingId: number;
  slug: string;
  title: string;
  cityLabel: string;
  imageUrl: string | undefined;
  verified: boolean;
  ratingAvg: number | undefined;
  ratingCount: number | undefined;
  type: string;
  startDate: string | undefined;
  capacity: number;
  tier: "new" | "standard" | "sponsored" | "recommended" | null | undefined;
  geo?: [number, number] | null;
  description?: string | null;
  description_rich?: (Location | Event | Service)["description_rich"];
};
