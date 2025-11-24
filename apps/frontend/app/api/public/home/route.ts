import { tag } from "@unevent/shared";
import { NextRequest } from "next/server";

export const dynamic = "force-static";
export const revalidate = 900;
export const fetchCache = "force-cache";
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
    const res = await fetch(`${payloadUrl}/api/home`, {
      headers: {
        "x-tenant": "unevent",
        Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
      },
      cache: "force-cache",
      next: { tags: [tag.homeSnapshot(), tag.home()] },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => `HTTP ${res.status}`);
      console.error(`Home endpoint error (${res.status}):`, errorText);
      return new Response("Upstream error", { status: res.status });
    }

    const data = await res.json();

    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=900",
        "Surrogate-Key": `${tag.homeSnapshot()} ${tag.home()} ${tag.tenant("unevent")}`,
      },
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
