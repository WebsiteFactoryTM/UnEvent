import { tag } from "@unevent/shared";
import { fetchWithRetry } from "@/lib/server/fetcher";

/**
 * BFF (Backend for Frontend) route for fetching listings with edge caching
 *
 * Caching Strategy:
 * - dynamic = "auto": Allows ISR + on-demand revalidation via tags
 * - revalidate = 300: Time-based fallback (5min) if tags don't trigger
 * - fetchCache = "default-cache": Enables fetch caching with tag support
 * - Tags: listingSlug, collection type, city - cleared when listing updates
 *
 * Note: Draft mode is handled directly by fetchListing(), which skips this BFF route
 */
export const dynamic = "auto";
export const revalidate = 300;
export const fetchCache = "default-cache";
export const preferredRegion = "auto";

type Params = {
  params: Promise<{ type: "events" | "locations" | "services"; slug: string }>;
};

export async function GET(_req: Request, { params }: Params) {
  const { type, slug } = await params;

  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!payloadUrl) {
    return new Response("PAYLOAD_INTERNAL_URL not configured", { status: 500 });
  }

  if (!process.env.SVC_TOKEN) {
    return new Response("SVC_TOKEN not configured", { status: 500 });
  }

  const authHeader = `users API-Key ${process.env.SVC_TOKEN}`;

  // Use query parameter approach (Payload v3 supports this)
  const apiUrl = `${payloadUrl}/api/${type}?where[slug][equals]=${encodeURIComponent(slug)}&includeReviewState=true&limit=1`;

  try {
    const res = await fetchWithRetry(
      apiUrl,
      {
        headers: {
          "x-tenant": "unevent",
          Authorization: authHeader,
        },
        // Use default cache + tags to enable tag-based revalidation
        cache: "default",
        next: {
          tags: [tag.listingSlug(slug), tag.collection(type)],
          revalidate: 300, // Fallback: revalidate every 5 min if tags don't trigger
        },
      },
      { timeoutMs: 2000, retries: 1 },
    );

    if (!res.ok) {
      return new Response("Not found", { status: res.status });
    }

    const data = await res.json();
    const doc = data?.docs?.[0];

    if (!doc) {
      return new Response("Not found", { status: 404 });
    }

    // Extract city slug for cache tagging
    const city = doc?.city;
    const citySlug =
      city && typeof city === "object" && "slug" in city && city.slug
        ? ` ${tag.city(city.slug)}`
        : "";

    return new Response(JSON.stringify(doc), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "Surrogate-Key": `${tag.listingSlug(slug)} ${tag.collection(type)} ${tag.tenant("unevent")}${citySlug}`,
      },
    });
  } catch (error) {
    console.error(`Error fetching listing ${type}/${slug}:`, error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
