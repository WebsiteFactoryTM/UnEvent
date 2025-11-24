import { NextRequest } from "next/server";
import { tag } from "@unevent/shared";

const VALID_ENTITIES = ["locations", "events", "services"] as const;
type Entity = (typeof VALID_ENTITIES)[number];
const LOCALIZED_MAP: Record<string, Entity> = {
  locatii: "locations",
  evenimente: "events",
  servicii: "services",
};

export const dynamic = "force-static";
export const revalidate = 60;
export const fetchCache = "force-cache";
export const preferredRegion = "auto";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const rawEntity = url.searchParams.get("entity");
  const entityParam =
    (rawEntity &&
      (VALID_ENTITIES.includes(rawEntity as Entity)
        ? (rawEntity as Entity)
        : LOCALIZED_MAP[rawEntity])) ||
    "locations";

  if (!VALID_ENTITIES.includes(entityParam)) {
    return new Response("Invalid entity parameter", { status: 400 });
  }

  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!payloadUrl) {
    return new Response("PAYLOAD_INTERNAL_URL not configured", {
      status: 500,
    });
  }

  if (!process.env.SVC_TOKEN) {
    return new Response("SVC_TOKEN not configured", { status: 500 });
  }

  const searchParams = new URLSearchParams(url.searchParams);
  searchParams.set("entity", entityParam);
  const city = searchParams.get("city");
  const upstream = `${payloadUrl}/api/feed?${searchParams.toString()}`;

  try {
    const res = await fetch(upstream, {
      headers: {
        "x-tenant": "unevent",
        Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
      },
      cache: "force-cache",
      next: {
        tags: [
          tag.tenant("unevent"),
          tag.collection(entityParam),
          ...(city ? [tag.city(city)] : []),
        ],
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => `HTTP ${res.status}`);
      console.error(`Feed upstream error (${res.status}):`, errorText);
      return new Response("Upstream error", { status: res.status });
    }

    const data = await res.json();
    const surrogateKey = [
      tag.tenant("unevent"),
      tag.collection(entityParam),
      city ? tag.city(city) : "",
    ]
      .filter(Boolean)
      .join(" ");

    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
        "Surrogate-Key": surrogateKey,
      },
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
