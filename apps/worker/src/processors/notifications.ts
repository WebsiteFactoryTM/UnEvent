import { Worker, Job } from "bullmq";
import { getRedisConnection } from "../redis.js";
import { sendEmailFromRegistry } from "../email.js";
import { EMAIL_TEMPLATES, type EmailEventType } from "../emails/registry.js";
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
  const worker = new Worker<NotificationJobData>(
    "notifications",
    async (job: Job<NotificationJobData>) => {
      const { type, payload } = job.data;

      console.log(`[Notifications] Processing job ${job.id}: ${type}`, payload);

      try {
        // Handle test ping job
        if (type === "ping") {
          console.log("[Notifications] ping received:", payload);
          return { success: true, type, processedAt: new Date().toISOString() };
        }

        // Check if this is an email type registered in the registry
        const template = EMAIL_TEMPLATES[type as EmailEventType];
        if (template) {
          console.log(
            `[Notifications] Sending email via registry: ${type}`,
            payload,
          );

          const result = await sendEmailFromRegistry(type, payload);

          if (!result.success) {
            throw new Error(
              `Failed to send email (${type}): ${result.error}`,
            );
          }

          console.log(
            `[Notifications] ✅ Email sent successfully (${type}, messageId: ${result.messageId})`,
          );
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
      concurrency: 10, // Process up to 10 notification jobs concurrently
    },
  );

  worker.on("completed", (job: Job) => {
    console.log(`[Notifications] Job ${job.id} completed`);
  });

  worker.on("failed", (job: Job | undefined, err: Error) => {
    console.error(`[Notifications] Job ${job?.id} failed:`, err);
  });

  worker.on("error", (err: Error) => {
    console.error("[Notifications] Worker error:", err);
    Sentry.captureException(err, {
      tags: {
        component: "notifications-worker",
      },
    });
  });

  return worker;
}
