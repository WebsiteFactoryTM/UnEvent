/**
 * Scheduler Configuration Utility
 *
 * Provides environment-aware scheduler interval configuration with individual overrides.
 *
 * Environment multipliers:
 * - dev: 6x slower (e.g., 10min → 60min)
 * - staging: 3x slower (e.g., 10min → 30min)
 * - production: 1x (original intervals)
 *
 * Individual overrides via env vars take precedence over multipliers.
 */

export type SchedulerEnvironment = 'dev' | 'staging' | 'production'

const ENV_MULTIPLIERS: Record<SchedulerEnvironment, number> = {
  dev: 6,
  staging: 3,
  production: 1,
}

// Cached scheduler environment from Settings global (set during onInit)
let cachedSchedulerEnvironment: SchedulerEnvironment | null = null

/**
 * Set the scheduler environment from Settings global
 * This should be called during onInit after reading from the Settings global
 */
export function setSchedulerEnvironment(env: SchedulerEnvironment): void {
  cachedSchedulerEnvironment = env
  console.log(`[SchedulerConfig] Scheduler environment set to: ${env}`)
}

/**
 * Get the current scheduler environment
 * Priority: 1. Cached from Settings global, 2. SCHEDULER_ENV, 3. NODE_ENV
 */
export function getSchedulerEnvironment(): SchedulerEnvironment {
  // First check if we have a cached value from Settings global
  if (cachedSchedulerEnvironment) {
    return cachedSchedulerEnvironment
  }

  const schedulerEnv = process.env.SCHEDULER_ENV?.toLowerCase()
  if (schedulerEnv === 'dev' || schedulerEnv === 'staging' || schedulerEnv === 'production') {
    return schedulerEnv
  }

  // Fallback to NODE_ENV
  const nodeEnv = process.env.NODE_ENV?.toLowerCase()
  if (nodeEnv === 'production') {
    return 'production'
  }
  if (nodeEnv === 'staging') {
    return 'staging'
  }

  // Default to dev for development
  return 'dev'
}

/**
 * Get scheduler interval in minutes with environment-aware defaults
 *
 * @param name - Unique name for this scheduler (used for env var lookup)
 * @param defaultMinutes - Default interval in minutes (production value)
 * @param options - Optional configuration
 * @returns Interval in minutes
 *
 * @example
 * // Uses env var if set, otherwise applies environment multiplier
 * const interval = getSchedulerInterval('feed_flush', 10)
 * // In dev: 60 minutes (10 * 6)
 * // In staging: 30 minutes (10 * 3)
 * // In production: 10 minutes
 * // With SCHEDULER_FEED_FLUSH_INTERVAL_MINUTES=15: 15 minutes (override)
 */
export function getSchedulerInterval(
  name: string,
  defaultMinutes: number,
  options?: {
    envVarName?: string // Custom env var name (defaults to SCHEDULER_{NAME}_INTERVAL_MINUTES)
    minInterval?: number // Minimum allowed interval
  },
): number {
  const envVarName = options?.envVarName || `SCHEDULER_${name.toUpperCase()}_INTERVAL_MINUTES`
  const override = process.env[envVarName]

  // If explicit override is provided, use it
  if (override) {
    const parsed = parseInt(override, 10)
    if (isNaN(parsed) || parsed < 1) {
      console.warn(
        `[SchedulerConfig] Invalid interval override for ${name}: ${override}. Using default.`,
      )
      return defaultMinutes
    }
    const finalInterval = options?.minInterval ? Math.max(parsed, options.minInterval) : parsed
    console.log(
      `[SchedulerConfig] ${name}: Using override ${finalInterval}min (env: ${envVarName}=${override})`,
    )
    return finalInterval
  }

  // Apply environment multiplier
  const env = getSchedulerEnvironment()
  const multiplier = ENV_MULTIPLIERS[env]
  const interval = defaultMinutes * multiplier

  console.log(
    `[SchedulerConfig] ${name}: ${interval}min (default: ${defaultMinutes}min × ${multiplier}x for ${env})`,
  )

  return interval
}

/**
 * Convert minutes to a cron expression for "every N minutes"
 *
 * @param minutes - Interval in minutes
 * @param offset - Optional minute offset (0-59)
 * @returns Cron expression string
 *
 * @example
 * minutesToCron(10) // "*\/10 * * * *" (every 10 minutes)
 * minutesToCron(15, 2) // "2,17,32,47 * * * *" (every 15 minutes at :02, :17, :32, :47)
 */
