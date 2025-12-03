import { tag } from "@unevent/shared";
import { fetchWithRetry } from "@/lib/server/fetcher";
import { NextRequest } from "next/server";

// Use auto to allow both static generation and tag-based revalidation
export const dynamic = "auto";
export const revalidate = 600;
export const fetchCache = "default-cache";
export const preferredRegion = "auto";

const ALLOWED_TYPES = ["events", "locations", "services"] as const;
type ListingType = (typeof ALLOWED_TYPES)[number];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: ListingType }> },
) {
  const { type } = await params;
  const url = req.nextUrl;

  const limit = Number(url.searchParams.get("limit") || "10");

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

  const collection = type;
  const search = new URLSearchParams();
  search.set("where[tier][equals]", "sponsored");
  search.set("where[moderationStatus][equals]", "approved");
  search.set("limit", String(limit || 10));
  search.set("depth", "2");
  search.set("sort", "-rating");

  try {
    const res = await fetchWithRetry(
      `${payloadUrl}/api/${collection}?${search.toString()}`,
      {
        headers: {
          "x-tenant": "unevent",
          Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
        },
        cache: "force-cache",
        next: {
          tags: [tag.top(type), tag.collection(type)],
        },
      },
      { timeoutMs: 2000, retries: 1 },
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => `HTTP ${res.status}`);
      console.error(`Top listings upstream error (${res.status}):`, errorText);
      return new Response("Upstream error", { status: res.status });
    }

    const data = await res.json();
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600",
        "Surrogate-Key": `${tag.top(type)} ${tag.collection(type)} ${tag.tenant("unevent")}`,
      },
    });
  } catch (error) {
    console.error("Error fetching top listings:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
