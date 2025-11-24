import { tag } from "@unevent/shared";
import { generateETag } from "@/lib/server/etag";
import { fetchWithRetry } from "@/lib/server/fetcher";
import { NextRequest } from "next/server";

export const dynamic = "force-static";
export const revalidate = 900;
export const fetchCache = "force-cache";
export const preferredRegion = "auto";

const BACKEND_TYPES = ["locations", "services", "events"] as const;
const FRONT_TO_BACK: Record<string, (typeof BACKEND_TYPES)[number]> = {
  locatii: "locations",
  servicii: "services",
  evenimente: "events",
};

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const rawType = url.searchParams.get("listingType");
  const listingType =
    (rawType &&
      (BACKEND_TYPES.includes(rawType as any)
        ? (rawType as (typeof BACKEND_TYPES)[number])
        : FRONT_TO_BACK[rawType])) ||
    null;

  if (!listingType) {
    return new Response("Invalid listingType parameter", { status: 400 });
  }

  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!payloadUrl) {
    return new Response("PAYLOAD_INTERNAL_URL not configured", { status: 500 });
  }

  if (!process.env.SVC_TOKEN) {
    return new Response("SVC_TOKEN not configured", { status: 500 });
  }

  const upstream = `${payloadUrl}/api/hub?listingType=${listingType}`;

  try {
    const res = await fetchWithRetry(
      upstream,
      {
        headers: {
          "x-tenant": "unevent",
          Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
        },
        cache: "force-cache",
        next: { tags: [tag.hubSnapshot(listingType), tag.hubAny()] },
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
      "Surrogate-Key": `${tag.hubSnapshot(listingType)} ${tag.hubAny()} ${tag.tenant("unevent")}`,
      ETag: etag,
    });

    if (req.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers });
    }

    return new Response(body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error fetching hub snapshot:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
