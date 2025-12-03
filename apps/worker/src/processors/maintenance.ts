import { Worker, Job } from "bullmq";
import { getRedisConnection } from "../redis.js";
import { sendEmailFromRegistry } from "../email.js";
import { EMAIL_TEMPLATES, type EmailEventType } from "../emails/registry.js";
import { getWorkerSettings } from "../config/workerSettings.js";
import * as Sentry from "@sentry/node";

export interface MaintenanceJobData {
  type: string;
  payload?: Record<string, unknown>;
}

/**
 * Process maintenance jobs
 * Handles scheduled maintenance tasks and cronjobs
 */
export function createMaintenanceProcessor(): Worker {
  // Get environment-aware settings
  const settings = getWorkerSettings("maintenance");

  const worker = new Worker<MaintenanceJobData>(
    "maintenance",
    async (job: Job<MaintenanceJobData>) => {
      const { type, payload } = job.data;

      console.log(
        `[Maintenance] Processing job ${job.id}: ${type}`,
        payload || {},
      );

      try {
        // Handle heartbeat
        if (type === "heartbeat") {
          console.log("[Maintenance] heartbeat received");
          return { success: true, type, processedAt: new Date().toISOString() };
        }

        // Check if this is an email type registered in the registry
        const template = EMAIL_TEMPLATES[type as EmailEventType];
        if (template) {
          console.log(
            `[Maintenance] Sending email via registry: ${type}`,
            payload || {},
          );

          const result = await sendEmailFromRegistry(type, payload || {});

          if (!result.success) {
            throw new Error(`Failed to send email (${type}): ${result.error}`);
          }

          console.log(
            `[Maintenance] ✅ Email sent successfully (${type}, messageId: ${result.messageId})`,
          );
        } else {
          // Unknown type - log but don't fail (might be a new type not yet implemented)
          console.warn(
            `[Maintenance] Unknown maintenance type: ${type}. Not found in EMAIL_TEMPLATES registry.`,
          );
        }

        return { success: true, type, processedAt: new Date().toISOString() };
      } catch (error) {
        console.error(`[Maintenance] Error processing job ${job.id}:`, error);

        // Capture error in Sentry
        if (error instanceof Error) {
          Sentry.captureException(error, {
            tags: {
              jobType: "maintenance",
              maintenanceType: type,
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
    },
  );

  worker.on("completed", (job: Job) => {
    console.log(`[Maintenance] Job ${job.id} completed`);
  });

  worker.on("failed", (job: Job | undefined, err: Error) => {
    console.error(`[Maintenance] Job ${job?.id} failed:`, err);
  });

  worker.on("error", (err: Error) => {
    console.error("[Maintenance] Worker error:", err);
    Sentry.captureException(err, {
      tags: {
        component: "maintenance-worker",
      },
    });
  });

  return worker;
}