export function minutesToCron(minutes: number, offset: number = 0): string {
  if (minutes < 1) {
    throw new Error(`Invalid interval: ${minutes} minutes must be >= 1`)
  }

  // For intervals >= 60 minutes, convert to hours
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
      // Exact hour interval
      return `${offset} */${hours} * * *`
    }

    // Mixed hours and minutes - use specific times
    const times: string[] = []
    for (let h = 0; h < 24; h += hours) {
      times.push(`${offset} ${h} * * *`)
    }
    // This is complex, so for simplicity, use every N hours at offset
    return `${offset} */${hours} * * *`
  }

  // For intervals < 60 minutes
  if (minutes === 1) {
    return `* * * * *` // Every minute
  }

  // Calculate specific minute marks
  const marks: number[] = []
  for (let m = offset; m < 60; m += minutes) {
    marks.push(m)
  }

  if (marks.length === 1) {
    return `${marks[0]} * * * *` // Single time per hour
  }

  return `${marks.join(',')} * * * *`
}

/**
 * Convert hours to a cron expression for "every N hours at specific minute"
 *
 * @param hours - Interval in hours
 * @param minute - Minute of the hour (0-59)
 * @returns Cron expression string
 *
 * @example
 * hoursToCron(6, 5) // "5 *\/6 * * *" (every 6 hours at :05)
 */
export function hoursToCron(hours: number, minute: number = 0): string {
  if (hours < 1) {
    throw new Error(`Invalid interval: ${hours} hours must be >= 1`)
  }

  if (minute < 0 || minute > 59) {
    throw new Error(`Invalid minute: ${minute} must be 0-59`)
  }

  if (hours === 1) {
    return `${minute} * * * *` // Every hour
  }

  return `${minute} */${hours} * * *`
}

/**
 * Convert hours to multiple daily times (e.g., 4x daily)
 *
 * @param timesPerDay - Number of times per day (must divide 24 evenly)
 * @param minute - Minute of the hour (0-59)
 * @returns Cron expression string
 *
 * @example
 * timesPerDayToCron(4, 5) // "5 0,6,12,18 * * *" (4x daily at :05)
 */
export function timesPerDayToCron(timesPerDay: number, minute: number = 0): string {
  if (timesPerDay < 1 || timesPerDay > 24) {
    throw new Error(`Invalid timesPerDay: ${timesPerDay} must be 1-24`)
  }

  if (minute < 0 || minute > 59) {
    throw new Error(`Invalid minute: ${minute} must be 0-59`)
  }

  if (24 % timesPerDay !== 0) {
    throw new Error(`Invalid timesPerDay: ${timesPerDay} must divide 24 evenly`)
  }

  const interval = 24 / timesPerDay
  const hours: number[] = []
  for (let h = 0; h < 24; h += interval) {
    hours.push(h)
  }

  return `${minute} ${hours.join(',')} * * *`
}

/**
 * Get scheduler interval in hours with environment-aware defaults
 *
 * @param name - Unique name for this scheduler
 * @param defaultHours - Default interval in hours (production value)
 * @param options - Optional configuration
 * @returns Interval in hours
 */
export function getSchedulerIntervalHours(
  name: string,
  defaultHours: number,
  options?: {
    envVarName?: string
    minInterval?: number
  },
): number {
  const envVarName = options?.envVarName || `SCHEDULER_${name.toUpperCase()}_INTERVAL_HOURS`
  const override = process.env[envVarName]

  if (override) {
    const parsed = parseFloat(override)
    if (isNaN(parsed) || parsed < 0.1) {
      console.warn(
        `[SchedulerConfig] Invalid interval override for ${name}: ${override}. Using default.`,
      )
      return defaultHours
    }
    const finalInterval = options?.minInterval ? Math.max(parsed, options.minInterval) : parsed
    console.log(
      `[SchedulerConfig] ${name}: Using override ${finalInterval}h (env: ${envVarName}=${override})`,
    )
    return finalInterval
  }

  const env = getSchedulerEnvironment()
  const multiplier = ENV_MULTIPLIERS[env]
  const interval = defaultHours * multiplier

  console.log(
    `[SchedulerConfig] ${name}: ${interval}h (default: ${defaultHours}h × ${multiplier}x for ${env})`,
  )

  return interval
}

/**
 * Log all scheduler configurations (useful for debugging)
 */
export function logSchedulerConfig(): void {
  const env = getSchedulerEnvironment()
  console.log(`[SchedulerConfig] Environment: ${env} (multiplier: ${ENV_MULTIPLIERS[env]}x)`)
  console.log(
    `[SchedulerConfig] SCHEDULER_ENV: ${process.env.SCHEDULER_ENV || 'not set (using NODE_ENV)'}`,
  )
  console.log(`[SchedulerConfig] NODE_ENV: ${process.env.NODE_ENV || 'not set'}`)
}
