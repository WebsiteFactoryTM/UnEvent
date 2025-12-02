import express, { Request, Response } from "express";
import { Server } from "http";
import { getRedisConnection } from "./redis.js";

let server: Server | null = null;

/**
 * Start healthcheck HTTP server
 * Provides /health and /ready endpoints for monitoring
 */
export function startHealthcheckServer(port: number = 3001): void {
  if (server) {
    console.log("[Healthcheck] Server already running");
    return;
  }

  const app = express();

  // Health endpoint - always returns 200 if server is running
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "worker",
    });
  });

  // Ready endpoint - checks Redis connectivity
  app.get("/ready", async (_req: Request, res: Response) => {
    try {
      const redis = getRedisConnection();
      // Ping Redis to verify connectivity
      const result = await redis.ping();

      if (result === "PONG") {
        res.status(200).json({
          status: "ready",
          timestamp: new Date().toISOString(),
          redis: "connected",
        });
      } else {
        res.status(503).json({
          status: "not ready",
          timestamp: new Date().toISOString(),
          redis: "unexpected response",
        });
      }
    } catch (error) {
      res.status(503).json({
        status: "not ready",
        timestamp: new Date().toISOString(),
        redis: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  server = app.listen(port, () => {
    console.log(`[Healthcheck] Server listening on port ${port}`);
  });

  server.on("error", (err: Error) => {
    console.error("[Healthcheck] Server error:", err);
  });
}

/**
 * Stop healthcheck server
 */
export function stopHealthcheckServer(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log("[Healthcheck] Server stopped");
        server = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}
