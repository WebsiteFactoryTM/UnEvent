// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable Session Replay for better debugging
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  environment: process.env.NODE_ENV || "development",

  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies;
    }

    // Filter out known benign errors from third-party scripts
    // These are expected when users visit without consent (e.g., Facebook IAB bridge)
    const exception = event.exception?.values?.[0];
    if (exception) {
      const isThirdPartyError =
        exception.type === "OperationError" ||
        exception.value?.includes("Non-recoverable error") ||
        exception.value?.includes("OperationError");

      if (isThirdPartyError) {
        // Don't send to Sentry - these are harmless and expected
        return null;
      }
    }

    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
