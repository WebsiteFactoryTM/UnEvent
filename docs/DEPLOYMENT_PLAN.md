

# UnEvent Deployment Plan

## 1. Overview

UnEvent is architected as a modern web application with a clear separation of concerns:
- **Backend**: PayloadCMS (Node.js) for content and API
- **Frontend**: Next.js (V0) for the web interface
- **Database**: PostgreSQL (managed or self-hosted)
- **Cache (optional)**: Redis for performance and notifications
- **File Storage**: Cloudflare R2 or AWS S3 for user uploads and media

---

## 2. Development Deployment (Free / Local Setup)

### 2.1 Objectives
The development stack should be simple to run locally and free to host for testing and prototyping. This enables fast iteration and easy onboarding for contributors.

### 2.2 Recommended Stack

| Layer            | Service         | Notes                                    |
|------------------|----------------|------------------------------------------|
| Backend (Payload)| Render (free)  | Free tier, auto-deploy from GitHub       |
| Database         | Neon.tech      | Free Postgres, 0.5GB storage (see STORAGE_CAPACITY_ESTIMATE.md) |
| Cache (Redis)    | Upstash (free) | Free Redis, 10K commands/day, compatible with ioredis |
| Storage          | Local or R2    | R2 free tier or local uploads            |
| Frontend         | Vercel (free)  | Hosts Next.js frontend                   |
| Monitoring       | Sentry (free)  | Basic error tracking                     |

### 2.3 Local Docker Setup

You can run the full UnEvent stack locally with Docker Compose:
```bash
docker compose up -d
```
Example `docker-compose.yml` for local development:
```yaml
version: '3.8'
services:
  payload:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URI: postgres://payload:strongpassword@db:5432/unevent
      PAYLOAD_SECRET: devsecret
      REDIS_HOST: redis
      REDIS_PORT: 6379
      NODE_ENV: development
    depends_on:
      - db
      - redis
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: payload
      POSTGRES_PASSWORD: strongpassword
      POSTGRES_DB: unevent
    volumes:
      - ./data/db:/var/lib/postgresql/data
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - ./data/redis:/data
```

### 2.4 Deploy for Testing (Free Stack)

