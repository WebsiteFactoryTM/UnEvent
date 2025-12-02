import { Queue } from "bullmq";
import { getRedisConnection } from "../redis.js";

/**
 * Notifications queue for event-driven email notifications
 * Enqueued from Payload hooks (e.g., afterChange)
 */
export const notificationsQueue = new Queue("notifications", {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

/**
 * Maintenance queue for scheduled maintenance tasks and cronjobs
 * Used by BullMQ schedulers for time-based jobs
 */
export const maintenanceQueue = new Queue("maintenance", {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 7 * 24 * 3600, // Keep completed jobs for 7 days
      count: 5000, // Keep max 5000 completed jobs
    },
    removeOnFail: {
      age: 30 * 24 * 3600, // Keep failed jobs for 30 days
    },
  },
});

/**
 * Gracefully close all queues
 */
export async function closeQueues(): Promise<void> {
  await Promise.all([notificationsQueue.close(), maintenanceQueue.close()]);
  console.log("[Queues] All queues closed");
}
