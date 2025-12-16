/**
 * Tracking Helper Utilities
 *
 * Helper functions for building tracking contexts and managing consent
 */

import type { Session } from "next-auth";
import type {
  TrackingContext,
  UserContext,
  ListingContext,
  CustomData,
} from "@/types/tracking";

/**
 * Build user context from NextAuth session
 */
export const buildUserContext = (session: Session | null): UserContext => {
  if (!session?.user) {
    return {};
  }

  return {
    user_id: session.user.id,
    profile_id: session.user.profile,
    email: session.user.email || undefined,
  };
};

/**
 * Build listing context from listing data
 */
export const buildListingContext = (listing: any): ListingContext => {
  if (!listing) {
    return {};
  }

  const cityName =
    typeof listing.city === "object" ? listing.city?.name : undefined;
  const cityId =
    typeof listing.city === "object" ? listing.city?.id : listing.city;

  const ownerId =
    typeof listing.owner === "object" ? listing.owner?.id : listing.owner;
  const ownerSlug =
    typeof listing.owner === "object" ? listing.owner?.slug : undefined;

  return {
    listing_id: listing.id,
    listing_type: listing._type || listing.type,
    listing_slug: listing.slug,
    city_name: cityName,
    city_id: cityId,
    owner_id: ownerId,
    owner_slug: ownerSlug,
    price: listing.price?.amount || listing.price,
    currency: listing.price?.currency || "RON",
  };
};

/**
 * Build complete tracking context
 */
export const buildTrackingContext = (
  session: Session | null,
  listing?: any,
  additionalData?: Partial<TrackingContext>,
): TrackingContext => {
  return {
    ...buildUserContext(session),
    ...(listing ? buildListingContext(listing) : {}),
    page_location: typeof window !== "undefined" ? window.location.href : "",
    page_title: typeof window !== "undefined" ? document.title : "",
    ...additionalData,
  };
};

/**
 * Merge custom data with tracking context
 */
export const mergeTrackingData = (
  context: TrackingContext,
  customData?: CustomData,
): CustomData & TrackingContext => {
  return {
    ...context,
    ...customData,
  };
};

/**
 * Check if we're in development mode for debug logging
 */
export const isDebugMode = (): boolean => {
  return process.env.NODE_ENV === "development";
};

/**
 * Log tracking event in development mode
 */
export const debugTrackingEvent = (
  platform: "Google" | "Meta" | "TikTok",
  eventName: string,
  data?: any,
) => {
  if (isDebugMode() && typeof console !== "undefined") {
    console.log(`[${platform} Tracking]`, eventName, data);
  }
};
