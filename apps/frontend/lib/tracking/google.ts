/**
 * Google Analytics 4 Tracking Utilities
 *
 * Functions for tracking events with rich metadata for per-user
 * and per-listing analytics dashboards
 */

import type { CustomData, TrackingContext } from "@/types/tracking";

/**
 * Track page view with user and page context
 */
export const trackGooglePageView = (context: TrackingContext = {}) => {
  if (typeof window === "undefined" || !window.gtag) return;

  try {
    const { user_id, profile_id, page_location, page_title, ...rest } = context;

    window.gtag("event", "page_view", {
      page_location: page_location || window.location.href,
      page_title: page_title || document.title,
      user_id,
      profile_id,
      ...rest,
    });
  } catch (error) {
    console.warn("[Tracking] Google page view error:", error);
  }
};

/**
 * Generic event tracking with custom parameters
 */
export const trackGoogleEvent = (
  eventName: string,
  params?: CustomData & TrackingContext,
) => {
  if (typeof window === "undefined" || !window.gtag) return;

  try {
    window.gtag("event", eventName, params);
  } catch (error) {
    console.warn("[Tracking] Google event error:", error);
  }
};

/**
 * Track listing view with rich metadata
 */
export const trackGoogleViewContent = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.gtag) return;

  try {
    const {
      listing_id,
      listing_type,
      listing_slug,
      city_name,
      city_id,
      owner_id,
      owner_slug,
      value,
      currency,
      user_id,
      profile_id,
      content_name,
      content_category,
    } = data;

    window.gtag("event", "view_item", {
      page_location: window.location.href,
      // User context
      user_id,
      profile_id,
      // Listing context
      listing_id,
      listing_type,
      listing_slug,
      city_name,
      city_id,
      owner_id,
      owner_slug,
      // Content details
      content_name: content_name || listing_slug,
      content_category: content_category || listing_type,
      value,
      currency: currency || "RON",
      items: data.contents || [],
    });
  } catch (error) {
    console.warn("[Tracking] Google view content error:", error);
  }
};

/**
 * Track search with filters and context
 */
export const trackGoogleSearch = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.gtag) return;

  try {
    const {
      search_term,
      search_string,
      listing_type,
      city_name,
      filters,
      user_id,
      profile_id,
    } = data;

    window.gtag("event", "search", {
      page_location: window.location.href,
      search_term: search_term || search_string || "",
      listing_type,
      city_name,
      filters,
      user_id,
      profile_id,
    });
  } catch (error) {
    console.warn("[Tracking] Google search error:", error);
  }
};

/**
 * Track lead generation (sign up)
 */
export const trackGoogleLead = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.gtag) return;

  try {
    const { user_id, profile_id, selected_roles, registration_method } = data;

    window.gtag("event", "generate_lead", {
      page_location: window.location.href,
      user_id,
      profile_id,
      selected_roles: selected_roles?.join(",") || "",
      registration_method: registration_method || "email",
    });
  } catch (error) {
    console.warn("[Tracking] Google lead error:", error);
  }
};

/**
 * Track listing submission
 */
export const trackGoogleAddListing = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.gtag) return;

  try {
    const {
      listing_id,
      listing_type,
      listing_slug,
      city_name,
      city_id,
      owner_id,
      user_id,
      profile_id,
      value,
      currency,
    } = data;

    window.gtag("event", "add_listing", {
      page_location: window.location.href,
      listing_id,
      listing_type,
      listing_slug,
      city_name,
      city_id,
      owner_id: owner_id || user_id,
      user_id,
      profile_id,
      value,
      currency: currency || "RON",
    });
  } catch (error) {
    console.warn("[Tracking] Google add listing error:", error);
  }
};

/**
 * Track add to favorites/wishlist
 */
export const trackGoogleAddToWishlist = (
  data: CustomData & TrackingContext,
) => {
  if (typeof window === "undefined" || !window.gtag) return;

  try {
    const {
      listing_id,
      listing_type,
      listing_slug,
      owner_id,
      city_name,
      user_id,
      profile_id,
      value,
      currency,
      content_name,
    } = data;

    window.gtag("event", "add_to_wishlist", {
      page_location: window.location.href,
      listing_id,
      listing_type,
      listing_slug,
      owner_id,
      city_name,
      user_id,
      profile_id,
      content_name: content_name || listing_slug,
      value,
      currency: currency || "RON",
      items: data.contents || [],
    });
  } catch (error) {
    console.warn("[Tracking] Google add to wishlist error:", error);
  }
};

/**
 * Track remove from favorites/wishlist
 */
export const trackGoogleRemoveFromWishlist = (
  data: CustomData & TrackingContext,
) => {
  if (typeof window === "undefined" || !window.gtag) return;

  try {
    const {
      listing_id,
      listing_type,
      listing_slug,
      owner_id,
      user_id,
      profile_id,
    } = data;

    window.gtag("event", "remove_from_wishlist", {
      page_location: window.location.href,
      listing_id,
      listing_type,
      listing_slug,
      owner_id,
      user_id,
      profile_id,
    });
  } catch (error) {
    console.warn("[Tracking] Google remove from wishlist error:", error);
  }
};

/**
 * Track contact actions
 */
export const trackGoogleContact = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.gtag) return;

  try {
    const {
      contact_method,
      listing_id,
      listing_type,
      listing_slug,
      owner_id,
      city_name,
      user_id,
      profile_id,
    } = data;

    window.gtag("event", "contact", {
      page_location: window.location.href,
      method: contact_method || "unknown",
      listing_id,
      listing_type,
      listing_slug,
      owner_id,
      city_name,
      user_id,
      profile_id,
    });
  } catch (error) {
    console.warn("[Tracking] Google contact error:", error);
  }
};

/**
 * Track filter/refine results
 */
export const trackGoogleFilterResults = (
  data: CustomData & TrackingContext,
) => {
  if (typeof window === "undefined" || !window.gtag) return;

  try {
    const { filters, listing_type, city_name, user_id, profile_id } = data;

    window.gtag("event", "filter_results", {
      page_location: window.location.href,
      filters,
      listing_type,
      city_name,
      user_id,
      profile_id,
    });
  } catch (error) {
    console.warn("[Tracking] Google filter results error:", error);
  }
};
