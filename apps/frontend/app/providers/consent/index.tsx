"use client";

import React from "react";
import { ConsentProvider } from "./ConsentContext";
import { ConsentTrackingProvider } from "./ConsentTrackingProvider";
import { TrackingEventsProvider } from "./TrackingEventsProvider";

/**
 * AllConsentProviders
 *
 * Wraps all consent-related providers in the correct order:
 * 1. ConsentProvider - Manages consent state
 * 2. ConsentTrackingProvider - Loads tracking scripts based on consent
 * 3. TrackingEventsProvider - Provides tracking functions to components
 */
export const AllConsentProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ConsentProvider>
      <ConsentTrackingProvider>
        <TrackingEventsProvider>{children}</TrackingEventsProvider>
      </ConsentTrackingProvider>
    </ConsentProvider>
  );
};

// Export individual providers and hooks for flexibility
export { ConsentProvider, useConsent } from "./ConsentContext";
export { ConsentTrackingProvider } from "./ConsentTrackingProvider";
export { TrackingEventsProvider, useTracking } from "./TrackingEventsProvider";
