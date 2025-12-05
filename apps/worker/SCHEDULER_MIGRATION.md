# Move Schedulers to Worker Service

## Overview
Migrate all cron schedulers from Payload backend to the Worker service. Use webhooks for Settings change notifications to enable dynamic reconfiguration without restarts.

## Architecture

### Current State
- **Backend**: Runs 10+ cron schedulers directly via node-cron in `onInit`
- **Worker**: Handles emails via BullMQ, has minimal schedulers (heartbeat, admin digest)
- **Problem**: Changing Settings requires backend restart

### Target Architecture
- **Backend**: No cron schedulers, only exposes Settings API
- **Worker**: Runs all schedulers, reads Settings via API, responds to webhook notifications
- **Communication**: Webhook-based (no Redis overhead for Settings changes)

## Security Architecture

### Authentication Flow

**Worker → Backend (Settings API & Job Triggers)**
- Worker uses API Key authentication
- API Key belongs to a service user with admin role
- Backend validates API key and checks for admin role

**Backend → Worker (Webhook Notifications)**
- Backend sends webhook with shared secret
- Worker validates the secret before processing

### Service User Setup

1. Create a service user in Payload admin:
   - Email: `worker-service@internal.unevent.ro`
   - Role: `admin`
   - Enable API Key: Yes
   - Generate API Key and save as `WORKER_API_KEY` env var

## Implementation Steps

### 1. Backend: API Key Authentication Middleware

**File**: `apps/backend/src/utils/authenticateApiKey.ts` (new)

```typescript
import { PayloadRequest } from 'payload'

/**
 * Authenticate request using API key
 * Validates API key and checks for admin role
 */
export async function authenticateApiKey(req: PayloadRequest): Promise<boolean> {
  const apiKey = req.headers.get('x-api-key')
  
  if (!apiKey) {
    return false
  }
  
  try {
    // Find user by API key
    const users = await req.payload.find({
      collection: 'users',
      where: {
        apiKey: { equals: apiKey },
        enableAPIKey: { equals: true },
      },
      limit: 1,
    })
    
    if (users.docs.length === 0) {
      console.warn('[Auth] Invalid API key')
      return false
    }
    
    const user = users.docs[0]
    
    // Check if user has admin role
    if (!user.roles?.includes('admin')) {
      console.warn('[Auth] API key user lacks admin role')
      return false
    }
    
    // Attach user to request for logging
    req.user = user
    
    return true
  } catch (error) {
    console.error('[Auth] Error authenticating API key:', error)
    return false
  }
}
```

### 2. Backend: Create Settings API Endpoint

**File**: `apps/backend/src/endpoints/getSettings.ts` (new)

```typescript
import { PayloadHandler, PayloadRequest } from 'payload'
import { authenticateApiKey } from '@/utils/authenticateApiKey'

export const getSettingsHandler: PayloadHandler = async (req: PayloadRequest) => {
  // Authenticate using API key
  const isAuthenticated = await authenticateApiKey(req)
  
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  try {
    const settings = await req.payload.findGlobal({ slug: 'settings' })
    
    console.log('[Settings API] Settings requested by:', req.user?.email)
    
    // Return sanitized settings (only what worker needs)
    return new Response(JSON.stringify({
      enableJobs: settings?.enableJobs ?? false,
      schedulerEnvironment: settings?.schedulerEnvironment ?? null,
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[Settings API] Error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch settings' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
```

Register in `payload.config.ts`:
```typescript
{
  path: '/settings',
  method: 'get',
  handler: getSettingsHandler,
}
```

### 3. Backend: Add Webhook Trigger in Settings

**File**: `apps/backend/src/collections/Settings/index.ts`

