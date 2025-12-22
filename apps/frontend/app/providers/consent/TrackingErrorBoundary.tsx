"use client";

import React from "react";
import * as Sentry from "@sentry/nextjs";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * TrackingErrorBoundary
 *
 * React Error Boundary specifically for tracking failures.
 * Catches tracking-related errors without breaking page rendering.
 */
export class TrackingErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("[Tracking] Error boundary caught:", error);

    // Only report tracking-related errors to Sentry
    const errorMessage = error.message.toLowerCase();
    const isTrackingError =
      errorMessage.includes("gtag") ||
      errorMessage.includes("fbq") ||
      errorMessage.includes("consent") ||
      errorMessage.includes("tracking") ||
      errorMessage.includes("pixel") ||
      errorMessage.includes("analytics");

    if (isTrackingError) {
      Sentry.captureException(error, {
        tags: {
          component: "tracking-error-boundary",
          type: "tracking-script-error",
        },
        extra: {
          componentStack: errorInfo.componentStack,
        },
      });
    }
  }

  componentDidUpdate() {
    // Reset error state after recovery to allow future error catching
    if (this.state.hasError) {
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 0);
    }
  }

  render() {
    if (this.state.hasError) {
      // Tracking error shouldn't break the page - render children normally
      console.warn(
        "[Tracking] Recovering from tracking error, continuing normal rendering",
      );
      return this.props.children;
    }

    return this.props.children;
  }
}
