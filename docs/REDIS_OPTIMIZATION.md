# Redis Optimization Guide

## Problem Statement

**Upstash Redis free tier limit exceeded**: 10,000 daily requests quota being consumed rapidly.

## Root Cause Analysis

### 1. BullMQ Worker Aggressive Polling (PRIMARY CAUSE)

**Impact**: ~35,000-50,000 Redis requests/day

The worker app uses BullMQ with `ioredis` to connect to Upstash Redis. BullMQ is designed for low-latency Redis (local/VPC) and polls Redis very frequently:

- **2 workers** (notifications + maintenance) running 24/7
- Each worker polls Redis every 5-10 seconds when idle (default behavior)
- Additional requests for job locking, status updates, heartbeats
- **Concurrency settings** amplify polling (10 + 5 = 15 concurrent pollers)

**Calculation**:
- 2 workers × 6 polls/minute × 60 min × 24 hours = **17,280 polls/day**
- Plus job processing overhead = **~35,000-50,000 requests/day**

### 2. Feed Scheduler High Frequency

**Impact**: ~15,000-30,000 Redis requests/day

In `apps/backend/src/schedulers/feed.ts`:
- `flushCountersToDaily`: Every 10 minutes (144×/day)
- `aggregateDaily`: Every 15 minutes (96×/day)  
- `rankSegments`: Every 20 minutes (72×/day)

Each flush does:
- Redis SCAN operations (iterating through keys)
- GET operations for each counter key
- DEL operations after flushing

**With 100 active counter keys**: 100-200 Redis ops/flush = **14,400-28,800 requests/day**

### 3. Heartbeat Job Overhead

**Impact**: ~1,500 requests/day

- Runs every 1 minute
- 1,440 jobs/day
- Each job = ~1-2 Redis operations

### 4. Hub Snapshots

**Impact**: Low (~100-500 requests/day)

- 3 snapshot types × 4 times/day = 12 runs
- Mostly Postgres queries, minimal Redis usage

---

## Solutions Implemented

### ✅ Solution 1: Environment-Aware BullMQ Worker Settings

**Files Modified**:
- `apps/worker/src/config/workerSettings.ts` (NEW)
- `apps/worker/src/processors/notifications.ts`
- `apps/worker/src/processors/maintenance.ts`
- `apps/worker/src/index.ts`

**Changes**: Created dynamic configuration that adjusts worker settings based on `NODE_ENV`:

| Setting | Production | Staging (2x) | Development (4x) |
|---------|-----------|--------------|------------------|
| **Notifications Concurrency** | 5 | 2 | 1 |
| **Notifications Lock Duration** | 60s | 120s | 240s |
| **Notifications Stalled Interval** | 60s | 120s | 240s |
| **Maintenance Concurrency** | 3 | 1 | 1 |
| **Maintenance Lock Duration** | 120s | 240s | 480s |
| **Maintenance Stalled Interval** | 120s | 240s | 480s |

**Expected Reduction**:
- **Development**: ~70-80% fewer worker polling requests = **~25,000-28,000 requests/day saved**
- **Staging**: ~50% fewer worker polling requests = **~17,000-20,000 requests/day saved**
- **Production**: ~40% fewer worker polling requests = **~14,000-17,000 requests/day saved**

### ✅ Solution 2: Environment-Aware Heartbeat Frequency

**File Modified**: `apps/worker/src/schedulers/index.ts`

**Changes**: Dynamic heartbeat intervals based on `NODE_ENV`:
- **Production**: 5 minutes (was 1 minute)
- **Staging**: 10 minutes
- **Development**: 15 minutes

**Expected Reduction**:
- **Development**: ~1,400 requests/day saved
- **Staging**: ~1,300 requests/day saved
- **Production**: ~1,200 requests/day saved

---

## Additional Recommendations (Optional)

### Option A: Adjust Feed Scheduler Intervals

If you're in **development/staging**, consider slowing down feed schedulers:

**Set in your `.env` or environment**:

```bash
# Development environment (6x slower than production)
SCHEDULER_ENV=dev

# Or manually adjust intervals:
SCHEDULER_FEED_FLUSH_INTERVAL_MINUTES=30    # Was 10min
SCHEDULER_FEED_AGGREGATE_INTERVAL_MINUTES=60 # Was 15min
SCHEDULER_FEED_RANK_INTERVAL_MINUTES=60      # Was 20min
```

**Expected Reduction**: ~10,000-15,000 requests/day saved in dev/staging

### Option B: Disable Heartbeat in Development

If you don't need worker health monitoring in dev, comment out the heartbeat:

```typescript
// In apps/worker/src/schedulers/index.ts
export async function registerSchedulers(): Promise<void> {
  // Skip heartbeat in development
  if (process.env.NODE_ENV === 'production') {
    await maintenanceQueue.add("heartbeat", { type: "heartbeat" }, {
      repeat: { every: 5 * 60 * 1000 },
      jobId: "heartbeat-recurring",
    });
  }
  
  // ... rest of schedulers
}
```

### Option C: Consider Upstash Paid Tier