Add `afterChange` hook:
```typescript
hooks: {
  afterChange: [
    async ({ data, previousDoc, req }) => {
      const jobsChanged = data.enableJobs !== previousDoc?.enableJobs
      const envChanged = data.schedulerEnvironment !== previousDoc?.schedulerEnvironment
      
      if (jobsChanged || envChanged) {
        const workerUrl = process.env.WORKER_URL || 'http://localhost:3001'
        const webhookSecret = process.env.WORKER_WEBHOOK_SECRET
        
        if (!webhookSecret) {
          console.warn('[Settings] WORKER_WEBHOOK_SECRET not set, skipping worker notification')
          return
        }
        
        console.log('[Settings] Scheduler settings changed, notifying worker...')
        console.log('[Settings] enableJobs:', previousDoc?.enableJobs, '→', data.enableJobs)
        console.log('[Settings] schedulerEnvironment:', previousDoc?.schedulerEnvironment, '→', data.schedulerEnvironment)
        
        try {
          const response = await fetch(`${workerUrl}/webhook/settings-changed`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': webhookSecret,
            },
            body: JSON.stringify({
              enableJobs: data.enableJobs,
              schedulerEnvironment: data.schedulerEnvironment,
              timestamp: new Date().toISOString(),
              changedBy: req.user?.email || 'unknown',
            }),
            signal: AbortSignal.timeout(5000), // 5 second timeout
          })
          
          if (!response.ok) {
            throw new Error(`Worker responded with status ${response.status}`)
          }
          
          console.log('[Settings] ✅ Worker notified successfully')
        } catch (error) {
          console.error('[Settings] ❌ Failed to notify worker:', error)
          // Don't throw - we don't want to block the Settings save
        }
      }
    }
  ]
}
```

### 4. Worker: Add Settings Fetcher

**File**: `apps/worker/src/config/payloadSettings.ts` (new)

```typescript
export interface PayloadSettings {
  enableJobs: boolean
  schedulerEnvironment: 'dev' | 'staging' | 'production' | null
}

let cachedSettings: PayloadSettings | null = null

/**
 * Fetch settings from backend using API key authentication
 */
export async function fetchPayloadSettings(): Promise<PayloadSettings> {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000'
  const apiKey = process.env.WORKER_API_KEY
  
  if (!apiKey) {
    console.error('[Settings] WORKER_API_KEY not set, cannot fetch settings')
    return cachedSettings || { enableJobs: false, schedulerEnvironment: null }
  }
  
  try {
    console.log('[Settings] Fetching settings from backend...')
    
    const response = await fetch(`${backendUrl}/api/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `users API-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - check WORKER_API_KEY')
      }
      throw new Error(`Backend responded with status ${response.status}`)
    }
    
    const settings = await response.json()
    cachedSettings = settings
    
    console.log('[Settings] ✅ Settings fetched:', settings)
    
    return settings
  } catch (error) {
    console.error('[Settings] ❌ Failed to fetch from backend:', error)
    console.warn('[Settings] Using cached/default settings')
    return cachedSettings || { enableJobs: false, schedulerEnvironment: null }
  }
}

export function getCachedSettings(): PayloadSettings {
  return cachedSettings || { enableJobs: false, schedulerEnvironment: null }
}
```

### 5. Worker: Create Scheduler Manager

**File**: `apps/worker/src/schedulers/manager.ts` (new)

