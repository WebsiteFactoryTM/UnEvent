import { tag } from "@unevent/shared";
import { generateETag } from "@/lib/server/etag";
import { fetchWithRetry } from "@/lib/server/fetcher";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

// Allow Next/Vercel to cache this route. We invalidate via ISR (revalidate) and tags.
export const dynamic = "force-static";
export const revalidate = 300; // Reduce to 5 minutes
export const fetchCache = "default-cache";
export const preferredRegion = "auto";

export async function GET(req: NextRequest) {
  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!payloadUrl) {
    return new Response("PAYLOAD_INTERNAL_URL not configured", { status: 500 });
  }

  if (!process.env.SVC_TOKEN) {
    return new Response("SVC_TOKEN not configured", { status: 500 });
  }

  try {
    const res = await fetchWithRetry(
      `${payloadUrl}/api/home`,
      {
        headers: {
          "x-tenant": "unevent",
          Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
        },
        cache: "force-cache",
        next: {
          tags: [tag.homeSnapshot(), tag.home()],
          revalidate: 300, // Fallback: 5 min
        },
      },
      { timeoutMs: 2000, retries: 1 },
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => `HTTP ${res.status}`);
      console.error(`Home endpoint error (${res.status}):`, errorText);
      return new Response("Upstream error", { status: res.status });
    }

    const body = await res.text();
    const etag = generateETag(body);
    const responseHeaders = new Headers({
      "Content-Type": "application/json",
      // Cache at the CDN for 5 minutes; allow 10 minutes of stale while revalidating
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Surrogate-Key": `${tag.homeSnapshot()} ${tag.home()} ${tag.tenant("unevent")}`,
      ETag: etag,
    });

    if (req.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers: responseHeaders });
    }

    return new Response(body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error fetching home data:", error);

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag("endpoint", "home");
        scope.setContext("request", {
          url: req.url,
        });
        Sentry.captureException(error);
      });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
