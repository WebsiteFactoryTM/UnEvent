import "dotenv/config";
import { notificationsQueue, maintenanceQueue } from "../src/queues/index.js";
import { closeQueues } from "../src/queues/index.js";
import { closeRedisConnection } from "../src/redis.js";

/**
 * Cleanup script to remove failed jobs from queues
 * Usage:
 *   pnpm cleanup                    # Remove all failed jobs
 *   pnpm cleanup --queue=notifications  # Remove only from notifications queue
 *   pnpm cleanup --queue=maintenance    # Remove only from maintenance queue
 */
async function cleanup() {
  const args = process.argv.slice(2);
  const queueArg = args.find((arg) => arg.startsWith("--queue="));
  const queueName = queueArg?.split("=")[1] || "all";

  console.log(`[Cleanup] Starting cleanup of failed jobs...`);
  console.log(`[Cleanup] Target queue: ${queueName}`);

  try {
    if (queueName === "all" || queueName === "notifications") {
      await cleanupQueue(notificationsQueue, "notifications");
    }

    if (queueName === "all" || queueName === "maintenance") {
      await cleanupQueue(maintenanceQueue, "maintenance");
    }

    console.log(`[Cleanup] ✅ Cleanup completed successfully!`);
  } catch (error) {
    console.error("[Cleanup] ❌ Failed to cleanup:", error);
    process.exit(1);
  } finally {
    // Close connections
    await closeQueues();
    await closeRedisConnection();
    process.exit(0);
  }
}

async function cleanupQueue(
  queue: typeof notificationsQueue,
  queueName: string,
) {
  try {
    const failedCount = await queue.getFailedCount();
    console.log(`[Cleanup] ${queueName} queue: ${failedCount} failed job(s)`);

    if (failedCount === 0) {
      console.log(`[Cleanup] No failed jobs in ${queueName} queue`);
      return;
    }

    // Get all failed jobs
    const failedJobs = await queue.getFailed(0, failedCount);
    console.log(
      `[Cleanup] Found ${failedJobs.length} failed job(s) in ${queueName} queue`,
    );

    // Remove each failed job
    let removed = 0;
    for (const job of failedJobs) {
      try {
        await job.remove();
        removed++;
        console.log(
          `[Cleanup] ✅ Removed failed job ${job.id} (type: ${job.data?.type || "unknown"})`,
        );
      } catch (error) {
        console.error(
          `[Cleanup] ⚠️ Failed to remove job ${job.id}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    console.log(
      `[Cleanup] Removed ${removed}/${failedJobs.length} failed jobs from ${queueName} queue`,
    );
  } catch (error) {
    console.error(`[Cleanup] Error cleaning up ${queueName} queue:`, error);
    throw error;
  }
}

cleanup().catch((error) => {
  console.error("[Cleanup] Fatal error:", error);
  process.exit(1);
});