If your app is in production and these optimizations aren't enough:

**Upstash Redis Pricing**:
- **Free**: 10,000 requests/day, 256 MB
- **Pay-as-you-go**: $0.20 per 100K requests (very affordable)
- **Pro ($10/month)**: 1M requests/day, 1 GB

**Cost estimate for 50K requests/day**: ~$3/month

---

## Expected Results

### Before Optimizations
- **Total**: ~50,000-60,000 Redis requests/day
- **Status**: Exceeding 10K free tier limit by 5-6x

### After Optimizations - Production (NODE_ENV=production)
- **Worker polling**: ~18,000 requests/day (was ~35,000)
- **Feed schedulers**: ~15,000 requests/day (unchanged)
- **Heartbeat**: ~300 requests/day (was ~1,500)
- **Other**: ~500 requests/day
- **Total**: ~33,800 requests/day
- **Status**: Still 3.4x over limit, but **60% improvement**

### After Optimizations - Staging (NODE_ENV=staging)
- **Worker polling**: ~15,000 requests/day (was ~35,000)
- **Feed schedulers**: ~5,000 requests/day (with `SCHEDULER_ENV=staging`)
- **Heartbeat**: ~150 requests/day (was ~1,500)
- **Other**: ~500 requests/day
- **Total**: ~20,650 requests/day
- **Status**: 2x over limit, **65% improvement**

### After Optimizations - Development (NODE_ENV=development)
- **Worker polling**: ~8,000-10,000 requests/day (was ~35,000)
- **Feed schedulers**: ~2,500 requests/day (with `SCHEDULER_ENV=dev`)
- **Heartbeat**: ~100 requests/day (was ~1,500)
- **Other**: ~500 requests/day
- **Total**: ~11,100-13,100 requests/day
- **Status**: Slightly over or near limit, **78% improvement**

**Recommendation**:
- **Development/Staging**: Use environment-aware settings (automatic now!)
- **Production**: Consider Upstash paid tier ($3-10/month) for reliable service

---

## Monitoring Redis Usage

### 1. Check Upstash Dashboard

Go to your Upstash Redis dashboard to see:
- Daily request count
- Peak usage times
- Commands breakdown

### 2. Add Redis Request Logging (Optional)

In `apps/worker/src/redis.ts`, add logging:

```typescript
export function getRedisConnection(): Redis {
  if (redisClient) {
    return redisClient;
  }

  // ... existing connection code ...

  // Log Redis commands (debugging only)
  if (process.env.DEBUG_REDIS === 'true') {
    redisClient.on('ready', () => {
      console.log('[Redis] Connection ready');
    });
    
    let commandCount = 0;
    const originalSendCommand = redisClient.sendCommand.bind(redisClient);
    redisClient.sendCommand = function(...args) {
      commandCount++;
      if (commandCount % 100 === 0) {
        console.log(`[Redis] Commands sent: ${commandCount}`);
      }
      return originalSendCommand(...args);
    };
  }

  return redisClient;
}
```

### 3. Monitor BullMQ Queue Stats

Check queue status periodically:

```bash
# In your worker logs, you'll see:
[Worker] Processors initialized
[Schedulers] Heartbeat scheduled: every 5 minutes

# If you see many "waiting" or "stalled" jobs, that indicates issues
```

---

## Deployment Checklist

- [x] Worker BullMQ settings optimized
- [x] Heartbeat frequency reduced
- [ ] Set `SCHEDULER_ENV=dev` for development environments
- [ ] Monitor Upstash dashboard for 24-48 hours
- [ ] If still over limit, consider paid tier or further optimizations

---

## Further Optimization Options (If Needed)

### 1. Use Redis Pipelining

Batch Redis operations where possible. In `counters.ts`:

```typescript
// Instead of individual incr + expire
await redis.incr(key)
await redis.expire(key, 7 * 24 * 60 * 60)

// Use pipeline (2 ops → 1 request)
const pipeline = redis.pipeline()
pipeline.incr(key)
pipeline.expire(key, 7 * 24 * 60 * 60)
await pipeline.exec()
```

### 2. Batch Counter Flushes

Instead of flushing every 10 minutes, consider:
- Flush less frequently in dev/staging (30-60 min)
- Keep 10 min in production for real-time feed updates

### 3. Move to Direct PostgreSQL for Counters

If Redis continues to be a bottleneck, consider storing counters directly in PostgreSQL with a write-through cache pattern. This is more complex but eliminates Redis dependency for counters.

---

## Notes

- These optimizations focus on **reducing unnecessary Redis requests** while maintaining functionality
- BullMQ is designed for high-throughput, low-latency Redis environments
- Upstash REST API has higher latency but is more cost-effective for low-traffic apps
- The trade-off is **slightly slower job processing** (seconds) in exchange for **staying within free tier limits**

## Questions?

If you continue to exceed limits after these optimizations, consider:
1. Is your app in production with real traffic? → Upgrade to paid tier ($3-10/month)
2. Still in development? → Disable feed schedulers or set longer intervals
3. Need help? → Check BullMQ docs for more tuning options

