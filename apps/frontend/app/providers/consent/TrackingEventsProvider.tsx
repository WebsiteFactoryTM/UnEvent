"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { useConsent } from "./ConsentContext";
import type { EventType, CustomData, TrackingContext } from "@/types/tracking";
import { trackTikTokContact } from "@/lib/tracking/tiktok";
import {
  trackGooglePageView,
  trackGoogleEvent,
  trackGoogleViewContent,
  trackGoogleSearch,
  trackGoogleLead,
  trackGoogleAddListing,
  trackGoogleAddToWishlist,
  trackGoogleRemoveFromWishlist,
  trackGoogleContact,
  trackGoogleFilterResults,
} from "@/lib/tracking/google";
import {
  trackMetaPageView,
  trackMetaEvent,
  trackMetaViewContent,
  trackMetaSearch,
  trackMetaLead,
  trackMetaCompleteRegistration,
  trackMetaAddListing,
  trackMetaAddToWishlist,
  trackMetaRemoveFromWishlist,
  trackMetaContact,
} from "@/lib/tracking/meta";
import {
  buildTrackingContext,
  mergeTrackingData,
  debugTrackingEvent,
} from "@/lib/tracking/helpers";

/**
 * TrackingEventsProvider
 *
 * Provides unified tracking interface for all components.
 * Automatically includes user and session context in all events.
 */

interface TrackingEventsContextType {
  trackEvent: (
    eventType: EventType,
    eventName?: string,
    customData?: CustomData,
  ) => void;
  isTrackingAllowed: () => boolean;
  getTrackingContext: () => TrackingContext;
}

const TrackingEventsContext = createContext<
  TrackingEventsContextType | undefined
>(undefined);

interface Props {
  children: React.ReactNode;
}

export const TrackingEventsProvider: React.FC<Props> = ({ children }) => {
  const { consent, hasConsented } = useConsent();
  const { data: session } = useSession();

  // Track if we've already sent the initial page view
  const hasTrackedInitialPageView = React.useRef(false);

  // Determine if tracking is allowed based on consent
  const isTrackingAllowed = useCallback(() => {
    return (
      hasConsented &&
      (consent.includes("tracking") ||
        consent.includes("social") ||
        consent.includes("analytics"))
    );
  }, [consent, hasConsented]);

  // Build tracking context from session
  const getTrackingContext = useCallback((): TrackingContext => {
    return buildTrackingContext(session);
  }, [session]);

  // Track initial page view when consent is given (only once per page load)
  useEffect(() => {
    if (isTrackingAllowed() && !hasTrackedInitialPageView.current) {
      hasTrackedInitialPageView.current = true;
      const context = getTrackingContext();
      trackGooglePageView(context);
      trackMetaPageView();
      debugTrackingEvent("Google", "page_view", context);
      debugTrackingEvent("Meta", "PageView", {});
    }
  }, [consent, hasConsented, session]); // Track when consent or session changes

  // Unified function to track events
  const trackEvent = useCallback(
    (eventType: EventType, eventName?: string, customData?: CustomData) => {
      if (!isTrackingAllowed()) {
        return;
      }

      const context = getTrackingContext();
      const data = mergeTrackingData(context, customData);

      switch (eventType) {
        case "pageView":
          trackGooglePageView(context);
          trackMetaPageView();
          debugTrackingEvent("Google", "page_view", context);
          debugTrackingEvent("Meta", "PageView", {});
          break;

        case "viewContent":
          trackGoogleViewContent(data);
          trackMetaViewContent(data);
          debugTrackingEvent("Google", "view_item", data);
          debugTrackingEvent("Meta", "ViewContent", data);
          break;

        case "search":
          trackGoogleSearch(data);
          trackMetaSearch(data);
          debugTrackingEvent("Google", "search", data);
          debugTrackingEvent("Meta", "Search", data);
          break;

        case "lead":
          trackGoogleLead(data);
          trackMetaLead(data);
          trackMetaCompleteRegistration(data);
          debugTrackingEvent("Google", "generate_lead", data);
          debugTrackingEvent("Meta", "Lead", data);
          break;

        case "addListing":
          trackGoogleAddListing(data);
          trackMetaAddListing(data);
          debugTrackingEvent("Google", "add_listing", data);
          debugTrackingEvent("Meta", "SubmitApplication", data);
          break;

        case "addToFavorites":
          trackGoogleAddToWishlist(data);
          trackMetaAddToWishlist(data);
          debugTrackingEvent("Google", "add_to_wishlist", data);
          debugTrackingEvent("Meta", "AddToWishlist", data);
          break;

        case "removeFromFavorites":
          trackGoogleRemoveFromWishlist(data);
          trackMetaRemoveFromWishlist(data);
          debugTrackingEvent("Google", "remove_from_wishlist", data);
          debugTrackingEvent("Meta", "RemoveFromWishlist", data);
          break;

        case "contactClick":
          trackGoogleContact(data);
          trackMetaContact(data);
          trackTikTokContact(data);
          debugTrackingEvent("Google", "contact", data);
          debugTrackingEvent("Meta", "Contact", data);
          debugTrackingEvent("TikTok", "Contact", data);
          break;

        case "filterSearch":
          trackGoogleFilterResults(data);
          trackMetaEvent("CustomizeProduct", data);
          debugTrackingEvent("Google", "filter_results", data);
          debugTrackingEvent("Meta", "CustomizeProduct", data);
          break;

        case "custom":
          if (eventName) {
            trackGoogleEvent(eventName, data);
            trackMetaEvent(eventName, data);
            debugTrackingEvent("Google", eventName, data);
            debugTrackingEvent("Meta", eventName, data);
          }
          break;

        default:
          return;
      }
    },
    [isTrackingAllowed, getTrackingContext],
  );

  return (
    <TrackingEventsContext.Provider
      value={{ trackEvent, isTrackingAllowed, getTrackingContext }}
    >
      {children}
    </TrackingEventsContext.Provider>
  );
};

// Custom hook to use the tracking context
export const useTracking = () => {
  const context = useContext(TrackingEventsContext);
  if (!context) {
    throw new Error("useTracking must be used within a TrackingEventsProvider");
  }
  return context;
};
