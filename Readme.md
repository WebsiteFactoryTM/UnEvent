# UnEvent

## Project Overview

UnEvent is a modern event management platform designed to provide seamless event creation, management, and participation experiences. The project leverages a powerful full-stack JavaScript/TypeScript setup to deliver a scalable, performant, and maintainable application.

## Tech Stack

### Frontend
- **Next.js 15** (App Router) – React framework with server-side rendering and static generation
- **React 19** – UI library
- **TypeScript** – Type-safe development
- **Tailwind CSS 4** – Utility-first CSS framework with black-and-white minimalist design
- **React Query (TanStack Query)** – Server state management and data fetching
- **React Hook Form + Zod** – Form handling and validation
- **ioredis** – Redis client for caching
- **NextAuth.js** – Authentication
- **shadcn/ui** – UI component library

### Backend
- **PayloadCMS v3** – Headless CMS and API framework
- **Node.js** – Runtime environment
- **PostgreSQL** – Relational database (via `@payloadcms/db-postgres`)
- **Redis** (ioredis) – In-memory data store for caching and performance
- **Next.js 15** – PayloadCMS runs on Next.js

### Infrastructure & Tools
- **PostgreSQL** – Primary database (Neon.tech for cloud, Docker for local)
- **Redis** – Caching layer (Upstash for cloud, Docker for local)
- **Cloudflare R2 / AWS S3** – File storage for media uploads
- **Docker & Docker Compose** – Containerization for local development
- **pnpm Workspaces** – Monorepo package management
- **TypeScript** – Type safety across the stack

### Monitoring & Deployment (Optional)
- **Sentry** – Error tracking and performance monitoring
- **Vercel** – Frontend hosting
- **Render** – Backend hosting
- **Neon.tech** – Managed PostgreSQL
- **Upstash** – Serverless Redis

### Development Tools
- **ESLint** – Code linting
- **Prettier** – Code formatting
- **Vitest** – Unit testing
- **Playwright** – E2E testing

## Architecture

UnEvent follows a **monorepo architecture** with clear separation between frontend and backend:

- **Backend** (`apps/backend`): PayloadCMS v3 with PostgreSQL, providing REST and GraphQL APIs
- **Frontend** (`apps/frontend`): Next.js 15 App Router with React Server Components and Client Components
- **Shared** (`packages/shared`): Shared utilities and types (if any)

### Key Features

- **Event Listings**: Locations, Services, and Events management
- **User Profiles**: Multi-role system (host, provider, organizer, client)
- **Reviews & Ratings**: User-generated content with moderation
- **Favorites System**: User bookmarking functionality
- **Search & Filtering**: Advanced filtering with Redis caching
- **Media Management**: Cloud storage integration (R2/S3)
- **Geographic Data**: 14,000+ Romanian cities with geo coordinates

## Repository Structure

- `apps/backend` – PayloadCMS backend application with collections, hooks, and endpoints
- `apps/frontend` – Next.js frontend application with App Router
- `packages/shared` – Shared utilities and components (if any)
- `docs/` – Documentation including deployment plans and storage estimates

## Requirements

Before getting started, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (v20.11.1+ required, see `package.json` engines)
- [pnpm](https://pnpm.io/) (version 9.1.0 is used in this project)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- Git

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repo>
   cd unevent
   ```

2. **Enable and prepare pnpm**

   ```bash
   corepack enable
   corepack prepare pnpm@9.1.0 --activate
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Create environment variable files**

   Copy example environment files to their respective locations:

   ```bash
   cp .env.example .env
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

   Update these `.env` files with your local configuration as needed.

5. **Start infrastructure services**

   This will start PostgreSQL, Redis, and other necessary services using Docker Compose:

   ```bash
   pnpm dev:infra
   ```

6. **Run the applications**

   In a separate terminal, start both backend and frontend in development mode:

   ```bash
   pnpm dev
   ```

   This runs both apps concurrently with hot-reloading enabled.

## Common Commands

- **Start infrastructure services**

  ```bash
  pnpm dev:infra
  ```

- **Stop infrastructure services**

  ```bash
  docker-compose down
  ```

- **Start backend only**

  ```bash
  pnpm dev:backend
  ```

- **Start frontend only**

  ```bash
  pnpm dev:frontend
  ```

- **Run tests**

  ```bash
  pnpm test
  ```

## Documentation

- **[Deployment Plan](docs/DEPLOYMENT_PLAN.md)** – Comprehensive guide for deploying to test and production environments
- **[Storage Capacity Estimate](docs/STORAGE_CAPACITY_ESTIMATE.md)** – Database storage capacity breakdown for Neon free tier

## Collaboration Guidelines

Welcome aboard! To get started quickly:

- Follow the [Setup Instructions](#setup-instructions) to get your environment running.
- Make sure to keep your branch up to date with the main branch.
- Use pnpm workspaces to manage dependencies efficiently.
- For any environment-specific configurations, update your `.env` files accordingly.
- Check the [Deployment Plan](docs/DEPLOYMENT_PLAN.md) for deployment procedures.
- Reach out to the team or check the documentation if you encounter any issues.
- When contributing, please write clear commit messages and follow the project's coding standards.

By following these guidelines, developers can onboard smoothly and contribute effectively to the UnEvent project.
