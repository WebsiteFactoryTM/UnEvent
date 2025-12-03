/**
 * Environment-aware BullMQ worker settings
 * Adjusts polling intervals and concurrency based on NODE_ENV to optimize Redis usage
 */

export interface WorkerSettings {
  concurrency: number;
  lockDuration: number;
  stalledInterval: number;
  maxStalledCount: number;
}

/**
 * Get worker settings based on environment
 * - Production: Aggressive settings for real-time processing
 * - Staging: Moderate settings (2x slower)
 * - Development: Conservative settings (4x slower) to minimize Redis usage
 */
export function getWorkerSettings(
  type: "notifications" | "maintenance",
): WorkerSettings {
  const env = process.env.NODE_ENV || "development";

  // Base settings for production
  const baseSettings = {
    notifications: {
      concurrency: 5,
      lockDuration: 60000, // 1 minute
      stalledInterval: 60000, // 1 minute
      maxStalledCount: 2,
    },
    maintenance: {
      concurrency: 3,
      lockDuration: 120000, // 2 minutes
      stalledInterval: 120000, // 2 minutes
      maxStalledCount: 2,
    },
  };

  const settings = baseSettings[type];

  switch (env) {
    case "production":
      // Use base settings for production
      console.log(
        `[WorkerSettings] ${type}: production mode (standard polling)`,
      );
      return settings;

    case "staging":
      // 2x slower for staging
      console.log(`[WorkerSettings] ${type}: staging mode (2x slower polling)`);
      return {
        concurrency: Math.max(1, Math.floor(settings.concurrency / 2)),
        lockDuration: settings.lockDuration * 2,
        stalledInterval: settings.stalledInterval * 2,
        maxStalledCount: settings.maxStalledCount,
      };

    case "development":
    default:
      // 4x slower for development (most conservative)
      console.log(
        `[WorkerSettings] ${type}: development mode (4x slower polling)`,
      );
      return {
        concurrency: Math.max(1, Math.floor(settings.concurrency / 4)),
        lockDuration: settings.lockDuration * 4,
        stalledInterval: settings.stalledInterval * 4,
        maxStalledCount: settings.maxStalledCount,
      };
  }
}

/**
 * Get environment-specific description for logging
 */
export function getEnvironmentDescription(): string {
  const env = process.env.NODE_ENV || "development";
  const descriptions = {
    production: "Production (real-time)",
    staging: "Staging (2x slower)",
    development: "Development (4x slower)",
  };
  return (
    descriptions[env as keyof typeof descriptions] || descriptions.development
  );
}
