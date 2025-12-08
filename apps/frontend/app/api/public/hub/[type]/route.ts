import { tag } from "@unevent/shared";
import { generateETag } from "@/lib/server/etag";
import { fetchWithRetry } from "@/lib/server/fetcher";
import * as Sentry from "@sentry/nextjs";

// Force dynamic rendering since we check request headers for ETag caching
export const dynamic = "force-dynamic";
export const dynamicParams = false;
export const revalidate = 900;
export const fetchCache = "default-cache";
export const preferredRegion = "auto";

const ALLOWED_TYPES = ["events", "locations", "services"] as const;
type ListingType = (typeof ALLOWED_TYPES)[number];

export function generateStaticParams() {
  return ALLOWED_TYPES.map((type) => ({ type }));
}

type RouteParams = {
  params: Promise<{ type: ListingType }>;
};

export async function GET(req: Request, { params }: RouteParams) {
  const { type } = await params;

  if (!ALLOWED_TYPES.includes(type)) {
    return new Response("Invalid listing type", { status: 400 });
  }

  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!payloadUrl) {
    return new Response("PAYLOAD_INTERNAL_URL not configured", { status: 500 });
  }

  if (!process.env.SVC_TOKEN) {
    return new Response("SVC_TOKEN not configured", { status: 500 });
  }

  const upstream = `${payloadUrl}/api/hub?listingType=${type}`;

  try {
    const res = await fetchWithRetry(
      upstream,
      {
        headers: {
          "x-tenant": "unevent",
          Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
        },
        cache: "default",
        next: {
          tags: [tag.hubSnapshot(type), tag.hubAny()],
          revalidate: 900, // Fallback: 15 min
        },
      },
      { timeoutMs: 2000, retries: 1 },
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => `HTTP ${res.status}`);
      console.error(`Hub endpoint error (${res.status}):`, errorText);
      return new Response("Upstream error", { status: res.status });
    }

    const body = await res.text();
    const etag = generateETag(body);
    const headers = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=900",
      "Surrogate-Key": `${tag.hubSnapshot(type)} ${tag.hubAny()} ${tag.tenant("unevent")}`,
      ETag: etag,
    });

    if (req.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers });
    }

    return new Response(body, { status: 200, headers });
  } catch (error) {
    console.error("Error fetching hub snapshot:", error);

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag("endpoint", "hub");
        scope.setContext("request", {
          type,
          url: req.url,
        });
        Sentry.captureException(error);
      });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
