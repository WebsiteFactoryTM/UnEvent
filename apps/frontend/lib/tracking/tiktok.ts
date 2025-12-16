/**
 * TikTok Pixel Tracking Utilities
 *
 * Functions for tracking events with rich metadata for
 * TikTok advertising and analytics
 */

import type { CustomData, TrackingContext } from "@/types/tracking";

// TikTok user data structure
export interface TikTokUserData {
  email?: string; // Hashed email
  phone?: string; // Hashed phone number
  first_name?: string; // Hashed first name
  last_name?: string; // Hashed last name
  city?: string; // City name
  state?: string; // State name
  zip?: string; // Postal code
  country?: string; // Country code, e.g., "US"
  client_user_agent?: string; // Browser's user agent
  ip?: string; // IP address of the user
}

// TikTok user data structure with hashed fields
export interface TikTokUserDataHashed {
  email?: string; // Hashed email
  phone?: string; // Hashed phone number
  first_name?: string; // Hashed first name
  last_name?: string; // Hashed last name
  city?: string; // City name (can be left as plain text)
  state?: string; // State name (can be left as plain text)
  zip?: string; // Postal code (can be left as plain text)
  country?: string; // Country code (can be left as plain text)
  client_user_agent?: string; // Browser's user agent
  ip?: string; // IP address of the user
}

// TikTok event-specific data
export interface TikTokCustomData {
  currency?: string; // Currency, e.g., "USD"
  value?: number; // Total value of the event
  content_name?: string; // Name of the content
  content_type?: string;
  content_category?: string; // Category of the content
  content_ids?: string[]; // IDs of the content (e.g., product IDs)
  contents?: Array<{ id: string; quantity: number; item_price: number }>; // Array of content details
  num_items?: number; // Number of items involved in the event
  search_string?: string; // Search string in a Search event
  order_id?: string; // Order ID for purchase
  item_number?: string; // Item number in order
  status?: string; // Status of the event
  description?: string; // Description of the event
  query?: string; // Query for search
}

export type TikTokEventName =
  | "ViewContent"
  | "AddToCart"
  | "CompletePayment"
  | "Search"
  | "Subscribe"
  | "InitiateCheckout"
  | "PlaceAnOrder";

/**
 * Track page view
 */
export const trackTikTokPageView = () => {
  if (typeof window === "undefined" || !window.ttq) return;

  window.ttq.page();
};

/**
 * Generic event tracking
 */
export const trackTikTokEvent = (
  eventName: string,
  params?: TikTokCustomData,
) => {
  if (typeof window === "undefined" || !window.ttq) return;

  window.ttq.track(eventName, params);
};

/**
 * Track listing view with rich metadata
 */
export const trackTikTokViewContent = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.ttq) return;

  const {
    listing_id,
    listing_type,
    listing_slug,
    value,
    currency,
    content_name,
    content_category,
    content_ids,
  } = data;

  window.ttq.track("ViewContent", {
    content_name: content_name || listing_slug || "",
    content_ids: content_ids || (listing_id ? [String(listing_id)] : []),
    content_type: content_category || listing_type || "product",
    content_category: listing_type,
    value: value || 0,
    currency: currency || "RON",
  });
};

/**
 * Track search
 */
export const trackTikTokSearch = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.ttq) return;

  const { search_term, search_string, listing_type } = data;

  window.ttq.track("Search", {
    query: search_term || search_string || "",
    content_category: listing_type,
  });
};

/**
 * Track lead generation (sign up)
 */
export const trackTikTokLead = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.ttq) return;

  // Use Subscribe for leads/registrations
  window.ttq.track("Subscribe", {
    content_name: "Lead Generation",
  });
};

/**
 * Track listing submission
 */
export const trackTikTokAddListing = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.ttq) return;

  const { listing_id, listing_type, listing_slug, value, currency } = data;

  // Use PlaceAnOrder or InitiateCheckout for listing submission
  window.ttq.track("PlaceAnOrder", {
    content_ids: listing_id ? [String(listing_id)] : [],
    content_name: listing_slug,
    content_type: listing_type,
    value: value || 0,
    currency: currency || "RON",
  });
};

/**
 * Track add to favorites/wishlist
 */
export const trackTikTokAddToWishlist = (
  data: CustomData & TrackingContext,
) => {
  if (typeof window === "undefined" || !window.ttq) return;

  const {
    listing_id,
    listing_type,
    listing_slug,
    value,
    currency,
    content_name,
    content_ids,
  } = data;

  // Map to AddToCart as a close equivalent for intent
  window.ttq.track("AddToCart", {
    content_ids: content_ids || (listing_id ? [String(listing_id)] : []),
    content_name: content_name || listing_slug,
    content_type: listing_type,
    value: value || 0,
    currency: currency || "RON",
  });
};

/**
 * Track contact actions
 */
export const trackTikTokContact = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.ttq) return;

  const { contact_method, listing_id, listing_type, listing_slug } = data;

  // Custom event for Contact or map to ViewContent/Subscribe?
  // Since 'Contact' is not in the strict list provided, we'll try to use a custom name
  // but if strict typing is enforced by the lib (it's not here), we'd need to add it.
  // The provided script allows arbitrary strings in `track`.
  window.ttq.track("Contact", {
    content_name: listing_slug,
    content_type: listing_type,
    content_ids: listing_id ? [String(listing_id)] : [],
    description: contact_method,
  });
};
