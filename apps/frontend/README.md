# UnEvent Frontend

The modern, responsive frontend for the UnEvent platform, built with **Next.js 15 (App Router)** and **Tailwind CSS 4**.

## 🛠 Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
*   **Components**: [Radix UI](https://www.radix-ui.com/) primitives + Lucide React icons
*   **Data Fetching**: [React Query](https://tanstack.com/query/latest) (`@tanstack/react-query`)
*   **Validation**: `zod` + `react-hook-form`
*   **Integrations**:
    *   Google Maps (via `lib/mapManager.ts`)
    *   Redis (Upstash) for caching
    *   Sentry for error tracking

## 📂 Project Structure

### `app/(main)`
The core application routes.
*   `[listingType]/*`: Dynamic routes for listing types (e.g., events, locations).
*   `auth/*`: Authentication flows (login, register).
*   `cont/*`: User dashboard and account management.
*   `profil/*`: Public user profiles.
*   `search/*`: Global search functionality.

### `lib/`
Core logic and utilities.
*   `api/`: Backend-for-Frontend fetchers and API wrappers.
*   `react-query/`: Query Client provider and hydration setup.
*   `tracking/`: Analytics, Pixel, and GTM implementations.
*   `mapManager.ts`: Abstraction for Google Maps interactions.

### `components/`
*   `ui/`: Reusable, atomic UI components (Button, Input, Dialog, etc.).
*   `listing/`: Listing cards, grids, and filters.
*   `auth/`: Authentication forms and guards.

## 🚀 Getting Started

### Prerequisites
*   Node.js 20+
*   pnpm (used exclusively)

### Installation
From the monorepo root:

```bash
pnpm install
```

### Running Locally

```bash
# Run frontend only
pnpm dev:frontend

# Or from inside apps/frontend
cd apps/frontend
pnpm dev
```

The app will be available at `http://localhost:3000`.

## ⚙️ Configuration

Environment variables should be defined in a `.env` or `.env.local` file.
See `.env.example` in the root (or create one based on `next.config.mjs` requirements).

Key variables typically include:
*   `NEXT_PUBLIC_API_URL`: Backend API URL.
*   `NEXT_PUBLIC_GOOGLE_MAPS_KEY`: Maps API key.
*   `NEXT_PUBLIC_SITE_URL`: Canonical URL of the site.

## 📦 Scripts

*   `pnpm dev`: Start development server (Turbo).
*   `pnpm build`: Build for production.
*   `pnpm start`: Start production server.
*   `pnpm lint`: Run ESLint.
