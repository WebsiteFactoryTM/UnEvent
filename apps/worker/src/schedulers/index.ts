import { maintenanceQueue } from "../queues/index.js";

/**
 * Get environment-aware heartbeat interval
 * - Production: 5 minutes
 * - Staging: 10 minutes
 * - Development: 15 minutes
 */
function getHeartbeatInterval(): number {
  const env = process.env.NODE_ENV || "development";
  switch (env) {
    case "production":
      return 5 * 60 * 1000; // 5 minutes
    case "staging":
      return 10 * 60 * 1000; // 10 minutes
    case "development":
    default:
      return 10 * 60 * 1000; // 10 minutes (reduced from 15 for better responsiveness)
  }
}

/**
 * Register all BullMQ schedulers
 * Schedulers create jobs at specified times/intervals
 * Note: In BullMQ v5, QueueScheduler is not needed for simple repeat jobs
 */
export async function registerSchedulers(): Promise<void> {
  // Schedule heartbeat job with environment-aware interval
  const heartbeatInterval = getHeartbeatInterval();
  const heartbeatMinutes = Math.floor(heartbeatInterval / 60000);

  // Remove existing heartbeat job if it exists (allows interval updates on redeploy)
  try {
    const existingJobs = await maintenanceQueue.getRepeatableJobs();
    const heartbeatJob = existingJobs.find(
      (job) => job.id === "heartbeat-recurring",
    );
    if (heartbeatJob) {
      await maintenanceQueue.removeRepeatableByKey(heartbeatJob.key);
      console.log(
        `[Schedulers] Removed existing heartbeat job to update interval`,
      );
    }
  } catch (error) {
    console.warn(
      `[Schedulers] Could not remove existing heartbeat job:`,
      error,
    );
  }

  await maintenanceQueue.add(
    "heartbeat",
    { type: "heartbeat" },
    {
      repeat: {
        every: heartbeatInterval,
      },
      jobId: "heartbeat-recurring", // Use fixed job ID to avoid duplicates
    },
  );

  console.log(
    `[Schedulers] Heartbeat scheduled: every ${heartbeatMinutes} minutes (${process.env.NODE_ENV || "development"})`,
  );

  // Daily admin digest scheduler
  // Runs at 07:00 UTC daily
  const adminDigestTime = process.env.ADMIN_DIGEST_TIME || "07:00";
  const [hours, minutes] = adminDigestTime.split(":").map(Number);

  // Remove existing admin digest job if time changed
  try {
    const existingJobs = await maintenanceQueue.getRepeatableJobs();
    const digestJob = existingJobs.find(
      (job) => job.id === "admin-digest-daily-recurring",
    );
    if (digestJob) {
      await maintenanceQueue.removeRepeatableByKey(digestJob.key);
      console.log(
        `[Schedulers] Removed existing admin digest job to update schedule`,
      );
    }
  } catch (error) {
    console.warn(
      `[Schedulers] Could not remove existing admin digest job:`,
      error,
    );
  }

  await maintenanceQueue.add(
    "admin-digest-daily",
    { type: "admin.digest.daily" },
    {
      repeat: {
        pattern: `${minutes} ${hours} * * *`, // Cron pattern: minute hour * * *
      },
      jobId: "admin-digest-daily-recurring", // Use fixed job ID to avoid duplicates
    },
  );

  console.log(
    `[Schedulers] Admin digest scheduled: daily at ${adminDigestTime} UTC`,
  );

  // TODO: Migrate Payload cronjobs here
  // Example structure for migrating existing Payload schedulers:
  //
  // // Feed flush (every 10 minutes)
  // await maintenanceQueue.add(
  //   'feed-flush',
  //   { type: 'feed.flush' },
  //   {
  //     repeat: { every: 10 * 60 * 1000 },
  //     jobId: 'feed-flush-recurring',
  //   },
  // )
  //
  // // Hub snapshot (every 6 hours)
  // await maintenanceQueue.add(
  //   'hub-snapshot',
  //   { type: 'hub.snapshot', payload: { type: 'locations' } },
  //   {
  //     repeat: { every: 6 * 60 * 60 * 1000 },
  //     jobId: 'hub-snapshot-locations-recurring',
  //   },
  // )
}

/**
 * Close all schedulers gracefully
 * Note: Repeat jobs are managed by the queue, no explicit cleanup needed
 */
export async function closeSchedulers(): Promise<void> {
  // Repeat jobs are automatically managed by BullMQ
  // No explicit cleanup needed
  console.log("[Schedulers] Schedulers closed");
}
