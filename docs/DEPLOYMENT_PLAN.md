

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
| Database         | Neon.tech      | Free Postgres, 3GB storage               |
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
      NODE_ENV: development
    depends_on:
      - db
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: payload
      POSTGRES_PASSWORD: strongpassword
      POSTGRES_DB: unevent
    volumes:
      - ./data/db:/var/lib/postgresql/data
```

### 2.4 Deploy for Testing (Free Stack)

To deploy UnEvent for free using managed services:
1. **Create Neon Project**  
   - Go to [Neon.tech](https://neon.tech), create a Postgres project, and copy the `DATABASE_URI`.
2. **Deploy Payload to Render**  
   - Connect your GitHub repo.
   - Set build command: `pnpm install && pnpm build`
   - Set start command: `pnpm start`
   - Set environment variables:
     - `DATABASE_URI` (from Neon)
     - `PAYLOAD_SECRET` (random string)
     - `PORT=10000`
3. **Deploy Frontend to Vercel**  
   - Connect your Next.js frontend to Vercel.
   - Set env var: `NEXT_PUBLIC_API_URL` (pointing to your Render backend URL)
4. **Optional: Configure Cloudflare R2** for uploads  
   - Set up R2 bucket, get credentials, and configure in Payload.

### 2.5 Notes
- Free Render and Neon services may sleep after inactivity (cold start delay).
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
| File Storage| Cloudflare R2 / AWS S3   | Scalable, redundant media storage      |
| Frontend   | Vercel                    | CDN edge network, fast SEO             |
| Cache      | Upstash Redis (optional)  | For caching & notifications            |
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
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: payload
      POSTGRES_PASSWORD: strongpassword
      POSTGRES_DB: unevent
    volumes:
      - ./data/db:/var/lib/postgresql/data
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
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### 3.5 Storage Configuration

To use Cloudflare R2 for file uploads with Payload, integrate the Cloud Storage plugin:
```ts
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'
```
Configure the plugin in your Payload config with your R2 credentials.

### 3.6 Scaling & Monitoring
- Use Render's autoscaling or Docker Swarm/Kubernetes for horizontal scaling.
- Enable Sentry for real-time error tracking.
- Use Better Stack or Uptime Kuma for uptime and health monitoring.

### 3.7 Security
- Enforce HTTPS (via Render or Nginx reverse proxy)
- Rotate API keys and secrets regularly.
- Use strong `PAYLOAD_SECRET` and database credentials.

---

## 4. Environment Variables (for all environments)

Common environment variables used by UnEvent:
```
DATABASE_URI=
PAYLOAD_SECRET=
NODE_ENV=
PORT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_ENDPOINT=
NEXT_PUBLIC_API_URL=
```

---

## 5. Summary

| Environment | Backend         | Database     | Storage    | Frontend       | Notes           |
|-------------|----------------|--------------|------------|----------------|-----------------|
| Dev/Test    | Render (Free)  | Neon         | Local/R2   | Vercel (Free)  | Cold start OK   |
| Production  | Render/Docker VPS | Neon/Supabase | R2/S3  | Vercel Pro     | Monitored & scalable |

> For production, prefer managed services like Render + Neon + R2 for simplicity, reliability, and scalability.