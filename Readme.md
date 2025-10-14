# UnEvent

## Project Overview

UnEvent is a modern event management platform designed to provide seamless event creation, management, and participation experiences. The project leverages a powerful full-stack JavaScript/TypeScript setup to deliver a scalable, performant, and maintainable application.

## Tech Stack

- **Next.js** – React framework for the frontend.
- **PayloadCMS v3** – Headless CMS for backend content management.
- **PostgreSQL** – Relational database for data storage.
- **Redis** – In-memory data store used for caching and session management.
- **pnpm Workspaces** – Efficient monorepo package management.
- **Docker** – Containerization for consistent development and deployment environments.

## Repository Structure

- `apps/backend` – Contains the PayloadCMS backend application.
- `apps/frontend` – Contains the Next.js frontend application.
- `packages/shared` – Shared utilities and components used across backend and frontend.

## Requirements

Before getting started, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (v18+ recommended)
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

## Collaboration Guidelines

Welcome aboard! To get started quickly:

- Follow the [Setup Instructions](#setup-instructions) to get your environment running.
- Make sure to keep your branch up to date with the main branch.
- Use pnpm workspaces to manage dependencies efficiently.
- For any environment-specific configurations, update your `.env` files accordingly.
- Reach out to the team or check the documentation if you encounter any issues.
- When contributing, please write clear commit messages and follow the project's coding standards.

By following these guidelines, developers like Ernest can onboard smoothly and contribute effectively to the UnEvent project.
