"use client";

import React from "react";
import { ConsentProvider } from "./ConsentContext";
import { ConsentTrackingProvider } from "./ConsentTrackingProvider";
import { TrackingEventsProvider } from "./TrackingEventsProvider";
import { TrackingErrorBoundary } from "./TrackingErrorBoundary";

/**
 * AllConsentProviders
 *
 * Wraps all consent-related providers in the correct order:
 * 1. TrackingErrorBoundary - Catches tracking errors without breaking the page
 * 2. ConsentProvider - Manages consent state
 * 3. ConsentTrackingProvider - Loads tracking scripts based on consent
 * 4. TrackingEventsProvider - Provides tracking functions to components
 *
 * Note: Third-party errors (like Facebook IAB bridge OperationError) are filtered
 * in Sentry's beforeSend to prevent noise without adding complexity.
 */
export const AllConsentProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <TrackingErrorBoundary>
      <ConsentProvider>
        <ConsentTrackingProvider>
          <TrackingEventsProvider>{children}</TrackingEventsProvider>
        </ConsentTrackingProvider>
      </ConsentProvider>
    </TrackingErrorBoundary>
  );
};

// Export individual providers and hooks for flexibility
export { ConsentProvider, useConsent } from "./ConsentContext";
export { ConsentTrackingProvider } from "./ConsentTrackingProvider";
export { TrackingEventsProvider, useTracking } from "./TrackingEventsProvider";
