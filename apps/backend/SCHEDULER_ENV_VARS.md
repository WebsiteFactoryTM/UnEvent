# Scheduler Environment Variables

## Master Control

```bash
# Set scheduler environment (dev|staging|production)
# If not set, falls back to NODE_ENV
# Default multipliers: dev=6x slower, staging=3x slower, production=1x
SCHEDULER_ENV=production
```

## Individual Scheduler Overrides

All intervals below are **optional**. If not set, the system uses environment-aware defaults:
- **Production**: Original intervals (as specified)
- **Staging**: 3x slower than production
- **Dev**: 6x slower than production

### Feed Algorithm Schedulers

```bash
# Flush Redis counters to metrics_daily
# Production default: 10 minutes
# Staging default: 30 minutes (3x slower)
# Dev default: 60 minutes (6x slower)
SCHEDULER_FEED_FLUSH_INTERVAL_MINUTES=10

# Compute feed aggregates
# Production default: 15 minutes
# Staging default: 45 minutes (3x slower)
# Dev default: 90 minutes (6x slower)
SCHEDULER_FEED_AGGREGATE_INTERVAL_MINUTES=15

# Rank feed segments
# Production default: 20 minutes
# Staging default: 60 minutes (3x slower)
# Dev default: 120 minutes (6x slower)
SCHEDULER_FEED_RANK_INTERVAL_MINUTES=20
```

### Hub Snapshot Scheduler

```bash
# Build hub snapshots (locations, services, events)
# Production default: 6 hours (4x daily)
# Staging default: 18 hours (3x slower = ~1.3x daily)
# Dev default: 36 hours (6x slower = ~0.67x daily)
SCHEDULER_HUB_SNAPSHOT_INTERVAL_HOURS=6
```

### Counter Sync Schedulers

```bash
# Sync listing type usage counters
# Production default: 24 hours (daily at 02:17)
# Staging default: 72 hours (3x slower = every 3 days)
# Dev default: 144 hours (6x slower = every 6 days)
SCHEDULER_SYNC_LISTING_TYPES_INTERVAL_HOURS=24

# Sync city usage counters
# Production default: 24 hours (daily at 02:23)
# Staging default: 72 hours (3x slower = every 3 days)
# Dev default: 144 hours (6x slower = every 6 days)
SCHEDULER_SYNC_CITIES_INTERVAL_HOURS=24
```

### Cleanup Scheduler

```bash
# Cleanup temporary media files
# Production default: 1 hour (hourly at :13)
# Staging default: 3 hours (3x slower)
# Dev default: 6 hours (6x slower)
SCHEDULER_CLEANUP_MEDIA_INTERVAL_HOURS=1
```

## Example Configurations

### Production (Recommended)
```bash
SCHEDULER_ENV=production
# Use defaults - no overrides needed
```

### Staging (Recommended)
```bash
SCHEDULER_ENV=staging
# Use defaults - automatically 3x slower than production
# Or override specific schedulers if needed:
# SCHEDULER_FEED_FLUSH_INTERVAL_MINUTES=30
# SCHEDULER_HUB_SNAPSHOT_INTERVAL_HOURS=12
```

### Development (Recommended)
```bash
SCHEDULER_ENV=dev
# Use defaults - automatically 6x slower than production
# Or override specific schedulers if needed:
# SCHEDULER_FEED_FLUSH_INTERVAL_MINUTES=60
# SCHEDULER_HUB_SNAPSHOT_INTERVAL_HOURS=24
```

### Custom Override Example
```bash
# Force all schedulers to run less frequently regardless of environment
SCHEDULER_FEED_FLUSH_INTERVAL_MINUTES=30
SCHEDULER_FEED_AGGREGATE_INTERVAL_MINUTES=45
SCHEDULER_FEED_RANK_INTERVAL_MINUTES=60
SCHEDULER_HUB_SNAPSHOT_INTERVAL_HOURS=12
SCHEDULER_SYNC_LISTING_TYPES_INTERVAL_HOURS=48
SCHEDULER_SYNC_CITIES_INTERVAL_HOURS=48
SCHEDULER_CLEANUP_MEDIA_INTERVAL_HOURS=2
```

## Notes

- Individual env var overrides **always take precedence** over environment multipliers
- Set `ENABLE_JOBS=true` in `payload.config.ts` to enable all schedulers
- Set `SCHEDULER_IS_PRIMARY=true` for counter sync jobs in multi-replica deployments
- Scheduler intervals are logged on application startup for visibility

