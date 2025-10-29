import { Event, Location, Service } from "./payload-types";

export type Listing = Event | Location | Service;

export type ListingType = "evenimente" | "locatii" | "servicii";
