# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared ./packages/shared
COPY apps/worker ./apps/worker

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the worker
WORKDIR /app/apps/worker
RUN pnpm build && \
    ls -la dist/src/ && \
    test -f dist/src/index.js || (echo "ERROR: dist/src/index.js not found after build" && exit 1)

# Production stage
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared ./packages/shared

# Copy built worker (verify it exists first)
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=builder /app/apps/worker/tsconfig.json ./apps/worker/tsconfig.json

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod --filter @unevent/worker

WORKDIR /app/apps/worker

# Expose healthcheck port
EXPOSE 3001

# Run the worker (files are in dist/src/ because rootDir is ".")
CMD ["node", "dist/src/index.js"]