```typescript
import { maintenanceQueue } from '../queues/index.js'
import { fetchPayloadSettings } from '../config/payloadSettings.js'

class SchedulerManager {
  private registeredJobs = new Map<string, string>() // jobId -> jobKey
  private isInitialized = false
  
  async initialize() {
    if (this.isInitialized) {
      console.log('[SchedulerManager] Already initialized')
      return
    }
    
    const settings = await fetchPayloadSettings()
    
    if (!settings.enableJobs) {
      console.log('[SchedulerManager] Jobs disabled, skipping scheduler registration')
      return
    }
    
    await this.registerAllSchedulers(settings)
    this.isInitialized = true
  }
  
  async restart() {
    console.log('[SchedulerManager] Restarting schedulers...')
    await this.stopAll()
    this.isInitialized = false
    await this.initialize()
  }
  
  async stopAll() {
    console.log('[SchedulerManager] Stopping all schedulers...')
    
    const repeatableJobs = await maintenanceQueue.getRepeatableJobs()
    for (const job of repeatableJobs) {
      // Keep heartbeat and admin digest, remove migrated schedulers
      if (!['heartbeat-recurring', 'admin-digest-daily-recurring'].includes(job.id || '')) {
        await maintenanceQueue.removeRepeatableByKey(job.key)
      }
    }
    
    this.registeredJobs.clear()
  }
  
  private async registerAllSchedulers(settings: PayloadSettings) {
    const env = settings.schedulerEnvironment || process.env.NODE_ENV || 'development'
    console.log(`[SchedulerManager] Registering schedulers for environment: ${env}`)
    
    // Calculate environment multipliers
    const multiplier = env === 'production' ? 1 : env === 'staging' ? 3 : 6
    
    // Feed schedulers
    await this.registerJob('feed-flush', 1440 * multiplier, { type: 'feed.flush' })
    await this.registerJob('feed-aggregate', 15 * multiplier, { type: 'feed.aggregate' })
    await this.registerJob('feed-rank', 20 * multiplier, { type: 'feed.rank' })
    
    // Hub snapshot schedulers
    await this.registerJob('hub-snapshot-locations', 60 * 60 * 1000 * multiplier, { 
      type: 'hub.snapshot', 
      collection: 'locations' 
    })
    // ... more schedulers
    
    console.log(`[SchedulerManager] Registered ${this.registeredJobs.size} schedulers`)
  }
  
  private async registerJob(name: string, intervalMs: number, data: any) {
    const existingJobs = await maintenanceQueue.getRepeatableJobs()
    const existing = existingJobs.find(job => job.id === `${name}-recurring`)
    
    if (existing) {
      await maintenanceQueue.removeRepeatableByKey(existing.key)
    }
    
    await maintenanceQueue.add(name, data, {
      repeat: { every: intervalMs },
      jobId: `${name}-recurring`,
    })
    
    this.registeredJobs.set(name, `${name}-recurring`)
  }
}

export const schedulerManager = new SchedulerManager()
```

### 6. Worker: Add Webhook Endpoint

**File**: `apps/worker/src/healthcheck.ts`

Add webhook endpoint with security validation:
```typescript
app.use(express.json())

app.post('/webhook/settings-changed', async (req: Request, res: Response) => {
  // Verify webhook secret
  const secret = req.headers['x-webhook-secret']
  const expectedSecret = process.env.WORKER_WEBHOOK_SECRET
  
  if (!expectedSecret) {
    console.error('[Webhook] WORKER_WEBHOOK_SECRET not configured')
    return res.status(500).json({ error: 'Server misconfigured' })
  }
  
  if (secret !== expectedSecret) {
    console.warn('[Webhook] Unauthorized webhook attempt')
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  const { enableJobs, schedulerEnvironment, timestamp, changedBy } = req.body
  
  console.log('[Webhook] Settings changed notification received')
  console.log('[Webhook] Changed by:', changedBy)
  console.log('[Webhook] enableJobs:', enableJobs)
  console.log('[Webhook] schedulerEnvironment:', schedulerEnvironment)
  console.log('[Webhook] timestamp:', timestamp)
  
  try {
    const { schedulerManager } = await import('./schedulers/manager.js')
    await schedulerManager.restart()
    
    console.log('[Webhook] ✅ Schedulers restarted successfully')
    
    res.status(200).json({ 
      success: true, 
      message: 'Schedulers restarted',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Webhook] ❌ Failed to restart schedulers:', error)
    res.status(500).json({ 
      error: 'Failed to restart schedulers',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})
```

### 7. Worker: Update Main Processor

