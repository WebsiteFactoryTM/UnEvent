/**
 * Tracking Types
 *
 * TypeScript types for Google Analytics and Meta Pixel tracking
 * with rich metadata support for per-user and per-listing analytics
 */

// User context from NextAuth session
export interface UserContext {
  user_id?: string;
  profile_id?: string | number;
  email?: string;
}

// Listing context for tracking
export interface ListingContext {
  listing_id?: number;
  listing_type?: "evenimente" | "locatii" | "servicii";
  listing_slug?: string;
  city_name?: string;
  city_id?: number;
  owner_id?: string | number;
  owner_slug?: string;
  price?: number;
  currency?: string;
}

// Complete tracking context combining user and listing data
export interface TrackingContext extends UserContext, ListingContext {
  page_location?: string;
  page_title?: string;
}

// Custom data for events with rich metadata
export interface CustomData {
  // Listing details
  listing_id?: number;
  listing_type?: "evenimente" | "locatii" | "servicii";
  listing_slug?: string;

  // Location/City
  city_name?: string;
  city_id?: number;

  // Owner/Provider
  owner_id?: string | number;
  owner_slug?: string;

  // Pricing
  value?: number;
  currency?: string;
  price?: number;

  // Content details
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  contents?: Array<{
    id: string;
    quantity?: number;
    item_price?: number;
    item_name?: string;
  }>;

  // Search/Filter
  search_string?: string;
  search_term?: string;
  filters?: string;

  // User action details
  contact_method?: "phone" | "message" | "directions" | "website" | "email";
  selected_roles?: string[];
  registration_method?: string;

  // General
  num_items?: number;
  [key: string]: any;
}

// All trackable event types
export type EventType =
  | "pageView"
  | "viewContent"
  | "search"
  | "lead"
  | "addListing"
  | "addToFavorites"
  | "removeFromFavorites"
  | "contactClick"
  | "filterSearch"
  | "custom";

// Tracking event structure
export interface TrackingEvent {
  eventType: EventType;
  eventName?: string;
  customData?: CustomData;
}

// Window extensions for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}
