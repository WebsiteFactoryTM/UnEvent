import "dotenv/config";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { createNotificationsProcessor } from "./processors/notifications.js";
import { createMaintenanceProcessor } from "./processors/maintenance.js";
import { registerSchedulers } from "./schedulers/index.js";
import {
  startHealthcheckServer,
  stopHealthcheckServer,
} from "./healthcheck.js";
import { closeQueues } from "./queues/index.js";
import { closeRedisConnection } from "./redis.js";
import { getEnvironmentDescription } from "./config/workerSettings.js";

// Initialize Sentry before anything else
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enabled: process.env.NODE_ENV === "production",
    environment:
      process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    integrations: [nodeProfilingIntegration()],
    beforeSend(event: Sentry.ErrorEvent, _hint: Sentry.EventHint) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.authorization;
      }
      return event;
    },
  });

  console.log("[Sentry] Initialized");
} else {
  console.warn("[Sentry] SENTRY_DSN not set, skipping Sentry initialization");
}

// Graceful shutdown handler
let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) {
    console.log("[Shutdown] Already shutting down, forcing exit...");
    process.exit(1);
  }

  isShuttingDown = true;
  console.log(`[Shutdown] Received ${signal}, starting graceful shutdown...`);

  try {
    // Stop accepting new jobs
    console.log("[Shutdown] Stopping processors...");
    // Processors will stop automatically when we close queues

    // Close schedulers (no explicit cleanup needed for repeat jobs)
    console.log("[Shutdown] Closing schedulers...");

    // Close queues (this will also close workers)
    console.log("[Shutdown] Closing queues...");
    await closeQueues();

    // Close Redis connection
    console.log("[Shutdown] Closing Redis connection...");
    await closeRedisConnection();

    // Stop healthcheck server
    console.log("[Shutdown] Stopping healthcheck server...");
    await stopHealthcheckServer();

    console.log("[Shutdown] Graceful shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("[Shutdown] Error during shutdown:", error);
    Sentry.captureException(error as Error);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Handle unhandled promise rejections
process.on(
  "unhandledRejection",
  (reason: unknown, _promise: Promise<unknown>) => {
    console.error("[UnhandledRejection] Unhandled promise rejection:", reason);
    Sentry.captureException(reason as Error, {
      tags: {
        type: "unhandledRejection",
      },
    });
  },
);

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  console.error("[UncaughtException] Uncaught exception:", error);
  Sentry.captureException(error);
  shutdown("uncaughtException");
});

/**
 * Main entry point
 */
async function main() {
  console.log("[Worker] Starting worker service...");
  console.log(`[Worker] NODE_ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`[Worker] Environment: ${getEnvironmentDescription()}`);

  try {
    // Start healthcheck server
    const port = parseInt(process.env.PORT || "3001", 10);
    startHealthcheckServer(port);

    // Initialize processors (these start processing jobs immediately)
    console.log("[Worker] Initializing processors...");
    const notificationsWorker = createNotificationsProcessor();
    const maintenanceWorker = createMaintenanceProcessor();

    console.log("[Worker] Processors initialized");

    // Register schedulers (these create recurring jobs)
    console.log("[Worker] Registering schedulers...");
    await registerSchedulers();

    console.log("[Worker] ✅ Worker service started successfully");
    console.log("[Worker] Listening for jobs...");
  } catch (error) {
    console.error("[Worker] Failed to start:", error);
    Sentry.captureException(error as Error);
    process.exit(1);
  }
}

// Start the worker
main().catch((error) => {
  console.error("[Worker] Fatal error:", error);
  Sentry.captureException(error);
  process.exit(1);
});