To deploy UnEvent for free using managed services:
1. **Create Neon Project**  
   - Go to [Neon.tech](https://neon.tech), create a Postgres project, and copy the `DATABASE_URI`.
2. **Set up Upstash Redis (Free)**  
   - Go to [Upstash.com](https://upstash.com), create a free Redis database
   - Copy connection details: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
   - Free tier: 10K commands/day, perfect for testing
3. **Deploy Payload to Render**  
   - Connect your GitHub repo.
   - Set build command: `pnpm install && pnpm build`
   - Set start command: `pnpm start`
   - Set environment variables:
     - `DATABASE_URI` (from Neon)
     - `PAYLOAD_SECRET` (random string)
     - `UPSTASH_REDIS_REST_URL` (from Upstash REST API section)
     - `UPSTASH_REDIS_REST_TOKEN` (from Upstash REST API section)
     - OR use Redis Protocol: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
     - `PORT=10000`
4. **Deploy Frontend to Vercel**  
   - Connect your Next.js frontend to Vercel.
   - Set env vars:
     - `NEXT_PUBLIC_API_URL` (pointing to your Render backend URL)
     - `UPSTASH_REDIS_REST_URL` (from Upstash REST API section)
     - `UPSTASH_REDIS_REST_TOKEN` (from Upstash REST API section)
     - OR use Redis Protocol: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
5. **Optional: Configure Cloudflare R2** for uploads  
   - Set up R2 bucket, get credentials, and configure in Payload.

### 2.5 Notes
- Free Render and Neon services may sleep after inactivity (cold start delay).
- **Neon Free Tier**: 0.5GB storage is sufficient for testing and small production sites (~8,000-12,000 listings with 14K cities already loaded). See `STORAGE_CAPACITY_ESTIMATE.md` for detailed capacity breakdown.
- This setup is recommended for testing and development only.

---

## 3. Production Deployment

### 3.1 Objectives
Production deployments should prioritize:
- High reliability and uptime
- Scalability (horizontal and vertical)
- Persistent, redundant storage
- Secure HTTPS by default
- Monitoring and alerting for errors and downtime

### 3.2 Recommended Stack

| Layer      | Service                    | Reason                                 |
|------------|---------------------------|----------------------------------------|
| Backend    | Render (Starter) / Cloudways Docker | Reliable Node hosting         |
| Database   | Neon Pro or Supabase      | Managed Postgres with backups          |
| Cache (Redis)| Upstash Redis / Redis Cloud | Serverless Redis, compatible with ioredis |
| File Storage| Cloudflare R2 / AWS S3   | Scalable, redundant media storage      |
| Frontend   | Vercel                    | CDN edge network, fast SEO             |
| Monitoring | Sentry + Better Stack     | Errors & uptime                        |
| CI/CD      | GitHub → Render/Vercel    | Auto-deploy on push                    |

### 3.3 Docker Deployment (Cloudways / VPS)

Example `docker-compose.yml` for production:
```yaml
version: '3.8'
services:
  payload:
    build: .
    restart: always
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - db
      - redis
  db:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: payload
      POSTGRES_PASSWORD: strongpassword
      POSTGRES_DB: unevent
    volumes:
      - ./data/db:/var/lib/postgresql/data
  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - ./data/redis:/data
    command: redis-server --appendonly yes
```

### 3.4 Render Deployment (Managed Node)

Sample `render.yaml`:
```yaml
services:
  - type: web
    name: unevent-backend
    env: node
    plan: starter
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
    envVars:
      - key: DATABASE_URI
        sync: false
      - key: PAYLOAD_SECRET
        sync: false
      # Upstash REST API (recommended)
      - key: UPSTASH_REDIS_REST_URL
        sync: false
      - key: UPSTASH_REDIS_REST_TOKEN
        sync: false
      # OR Redis Protocol (alternative)
      # - key: REDIS_HOST
      #   sync: false
      # - key: REDIS_PORT
      #   sync: false
      # - key: REDIS_PASSWORD
      #   sync: false
      - key: SENTRY_DSN
        sync: false
      - key: SENTRY_ENVIRONMENT
        value: production
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### 3.5 Redis Configuration

**Recommended Redis Services (compatible with ioredis):**

1. **Upstash Redis** (Recommended for serverless/scalable)
   - Serverless Redis with pay-per-request pricing
   - **Free tier**: 256 MB storage, 10 GB/month bandwidth (free forever)
   - Global replication, automatic backups
   - **Capacity**: Sufficient for testing and small-to-medium production (~5,000-10,000 daily page views)
   - See `REDIS_CAPACITY_ESTIMATE.md` for detailed capacity analysis
   - **Connection Methods**:
     - **REST API** (Recommended): Uses `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
     - **Redis Protocol**: Uses `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (works with ioredis)
   - Setup: Create database → Copy REST API credentials or Redis connection string

2. **Redis Cloud** (Redis Labs)
   - Managed Redis with free tier (30MB)
   - High availability, automatic failover
   - Compatible with ioredis
   - Good for production workloads

3. **AWS ElastiCache** (For AWS infrastructure)
   - Fully managed Redis on AWS
   - High performance, VPC integration
   - More expensive but enterprise-grade

4. **Self-hosted Redis** (Docker/VPS)
   - Full control, no vendor lock-in
   - Requires maintenance and backups
   - Good for cost optimization at scale

**Redis Connection Configuration:**

**Upstash REST API** (Recommended - Free tier only offers REST API)
```ts
// Install: pnpm add @upstash/redis
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})
```

**Your Code**: Your Redis client (`apps/backend/src/utils/redis.ts` and `apps/frontend/lib/redis/index.tsx`) automatically detects Upstash REST API credentials and uses `@upstash/redis` if available, otherwise falls back to `ioredis` for local Redis.

**Traditional Redis Protocol** (For local Redis, Redis Cloud, or other Redis services)
```ts
// Works with ioredis for local Redis or other Redis services
import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
})
```

**Note**: 
- **Upstash Free Tier**: Only provides REST API access (no Redis protocol)
- **Your code automatically handles both**: If `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set, it uses Upstash REST API. Otherwise, it uses traditional Redis protocol with `ioredis`
- **Install `@upstash/redis`**: Run `pnpm add @upstash/redis` in both `apps/backend` and `apps/frontend` to enable Upstash REST API support

### 3.6 Storage Configuration

**Development**: Uses local file storage (`staticDir: 'media'`) - no configuration needed.

**Production**: Uses Cloudflare R2 buckets when R2 credentials are configured.

#### R2 Bucket Setup

1. **Create R2 Buckets**:
   - Public bucket: `unevent-media-public` (for listing, avatar, event images)
   - Private bucket: `unevent-media-private` (for verification, document files) - Phase 2