**File**: `apps/worker/src/processors/maintenance.ts`

Add handlers for new job types with API key authentication:
```typescript
const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000'
const apiKey = process.env.WORKER_API_KEY

if (!apiKey) {
  throw new Error('WORKER_API_KEY not configured')
}

// Helper function to call backend endpoints
async function callBackendEndpoint(endpoint: string, payload?: any) {
  const response = await fetch(`${backendUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `users API-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
    signal: AbortSignal.timeout(30000), // 30 second timeout
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Backend error (${response.status}): ${error}`)
  }
  
  return await response.json()
}

// Handle feed jobs
if (type === 'feed.flush') {
  console.log('[Maintenance] Triggering feed flush...')
  await callBackendEndpoint('/api/feed/flush')
  return { success: true, type }
}

if (type === 'feed.aggregate') {
  console.log('[Maintenance] Triggering feed aggregation...')
  await callBackendEndpoint('/api/feed/aggregate')
  return { success: true, type }
}

if (type === 'feed.rank') {
  console.log('[Maintenance] Triggering feed ranking...')
  await callBackendEndpoint('/api/feed/rank')
  return { success: true, type }
}

// Handle hub snapshot jobs
if (type === 'hub.snapshot') {
  const { collection } = payload || {}
  console.log(`[Maintenance] Triggering hub snapshot for ${collection}...`)
  await callBackendEndpoint('/api/hub/build-snapshot', { collection })
  return { success: true, type }
}

// Handle city counters
if (type === 'sync.city-counters') {
  console.log('[Maintenance] Triggering city counters sync...')
  await callBackendEndpoint('/api/sync/city-counters')
  return { success: true, type }
}

// Handle listing type counters
if (type === 'sync.listing-type-counters') {
  console.log('[Maintenance] Triggering listing type counters sync...')
  await callBackendEndpoint('/api/sync/listing-type-counters')
  return { success: true, type }
}
```

### 8. Worker: Update Startup

**File**: `apps/worker/src/index.ts`

Replace scheduler registration:
```typescript
// Import scheduler manager
import { schedulerManager } from './schedulers/manager.js'

// In main():
console.log('[Worker] Initializing schedulers...')
await schedulerManager.initialize()
```

### 9. Backend: Remove Schedulers from onInit

**File**: `apps/backend/src/payload.config.ts`

Simplify `onInit`:
```typescript
onInit: async (payload) => {
  console.log('[Payload] Initialized')
  console.log('[Payload] Schedulers handled by Worker service')
  // Remove all scheduler initialization code
}
```

### 10. Backend: Create Job Trigger Endpoints

Create secured endpoints that worker calls to execute jobs.

**Example**: `apps/backend/src/endpoints/jobs/feedFlush.ts`

```typescript
import { PayloadHandler, PayloadRequest } from 'payload'
import { authenticateApiKey } from '@/utils/authenticateApiKey'
import { flushCountersToDaily } from '@/collections/Feed/counters'

