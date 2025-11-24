import { tag } from "@unevent/shared";
import { fetchWithRetry } from "@/lib/server/fetcher";

export const dynamic = "force-static";
export const revalidate = 86400;
export const fetchCache = "force-cache";
export const preferredRegion = "auto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fullList = url.searchParams.get("fullList") === "1";

  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!payloadUrl) {
    return new Response("PAYLOAD_INTERNAL_URL not configured", { status: 500 });
  }

  if (!process.env.SVC_TOKEN) {
    return new Response("SVC_TOKEN not configured", { status: 500 });
  }

  const res = await fetchWithRetry(
    `${payloadUrl}/api/taxonomies?fullList=${fullList ? "1" : "0"}`,
    {
      headers: {
        "x-tenant": "unevent",
        Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
      },
      cache: "force-cache",
      next: { tags: [tag.taxonomies()] },
    },
    { timeoutMs: 2000, retries: 1 },
  );

  if (!res.ok) {
    return new Response("Upstream error", { status: res.status });
  }

  const data = await res.json();

  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
      "Surrogate-Key": `${tag.taxonomies()} ${tag.tenant("unevent")}`,
    },
  });
}