2. **Configure Bucket Access**:
   - Public bucket: Enable public read access, configure CORS for your domain
   - Private bucket: No public access (will use signed URLs in Phase 2)

3. **Get R2 Credentials**:
   - Go to Cloudflare Dashboard → R2 → Manage R2 API Tokens
   - Create API token with read/write permissions
   - Copy `Access Key ID` and `Secret Access Key`

4. **Get R2 Endpoints**:
   - Public bucket endpoint: Found in bucket settings
   - Public URL: Configure custom domain or use R2.dev URL

#### Environment Variables

Set these in production (leave unset for local development):

```bash
# R2 Credentials (shared between buckets)
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key

# Public Bucket
R2_PUBLIC_BUCKET=unevent-media-public
R2_PUBLIC_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev  # Optional: Custom domain or R2.dev URL

# Private Bucket (Phase 2 - for verification/document files)
# R2_PRIVATE_BUCKET=unevent-media-private
# R2_PRIVATE_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

#### Implementation Details

- **Cloud Storage Plugin**: Automatically enabled when R2 credentials are present
- **Bucket Selection**: Files are automatically routed to the correct bucket based on context:
  - `listing`, `avatar`, `event` → Public bucket
  - `verification`, `document` → Private bucket
- **File Organization**: Files are prefixed by context (`listing/`, `avatar/`, `event/`, `verification/`, `document/`)
- **Access Control**: Media collection access control restricts `verification` and `document` contexts to authenticated users only
- **Local Development**: When R2 credentials are not set, files are stored locally in `apps/backend/media/` directory

### 3.7 Sentry Integration

Sentry provides real-time error tracking, performance monitoring, and release tracking for both backend and frontend.

#### 3.7.1 Backend Sentry Setup (PayloadCMS)

**1. Install Sentry SDK:**
```bash
cd apps/backend
pnpm add @sentry/node @sentry/profiling-node
```

**2. Initialize Sentry in your Payload config** (`src/payload.config.ts`):
```ts
import * as Sentry from '@sentry/node'

// Initialize Sentry before anything else
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.authorization
    }
    return event
  },
})

export default buildConfig({
  // ... your existing config
  onInit: async (payload) => {
    // Optional: Track Payload initialization
    Sentry.setTag('service', 'payload-cms')
  },
  // ... rest of config
})
```

**3. Add Sentry error handler middleware** (create `src/middleware/sentry.ts`):
```ts
import * as Sentry from '@sentry/node'
import type { PayloadRequest } from 'payload'

export const sentryErrorHandler = (err: Error, req: PayloadRequest) => {
  Sentry.withScope((scope) => {
    scope.setContext('request', {
      url: req.url,
      method: req.method,
      headers: {
        // Don't log sensitive headers
        'user-agent': req.headers['user-agent'],
      },
    })
    
    if (req.user) {
      scope.setUser({
        id: String(req.user.id),
        email: req.user.email,
      })
    }
    
    Sentry.captureException(err)
  })
}
```

**4. Wrap error handlers** in your endpoints and hooks:
```ts
import { sentryErrorHandler } from '@/middleware/sentry'

export const myEndpoint = async (req: PayloadRequest) => {
  try {
    // Your endpoint logic
  } catch (error) {
    sentryErrorHandler(error as Error, req)
    throw error
  }
}
```

**5. Add Sentry to environment variables:**
```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
```

#### 3.7.2 Frontend Sentry Setup (Next.js)

**1. Install Sentry SDK:**
```bash
cd apps/frontend
pnpm add @sentry/nextjs
```

**2. Initialize Sentry** (run Sentry wizard or manually):
```bash
npx @sentry/wizard@latest -i nextjs
```

**3. Manual setup** (if not using wizard):

Create `sentry.client.config.ts`:
```ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies
    }
    return event
  },
})
```

Create `sentry.server.config.ts`:
```ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
})
```

Create `sentry.edge.config.ts`:
```ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
})
```

**4. Update `next.config.mjs`** to include Sentry:
```js
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig = {
  // ... your existing config
}

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
})
```

**5. Add error boundary** (optional, in `app/error.tsx`):
```tsx
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

**6. Add Sentry to environment variables:**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

#### 3.7.3 Sentry Setup Steps