export const feedFlushHandler: PayloadHandler = async (req: PayloadRequest) => {
  // Authenticate using API key
  const isAuthenticated = await authenticateApiKey(req)
  
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  const startTime = Date.now()
  console.log('[Job] Feed flush triggered by:', req.user?.email)
  
  try {
    await flushCountersToDaily(req.payload)
    
    const duration = Date.now() - startTime
    console.log(`[Job] Feed flush completed in ${duration}ms`)
    
    return new Response(JSON.stringify({ 
      success: true,
      duration,
      timestamp: new Date().toISOString(),
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[Job] Feed flush failed:', error)
    return new Response(JSON.stringify({ 
      error: 'Job execution failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
```

Register all job endpoints in `payload.config.ts`:
```typescript
endpoints: [
  // ... existing endpoints
  
  // Job trigger endpoints (secured with API key)
  { path: '/feed/flush', method: 'post', handler: feedFlushHandler },
  { path: '/feed/aggregate', method: 'post', handler: feedAggregateHandler },
  { path: '/feed/rank', method: 'post', handler: feedRankHandler },
  { path: '/hub/build-snapshot', method: 'post', handler: hubBuildSnapshotHandler },
  { path: '/sync/city-counters', method: 'post', handler: syncCityCountersHandler },
  { path: '/sync/listing-type-counters', method: 'post', handler: syncListingTypeCountersHandler },
  { path: '/cleanup/temp-media', method: 'post', handler: cleanupTempMediaHandler },
  { path: '/cleanup/deleted-listings', method: 'post', handler: cleanupDeletedListingsHandler },
]
```

**Security checklist for each endpoint:**
- ✅ Validates API key using `authenticateApiKey()`
- ✅ Checks for admin role
- ✅ Logs who triggered the job
- ✅ Returns proper HTTP status codes
- ✅ Handles errors gracefully
- ✅ Includes execution time in response

## Environment Variables

### Backend
- `WORKER_URL` - Worker service URL (e.g., `https://worker.unevent.ro` or `http://localhost:3001`)
- `WORKER_WEBHOOK_SECRET` - Shared secret for webhook authentication (generate with `openssl rand -hex 32`)

### Worker
- `BACKEND_URL` - Backend API URL (e.g., `https://api.unevent.ro` or `http://localhost:4000`)
- `WORKER_API_KEY` - API key from service user (copy from Payload admin after creating service user)
- `WORKER_WEBHOOK_SECRET` - Same secret as backend for webhook validation

## Security Setup Checklist

### 1. Create Service User
- [ ] Login to Payload admin
- [ ] Navigate to Users collection
- [ ] Create new user:
  - Email: `worker-service@internal.unevent.ro` (or your domain)
  - Password: Strong random password (save in password manager, rarely used)
  - Roles: Select `admin`
  - Status: `active`
  - Agree to terms: Yes
  - Verify email: Yes (or manually verify)

### 2. Generate API Key
- [ ] Edit the service user
- [ ] Scroll to API Key section
- [ ] Check "Enable API Key"
- [ ] Click "Generate API Key" button
- [ ] Copy the generated API key
- [ ] Save as `WORKER_API_KEY` in worker environment variables
- [ ] **Important**: Save this key securely - it won't be shown again

### 3. Generate Webhook Secret
- [ ] Run: `openssl rand -hex 32` (or use any secure random generator)
- [ ] Save as `WORKER_WEBHOOK_SECRET` in both backend and worker env vars
- [ ] Must be identical in both services

### 4. Configure URLs
- [ ] Set `WORKER_URL` on backend to worker service URL
- [ ] Set `BACKEND_URL` on worker to backend API URL
- [ ] For local dev: use `http://localhost:PORT`
- [ ] For production: use HTTPS URLs

### 5. Test Authentication
Test Settings API:
```bash
curl -H "Authorization: users API-Key YOUR_WORKER_API_KEY" http://localhost:4000/api/settings
```

Expected response:
```json
{
  "enableJobs": false,
  "schedulerEnvironment": null
}
```

Test webhook:
```bash
curl -X POST http://localhost:3001/webhook/settings-changed \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: YOUR_WEBHOOK_SECRET" \
  -d '{"enableJobs":true,"schedulerEnvironment":"dev"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Schedulers restarted",
  "timestamp": "2024-12-05T..."
}
```

## Benefits

1. **No restart needed** - Settings changes trigger webhook → worker restarts schedulers dynamically
2. **Lower Redis costs** - No queue needed for Settings notifications (one-time webhook)
3. **Better separation** - Backend handles API, worker handles background tasks
4. **Scalability** - Can run multiple workers with SCHEDULER_IS_PRIMARY check
5. **Visibility** - Worker logs show all scheduler activity

## Migration Path

1. Implement Settings API endpoint on backend
2. Implement webhook endpoint on worker
3. Move one scheduler at a time (start with simplest like heartbeat)
4. Test webhook notification flow
5. Move remaining schedulers
6. Remove scheduler code from backend
7. Deploy both services

## Security Considerations

### API Key Security
- **Rotation**: API keys should be rotated periodically (quarterly recommended)
- **Storage**: Store API keys in secure environment variables, never commit to git
- **Scope**: Service user should only have necessary permissions (admin for job triggers)
- **Monitoring**: Log all API key usage for audit trails
- **Revocation**: If key is compromised, disable API key on user and generate new one

### Webhook Security
- **Secret rotation**: Rotate webhook secret periodically
- **HTTPS only**: In production, both services should use HTTPS
- **Timeout**: Use timeouts to prevent hanging requests
- **Idempotency**: Settings changes should be idempotent (safe to apply multiple times)
- **Logging**: Log all webhook attempts for security monitoring

### Network Security
- **Firewall**: Worker should only be accessible from backend IP (if possible)
- **Rate limiting**: Consider rate limiting on webhook endpoint
- **DDoS protection**: Use Cloudflare or similar for production

### Error Handling
- **Graceful degradation**: If backend unreachable, worker uses cached settings
- **Retry logic**: Settings fetch should retry with exponential backoff
- **Alerting**: Failed webhook attempts should trigger alerts
- **Fallback**: If webhook fails, settings still saved (don't block user action)

## Operational Considerations

- **Network dependency**: Worker must reach backend API (check firewall rules)
- **Authentication**: Two-way authentication (API key + webhook secret)
- **Error handling**: Worker should have fallback if backend unreachable
- **Job execution**: Worker triggers backend endpoints (not direct DB access)
- **Monitoring**: Track failed job executions and authentication failures
- **High availability**: Multiple workers can run with `SCHEDULER_IS_PRIMARY` check

## Implementation Checklist

### Phase 1: Security Setup (Do First)
- [ ] Create service user in Payload admin with admin role
- [ ] Generate and save API key as `WORKER_API_KEY`
- [ ] Generate webhook secret with `openssl rand -hex 32`
- [ ] Configure environment variables on both services
- [ ] Test API key authentication with curl

### Phase 2: Backend Changes
- [ ] Create `authenticateApiKey()` utility function
- [ ] Create GET `/api/settings` endpoint with API key auth
- [ ] Add `afterChange` hook to Settings collection for webhook notifications
- [ ] Create job trigger endpoints (feed/flush, feed/aggregate, etc.)
- [ ] Update `payload.config.ts` to register new endpoints
- [ ] Test Settings API with service user API key

### Phase 3: Worker Changes
- [ ] Create `payloadSettings.ts` to fetch settings from backend
- [ ] Create `schedulers/manager.ts` with dynamic lifecycle management
- [ ] Add `/webhook/settings-changed` endpoint to healthcheck server
- [ ] Update `processors/maintenance.ts` with job handlers
- [ ] Update `index.ts` to initialize scheduler manager
- [ ] Test webhook endpoint with curl

### Phase 4: Migration
- [ ] Migrate one scheduler at a time (start with simplest)
- [ ] Test each scheduler executes correctly
- [ ] Verify Settings changes trigger webhook and restart schedulers
- [ ] Monitor logs for authentication failures
- [ ] Test failover scenarios (backend down, worker down)

### Phase 5: Cleanup
- [ ] Remove scheduler initialization from backend `onInit`
- [ ] Remove node-cron dependency from backend (if no longer needed)
- [ ] Update documentation
- [ ] Deploy to staging and test end-to-end
- [ ] Deploy to production with monitoring

### Phase 6: Validation
- [ ] Verify all schedulers running on worker
- [ ] Test Settings changes apply without restart
- [ ] Check Redis costs are reduced
- [ ] Monitor for any authentication failures
- [ ] Set up alerts for webhook failures
