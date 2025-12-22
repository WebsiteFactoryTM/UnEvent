import { Worker, Job } from "bullmq";
import { getRedisConnection } from "../redis.js";
import { sendEmailFromRegistry } from "../email.js";
import { EMAIL_TEMPLATES, type EmailEventType } from "../emails/registry.js";
import { getWorkerSettings } from "../config/workerSettings.js";
import * as Sentry from "@sentry/node";

export interface NotificationJobData {
  type: string;
  payload: Record<string, unknown>;
}

/**
 * Process notification jobs
 * Handles event-driven email notifications from Payload hooks
 */
export function createNotificationsProcessor(): Worker {
  // Get environment-aware settings
  const settings = getWorkerSettings("notifications");

  const worker = new Worker<NotificationJobData>(
    "notifications",
    async (job: Job<NotificationJobData>) => {
      const { type, payload } = job.data;

      try {
        // Handle test ping job
        if (type === "ping") {
          return { success: true, type, processedAt: new Date().toISOString() };
        }

        // Check if this is an email type registered in the registry
        const template = EMAIL_TEMPLATES[type as EmailEventType];

        if (template) {
          const result = await sendEmailFromRegistry(type, payload);

          if (!result.success) {
            const errorMsg = result.error || "Unknown error";

            // In development, handle common issues gracefully
            if (process.env.NODE_ENV === "development") {
              const isResendRestriction =
                errorMsg.includes("You can only send testing emails") ||
                errorMsg.includes("verify a domain") ||
                errorMsg.includes("Resend API restriction");
              const isMissingApiKey = errorMsg.includes("RESEND_API_KEY");
              const isInvalidEmail = errorMsg.includes("Invalid `to` field");

              if (isResendRestriction || isMissingApiKey || isInvalidEmail) {
                console.warn(
                  `[Notifications] ⚠️ Skipping email send (${type}) in development mode: ${errorMsg}`,
                );
                console.warn(
                  `[Notifications] Tip: Set TEST_EMAIL or RESEND_OVERRIDE_TO env var to test emails`,
                );
                console.warn(
                  `[Notifications] Would have sent to: ${JSON.stringify(payload)}`,
                );
                // Return success to prevent job failure in dev
                return {
                  success: true,
                  type,
                  skipped: true,
                  reason: errorMsg,
                  processedAt: new Date().toISOString(),
                };
              }
            }

            throw new Error(`Failed to send email (${type}): ${errorMsg}`);
          }
        } else {
          // Unknown type - log but don't fail (might be a new type not yet implemented)
          console.warn(
            `[Notifications] Unknown notification type: ${type}. Not found in EMAIL_TEMPLATES registry.`,
          );
        }

        return { success: true, type, processedAt: new Date().toISOString() };
      } catch (error) {
        console.error(`[Notifications] Error processing job ${job.id}:`, error);

        // Capture error in Sentry
        if (error instanceof Error) {
          Sentry.captureException(error, {
            tags: {
              jobType: "notification",
              notificationType: type,
            },
            extra: {
              jobId: job.id,
              jobData: job.data,
            },
          });
        }

        throw error; // Re-throw to mark job as failed
      }
    },
    {
      connection: getRedisConnection(),
      // Environment-aware settings (adjusted for dev/staging/production)
      concurrency: settings.concurrency,
      lockDuration: settings.lockDuration,
      stalledInterval: settings.stalledInterval,
      maxStalledCount: settings.maxStalledCount,
      limiter: {
        max: 2, // 2 requests
        duration: 1000, // per 1000ms (1 second) - respects Resend free tier rate limit
      },
    },
  );

  worker.on("completed", (job: Job) => {
    console.log(`[Notifications] Job ${job.id} completed`);
  });

  worker.on("failed", async (job: Job | undefined, err: Error) => {
    const jobId = job?.id || "unknown";
    const jobType = job?.data?.type || "unknown";
    const jobData = job?.data || {};

    console.error(
      `[Notifications] ❌ Job ${jobId} failed (type: ${jobType}):`,
      err,
    );
    console.error(
      `[Notifications] Failed job data:`,
      JSON.stringify(jobData, null, 2),
    );
    console.error(`[Notifications] Error details:`, {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  });

  worker.on("error", (err: Error) => {
    console.error("[Notifications] Worker error:", err);
    Sentry.captureException(err, {
      tags: {
        component: "notifications-worker",
      },
    });
  });

  // Diagnostic: Log when worker is ready and listening (only once)
  let readyLogged = false;
  worker.on("ready", () => {
    if (!readyLogged) {
      console.log(
        `[Notifications] ✅ Worker ready and listening for jobs (concurrency: ${settings.concurrency}, stalledInterval: ${settings.stalledInterval}ms)`,
      );
      readyLogged = true;
    }
  });

  // Diagnostic: Log when worker is closing
  worker.on("closing", () => {
    console.log("[Notifications] ⚠️ Worker is closing...");
    readyLogged = false; // Reset so we log again if it reopens
  });

  return worker;
}