1. **Create Sentry Account**: Go to [sentry.io](https://sentry.io) and create a free account
2. **Create Projects**: 
   - Create a project for "Node.js" (backend)
   - Create a project for "Next.js" (frontend)
3. **Get DSN**: Copy the DSN from each project settings
4. **Configure Environment Variables**: Add DSNs to your deployment environment
5. **Set Up Release Tracking** (optional): Configure source maps and releases for better debugging

#### 3.7.4 Sentry Best Practices

- **Filter Sensitive Data**: Always filter out passwords, tokens, and personal information
- **Set Appropriate Sample Rates**: Use lower sample rates in production (0.1) to reduce costs
- **Use Environments**: Tag errors with environment (development, staging, production)
- **Set Up Alerts**: Configure alerts for critical errors
- **Track Releases**: Use Sentry releases to track which version introduced errors
- **Performance Monitoring**: Enable performance monitoring for slow API calls

### 3.8 Scaling & Monitoring
- Use Render's autoscaling or Docker Swarm/Kubernetes for horizontal scaling.
- Enable Sentry for real-time error tracking (see section 3.7).
- Use Better Stack or Uptime Kuma for uptime and health monitoring.

### 3.9 Security
- Enforce HTTPS (via Render or Nginx reverse proxy)
- Rotate API keys and secrets regularly.
- Use strong `PAYLOAD_SECRET` and database credentials.

---

## 4. Deployment Checklist

### Pre-Deployment Checklist

#### Backend Setup
- [ ] **Database**: Create PostgreSQL database (Neon/Supabase)
  - [ ] Copy `DATABASE_URI` connection string
  - [ ] Run migrations if needed
- [ ] **Redis**: Set up Redis instance (Upstash/Redis Cloud)
  - [ ] Create Redis database
  - [ ] **For Upstash** (Free tier - REST API only):
    - [x] Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from Upstash dashboard
    - [x] Install `@upstash/redis`: `pnpm add @upstash/redis` in backend and frontend
  - [x] **For Local Redis or Redis Cloud** (Redis Protocol):
    - [ ] Set `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` environment variables
  - [x] Test connection
- [ ] **Storage**: Configure file storage (Cloudflare R2 for production)
  - [ ] Create R2 public bucket: `unevent-media-public`
  - [ ] Configure public bucket: Enable public read, set up CORS for your domain
  - [ ] Create R2 private bucket: `unevent-media-private`
  - [ ] Configure private bucket: No public access (access controlled via PayloadCMS)
  - [ ] Generate R2 API token with read/write permissions
  - [ ] Copy access key ID and secret access key
  - [ ] Get R2 endpoint URLs from bucket settings
  - [ ] Set environment variables: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_BUCKET`, `R2_PUBLIC_ENDPOINT`, `R2_PUBLIC_URL`, `R2_PRIVATE_BUCKET`, `R2_PRIVATE_ENDPOINT`
  - [ ] Note: Leave R2 vars unset for local development (uses local file storage)
- [ ] **Backend Hosting**: Set up backend service (Render/VPS)
  - [ ] Connect GitHub repository
  - [ ] Configure build command: `pnpm install && pnpm build`
  - [ ] Configure start command: `pnpm start`
  - [ ] Set all environment variables (see section 5)
  - [ ] Enable auto-deploy from main branch
  - [ ] Test backend health endpoint

#### Frontend Setup
- [ ] **Frontend Hosting**: Set up frontend service (Vercel)
  - [ ] Connect GitHub repository
  - [ ] Configure framework: Next.js
  - [ ] Set environment variables (see section 5)
  - [ ] Configure build settings
  - [ ] Enable auto-deploy from main branch
- [ ] **API Configuration**: Point frontend to backend
     - [ ] Set `NEXT_PUBLIC_API_URL` to backend URL
     - [ ] Configure Redis connection (if frontend uses Redis)
       - [ ] Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (Upstash REST API)
       - [ ] Install `@upstash/redis`: `pnpm add @upstash/redis`
       - [ ] OR set `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` for local Redis

#### Security & Monitoring
- [ ] **Secrets**: Generate and secure all secrets
  - [ ] Generate strong `PAYLOAD_SECRET` (32+ characters)
  - [ ] Secure database credentials
  - [ ] Secure Redis password
  - [ ] Secure storage access keys
- [ ] **Monitoring**: Set up error tracking
  - [ ] Create Sentry account and projects (backend + frontend)
  - [ ] Install Sentry SDKs (`@sentry/node` for backend, `@sentry/nextjs` for frontend)
  - [ ] Configure Sentry in backend (`payload.config.ts`)
  - [ ] Configure Sentry in frontend (`sentry.client.config.ts`, `sentry.server.config.ts`)
  - [ ] Add Sentry DSNs to environment variables
  - [ ] Test error reporting (trigger test error to verify)
  - [ ] Set up Sentry alerts for critical errors
  - [ ] Configure release tracking (optional)
  - [ ] Set up uptime monitoring (Better Stack/Uptime Kuma)
- [ ] **SSL/HTTPS**: Ensure HTTPS is enabled
  - [ ] Verify backend has HTTPS (Render/VPS)
  - [ ] Verify frontend has HTTPS (Vercel)

#### Testing
- [ ] **Smoke Tests**: Verify basic functionality
  - [ ] Backend API responds
  - [ ] Frontend loads correctly
  - [ ] Database connection works
  - [ ] Redis connection works
  - [ ] File uploads work (if configured)
- [ ] **Integration Tests**: Verify key flows
  - [ ] User registration/login
  - [ ] Content creation
  - [ ] API endpoints respond correctly
  - [ ] Cache invalidation works

### Post-Deployment Checklist

- [ ] **Verify Deployment**: Check all services are running
  - [ ] Backend is accessible
  - [ ] Frontend is accessible
  - [ ] Database is connected
  - [ ] Redis is connected
- [ ] **Monitor Logs**: Check for errors
  - [ ] Backend logs (Render/VPS)
  - [ ] Frontend logs (Vercel)
  - [ ] Sentry error reports (verify errors are being captured)
  - [ ] Check Sentry dashboard for new issues
  - [ ] Verify Sentry alerts are configured correctly
- [ ] **Performance**: Monitor performance metrics
  - [ ] Response times
  - [ ] Database query performance
  - [ ] Redis cache hit rates
- [ ] **Backup**: Verify backups are configured
  - [ ] Database backups (Neon/Supabase)
  - [ ] Redis persistence (if self-hosted)
  - [ ] File storage redundancy

---

## 5. Environment Variables (for all environments)

### Backend Environment Variables

```bash
# Database
DATABASE_URI=postgresql://user:password@host:5432/database

# Payload CMS
PAYLOAD_SECRET=your-secret-key-min-32-characters

# Redis - Upstash REST API (Recommended)
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-rest-token

# OR Redis - Traditional Protocol (Alternative, works with ioredis)
# REDIS_HOST=your-redis-host.upstash.io
# REDIS_PORT=6379
# REDIS_PASSWORD=your-redis-password
# REDIS_DB=0

# Storage (Cloudflare R2) - Production only
# Leave unset for local development (uses local file storage)
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key

# Public Bucket (for listing, avatar, event images)
R2_PUBLIC_BUCKET=unevent-media-public
R2_PUBLIC_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev  # Public R2 URL (if custom domain configured)

# Private Bucket (for verification, document files)
R2_PRIVATE_BUCKET=unevent-media-private
R2_PRIVATE_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# Sentry (Error Tracking)
SENTRY_DSN=https://your-dsn@sentry.io/backend-project-id
SENTRY_ENVIRONMENT=production

# Application
NODE_ENV=production
PORT=10000
```

### Frontend Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com

# Redis - Upstash REST API (if frontend uses Redis)
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-rest-token
# Note: Install @upstash/redis package: pnpm add @upstash/redis

# OR Redis - Traditional Protocol (For local Redis or Redis Cloud)
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
# REDIS_DB=0

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/frontend-project-id
SENTRY_DSN=https://your-dsn@sentry.io/frontend-project-id
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-frontend-project
SENTRY_AUTH_TOKEN=your-auth-token  # For source maps upload

# Next.js
NODE_ENV=production
```

---

## 6. Summary

| Environment | Backend         | Database     | Redis Cache | Storage    | Frontend       | Notes           |
|-------------|----------------|--------------|-------------|------------|----------------|-----------------|
| Dev/Test    | Render (Free)  | Neon         | Upstash Free| Local/R2   | Vercel (Free)  | Cold start OK   |
| Production  | Render/Docker VPS | Neon/Supabase | Upstash/Redis Cloud | R2/S3  | Vercel Pro     | Monitored & scalable |

### Redis Service Recommendations

**For Development/Testing:**
- **Upstash Free Tier**: 10K commands/day, perfect for testing, fully compatible with ioredis

**For Production:**
- **Upstash**: Serverless, pay-per-request, global replication, best for variable workloads
- **Redis Cloud**: Managed Redis, free tier available, good for consistent workloads
- **Self-hosted**: Docker/VPS for full control and cost optimization

> For production, prefer managed services like Render + Neon + Upstash Redis + R2 for simplicity, reliability, and scalability. All Redis services recommended are fully compatible with the ioredis SDK used in UnEvent.