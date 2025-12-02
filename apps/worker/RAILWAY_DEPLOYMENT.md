# Railway Deployment Guide for Worker Service

This guide explains how to deploy the worker service to Railway in a monorepo setup.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository connected to Railway
- Upstash Redis instance (or other Redis provider)
- Resend API key (for email sending)

## Step-by-Step Deployment

### 1. Create New Service in Railway

1. Go to your Railway project dashboard
2. Click **"New"** → **"Empty Service"**
3. Connect your GitHub repository (if not already connected)
4. Select your repository

### 2. Configure Service Settings

In the service settings:

#### **Root Directory**
- **Leave empty** or set to `.` (repo root)
- **DO NOT** set to `apps/worker` - the Dockerfile expects repo root

#### **Deploy Method**
- Select **"Dockerfile"**

#### **Dockerfile Path**
- Set to: `apps/worker/Dockerfile`
- This tells Railway where to find the Dockerfile

#### **Docker Build Context**
- Set to: `.` (repo root)
- This is the context Docker uses when building

### 3. Configure Environment Variables

Go to **"Variables"** tab and add:

#### Required

```env
# Redis (Upstash TLS - preferred)
UPSTASH_REDIS_URL=rediss://default:password@host:6380

# OR use fallback Redis configuration
# REDIS_HOST=your-redis-host
# REDIS_PASSWORD=your-redis-password
# REDIS_PORT=6380
# REDIS_TLS=true
```

#### Optional (but recommended)

```env
# Server
PORT=3001
NODE_ENV=production

# Sentry (Error Tracking)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@unevent.com
ADMIN_EMAILS=admin@unevent.com,admin2@unevent.com

# Scheduler
ADMIN_DIGEST_TIME=07:00
```

#### Development/Testing (remove in production)

```env
# Override all emails to test address (for development)
TEST_EMAIL=your-test-email@example.com
```

### 4. Port Configuration

Railway automatically:
- Assigns a port via `$PORT` environment variable
- Exposes the service on that port
- The worker already uses `process.env.PORT || 3001`, so it will work automatically

**No additional port configuration needed!**

### 5. Deploy

1. Railway will automatically detect the Dockerfile
2. Click **"Deploy"** or push to your main branch (if auto-deploy is enabled)
3. Monitor the build logs to ensure it builds successfully

### 6. Verify Deployment

Once deployed, check:

1. **Build Logs**: Should show successful build
2. **Deployment Logs**: Should show:
   ```
   [Redis] Connected to Upstash Redis (TLS)
   [Healthcheck] Server listening on port 3001
   [Schedulers] Heartbeat scheduler registered
   [Schedulers] Admin digest scheduler registered
   ```

3. **Health Check**: Railway will automatically check `/health` endpoint
4. **Ready Check**: You can manually check `/ready` endpoint via Railway's public URL

## Alternative: Using Build Commands (Not Recommended)

If you prefer not to use Docker, you can use build commands instead:

### Settings

- **Root Directory**: `.` (repo root)
- **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter @unevent/worker build`
- **Start Command**: `pnpm --filter @unevent/worker start`

### Additional Configuration

- Set `NODE_VERSION=20` in environment variables
- Railway will use Node.js 20 to run the service

**Note**: Docker is recommended because it ensures consistent builds and includes all dependencies.

## Troubleshooting

### Build Fails

**Error**: `Cannot find module '@unevent/shared'`
- **Fix**: Ensure `packages/shared` is copied in Dockerfile (already done)

**Error**: `pnpm: command not found`
- **Fix**: Dockerfile should install pnpm (already done via `corepack`)

### Service Won't Start

**Error**: `Port already in use`
- **Fix**: Railway provides `$PORT` automatically, ensure worker uses `process.env.PORT` (already done)

**Error**: `Redis connection failed`
- **Fix**: Check `UPSTASH_REDIS_URL` is set correctly and Redis eviction policy is `noeviction`

### Emails Not Sending

**Error**: `RESEND_API_KEY not set`
- **Fix**: Add `RESEND_API_KEY` to Railway environment variables

**Error**: `403 Forbidden` from Resend
- **Fix**: In development, set `TEST_EMAIL` to your Resend account email (no domain verification needed)

## Monitoring

### Health Check Endpoints

Railway will automatically monitor:
- `GET /health` - Always returns 200 if server is running
- `GET /ready` - Returns 200 if Redis is connected, 503 otherwise

### Logs

View logs in Railway dashboard:
- **Deployments** → Select deployment → **View Logs**
- Look for `[Notifications]`, `[Maintenance]`, `[Email]` prefixes

### Sentry

If `SENTRY_DSN` is configured, errors will automatically be tracked in Sentry with tags:
- `component: worker`
- `component: notifications-worker`
- `component: maintenance-worker`
- `component: email`

## Updating the Service

1. Push changes to your main branch
2. Railway will automatically rebuild and redeploy (if auto-deploy is enabled)
3. Or manually trigger deployment from Railway dashboard

## Cost Considerations

- Railway charges based on usage (CPU, memory, bandwidth)
- Worker is a long-running service, so it will consume resources continuously
- Consider using Railway's "Hobby" plan for development/testing
- For production, monitor usage and upgrade as needed

## Related Documentation

- [Worker README](./README.md) - Local development and configuration
- [Email Templates](../backend/src/emails/README.md) - Email template documentation
- [Notifications Queue](../backend/src/utils/NOTIFICATIONS_QUEUE.md) - How to enqueue jobs from Payload

