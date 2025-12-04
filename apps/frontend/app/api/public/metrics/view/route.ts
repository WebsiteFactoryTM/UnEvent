import { NextRequest } from "next/server";
import { fetchWithRetry } from "@/lib/server/fetcher";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const VALID_KINDS = ["locations", "events", "services"] as const;
type Kind = (typeof VALID_KINDS)[number];

export async function POST(req: NextRequest) {
  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!payloadUrl) {
    return new Response("PAYLOAD_INTERNAL_URL not configured", { status: 500 });
  }

  if (!process.env.SVC_TOKEN) {
    return new Response("SVC_TOKEN not configured", { status: 500 });
  }

  try {
    const body = await req.json();
    const { listingId, kind, sessionId, userId } = body as {
      listingId: number;
      kind: string;
      sessionId?: string;
      userId?: string;
    };

    if (!listingId || !kind) {
      return new Response("listingId and kind are required", { status: 400 });
    }

    if (!VALID_KINDS.includes(kind as Kind)) {
      return new Response("Invalid kind", { status: 400 });
    }

    // Extract IP address from request headers
    // Check common proxy headers (Vercel, Cloudflare, etc.)
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfConnectingIp = req.headers.get("cf-connecting-ip"); // Cloudflare
    const ip =
      forwarded?.split(",")[0]?.trim() || realIp || cfConnectingIp || "unknown";

    const upstream = `${payloadUrl}/api/metrics/view`;

    const res = await fetchWithRetry(
      upstream,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant": "unevent",
          Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
        },
        body: JSON.stringify({ listingId, kind, sessionId, userId, ip }),
        cache: "no-store",
      },
      { timeoutMs: 2000, retries: 1 },
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => `HTTP ${res.status}`);
      console.error(`Metrics view upstream error (${res.status}):`, errorText);
      return new Response("Upstream error", { status: res.status });
    }

    const data = await res.json();
    return Response.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error recording view metric:", error);

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag("endpoint", "metrics-view");
        scope.setContext("request", {
          url: req.url,
        });
        Sentry.captureException(error);
      });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
