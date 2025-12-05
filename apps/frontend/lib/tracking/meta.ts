/**
 * Meta/Facebook Pixel Tracking Utilities
 *
 * Functions for tracking events with rich metadata for
 * Facebook advertising and analytics
 */

import type { CustomData, TrackingContext } from "@/types/tracking";

/**
 * Track page view
 */
export const trackMetaPageView = () => {
  if (typeof window === "undefined" || !window.fbq) return;

  window.fbq("track", "PageView");
};

/**
 * Generic event tracking
 */
export const trackMetaEvent = (
  eventName: string,
  params?: CustomData & TrackingContext,
) => {
  if (typeof window === "undefined" || !window.fbq) return;

  window.fbq("track", eventName, params);
};

/**
 * Track custom event
 */
export const trackMetaCustomEvent = (
  eventName: string,
  params?: CustomData & TrackingContext,
) => {
  if (typeof window === "undefined" || !window.fbq) return;

  window.fbq("trackCustom", eventName, params);
};

/**
 * Track listing view with rich metadata
 */
export const trackMetaViewContent = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.fbq) return;

  const {
    listing_id,
    listing_type,
    listing_slug,
    city_name,
    owner_id,
    value,
    currency,
    content_name,
    content_category,
    content_ids,
  } = data;

  window.fbq("track", "ViewContent", {
    content_name: content_name || listing_slug || "",
    content_ids: content_ids || (listing_id ? [String(listing_id)] : []),
    content_type: content_category || listing_type || "product",
    content_category: listing_type,
    value,
    currency: currency || "RON",
    // Custom parameters
    listing_id,
    listing_type,
    city_name,
    owner_id,
  });
};

/**
 * Track search
 */
export const trackMetaSearch = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.fbq) return;

  const { search_term, search_string, listing_type, city_name, filters } = data;

  window.fbq("track", "Search", {
    search_string: search_term || search_string || "",
    content_category: listing_type,
    listing_type,
    city_name,
    filters,
  });
};

/**
 * Track lead generation (sign up)
 */
export const trackMetaLead = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.fbq) return;

  const { user_id, profile_id, selected_roles, registration_method } = data;

  window.fbq("track", "Lead", {
    user_id,
    profile_id,
    selected_roles: selected_roles?.join(",") || "",
    registration_method: registration_method || "email",
  });
};

/**
 * Track complete registration
 */
export const trackMetaCompleteRegistration = (
  data: CustomData & TrackingContext,
) => {
  if (typeof window === "undefined" || !window.fbq) return;

  const { user_id, profile_id, selected_roles, registration_method } = data;

  window.fbq("track", "CompleteRegistration", {
    user_id,
    profile_id,
    selected_roles: selected_roles?.join(",") || "",
    registration_method: registration_method || "email",
    status: "completed",
  });
};

/**
 * Track listing submission
 */
export const trackMetaAddListing = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.fbq) return;

  const {
    listing_id,
    listing_type,
    listing_slug,
    city_name,
    owner_id,
    user_id,
    value,
    currency,
  } = data;

  // Use SubmitApplication as closest standard event
  window.fbq("track", "SubmitApplication", {
    listing_id,
    listing_type,
    listing_slug,
    city_name,
    owner_id: owner_id || user_id,
    user_id,
    value,
    currency: currency || "RON",
  });
};

/**
 * Track add to favorites/wishlist
 */
export const trackMetaAddToWishlist = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.fbq) return;

  const {
    listing_id,
    listing_type,
    listing_slug,
    owner_id,
    city_name,
    user_id,
    value,
    currency,
    content_name,
    content_ids,
  } = data;

  window.fbq("track", "AddToWishlist", {
    content_ids: content_ids || (listing_id ? [String(listing_id)] : []),
    content_name: content_name || listing_slug,
    content_category: listing_type,
    value,
    currency: currency || "RON",
    // Custom parameters
    listing_id,
    listing_type,
    owner_id,
    city_name,
    user_id,
  });
};

/**
 * Track remove from wishlist
 */
export const trackMetaRemoveFromWishlist = (
  data: CustomData & TrackingContext,
) => {
  if (typeof window === "undefined" || !window.fbq) return;

  const { listing_id, listing_type, listing_slug, owner_id, user_id } = data;

  // Custom event for remove action
  window.fbq("trackCustom", "RemoveFromWishlist", {
    listing_id,
    listing_type,
    listing_slug,
    owner_id,
    user_id,
  });
};

/**
 * Track contact actions
 */
export const trackMetaContact = (data: CustomData & TrackingContext) => {
  if (typeof window === "undefined" || !window.fbq) return;

  const {
    contact_method,
    listing_id,
    listing_type,
    listing_slug,
    owner_id,
    city_name,
    user_id,
  } = data;

  window.fbq("track", "Contact", {
    contact_type: contact_method || "unknown",
    listing_id,
    listing_type,
    listing_slug,
    owner_id,
    city_name,
    user_id,
  });
};
