# UnEvent Backend

The backend for the UnEvent platform, powered by **PayloadCMS v3**.

## 🛠 Tech Stack

*   **CMS Framework**: [PayloadCMS v3](https://payloadcms.com/) (Next.js native)
*   **Database**: PostgreSQL (`@payloadcms/db-postgres`)
*   **Caching**: Redis (Upstash)
*   **Queues/Scheduling**: BullMQ
*   **Monitoring**: Sentry

## 📂 Project Structure

### `src/collections`
Defines the content schema and access control for the application.
*   **Users**: Admin and end-users.
*   **Events**: Event listings.
*   **Locations**: Venue listings.
*   **Services**: Vendor/Service listings.

### `src/endpoints`
Custom API Routes (outside of standard Payload CRUD).
*   API for frontend data fetching that requires custom logic (e.g., aggregations, complex filters).

### `src/migrations`
PostgreSQL database migrations managed by Payload.

### `src/schedulers`
Background jobs and cron tasks (via BullMQ/node-cron) for automated processes.

## 🚀 Getting Started

### Prerequisites
*   Node.js 20+
*   pnpm
*   Docker (for local DB/Redis if not using Cloud versions)

### Installation

```bash
pnpm install
```

### Infrastructure (Local Development)

Use the root `docker-compose.yml` to spin up Postgres and Redis:

```bash
docker compose up -d
```

### Running Locally

```bash
# Run backend only
pnpm dev:backend

# Or from inside apps/backend
cd apps/backend
pnpm dev
```

The Admin UI will be available at `http://localhost:3000/admin`.
API endpoints are at `http://localhost:3000/api/...`.

## ⚙️ Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key variables:
*   `DATABASE_URI`: PostgreSQL connection string.
*   `PAYLOAD_SECRET`: Secret key for sessions/JWT.
*   `REDIS_URL`: Redis connection string.

## 📦 Scripts

*   `pnpm dev`: Start development server.
*   `pnpm generate:types`: Generate TypeScript types based on your Collections. **Run this after changing schemas.**
*   `pnpm migrate:create [name]`: Create a new migration.
*   `pnpm migrate:run`: Apply pending migrations.
