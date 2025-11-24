import { tag } from "@unevent/shared";

export const dynamic = "force-static";
export const revalidate = 900;
export const fetchCache = "force-cache";
export const preferredRegion = "auto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const listingType = url.searchParams.get("listingType") as
    | "locations"
    | "services"
    | "events"
    | null;

  if (
    !listingType ||
    !["locations", "services", "events"].includes(listingType)
  ) {
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
    const res = await fetch(upstream, {
      headers: {
        "x-tenant": "unevent",
        Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
      },
      cache: "force-cache",
      next: { tags: [tag.hubSnapshot(listingType), tag.hubAny()] },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => `HTTP ${res.status}`);
      console.error(`Hub endpoint error (${res.status}):`, errorText);
      return new Response("Upstream error", { status: res.status });
    }

    const data = await res.json();

    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=900",
        "Surrogate-Key": `${tag.hubSnapshot(listingType)} ${tag.hubAny()} ${tag.tenant("unevent")}`,
      },
    });
  } catch (error) {
    console.error("Error fetching hub snapshot:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
