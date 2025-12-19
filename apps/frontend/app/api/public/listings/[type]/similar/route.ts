import { tag } from "@unevent/shared";
import { fetchWithRetry } from "@/lib/server/fetcher";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 120;
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
  const listingId = url.searchParams.get("listingId");
  const cityId = url.searchParams.get("cityId");
  const suitableFor = url.searchParams.getAll("suitableFor");

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
  search.set("limit", String(limit || 10));
  search.set("depth", "2");
  search.set("sort", "-rating");
  search.set("where[moderationStatus][equals]", "approved");

  if (listingId) {
    // Payload uses not_in for excluding IDs, even for a single value
    search.set("where[id][not_in][0]", listingId);
  }
  if (cityId) {
    search.set("where[city][equals]", cityId);
  }
  suitableFor.forEach((value, index) => {
    if (value) {
      search.set(`where[suitableFor][in][${index}]`, value);
    }
  });

  // For events, exclude finished events and events that have ended
  if (type === "events") {
    search.set("where[eventStatus][not_equals]", "finished");
    search.set("where[endDate][greater_than_equal]", new Date().toISOString());
  }

  try {
    const res = await fetchWithRetry(
      `${payloadUrl}/api/${collection}?${search.toString()}`,
      {
        headers: {
          "x-tenant": "unevent",
          Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
        },
        cache: "no-store", // Dynamic route, don't cache upstream fetch
        next: {
          tags: [tag.similar(type)],
          revalidate: 120,
        },
      },
      { timeoutMs: 2000, retries: 1 },
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => `HTTP ${res.status}`);
      console.error(
        `Similar listings upstream error (${res.status}):`,
        errorText,
      );
      return new Response("Upstream error", { status: res.status });
    }

    const data = await res.json();
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=120",
        "Surrogate-Key":
          `${tag.similar(type)} ${tag.collection(type)} ${cityId ? tag.city(cityId) : ""} ${tag.tenant("unevent")}`.trim(),
      },
    });
  } catch (error) {
    console.error("Error fetching similar listings:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
