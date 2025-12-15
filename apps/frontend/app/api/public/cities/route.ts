import { NextRequest } from "next/server";
import { tag } from "@unevent/shared";
import { fetchWithRetry } from "@/lib/server/fetcher";
import { getRedis } from "@/lib/redis";
import { redisKey } from "@/lib/react-query/utils";
import { citiesKeys } from "@/lib/cacheKeys";
import { cacheTTL } from "@/lib/constants";
import type { City } from "@/types/payload-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const preferredRegion = "auto";

const CITY_POPULAR_TAG = "cities:popular";
const CITY_TYPEAHEAD_TAG = "cities:typeahead";
const DEFAULT_LIMIT = 20;
const MIN_LIMIT = 5;
const MAX_LIMIT = 50;

type CityQuery = {
  search?: string;
  limit: number;
  verifiedOnly: boolean;
  popularFallback: boolean;
};

function parseBoolean(value: string | null, fallback: boolean) {
  if (value === null) return fallback;
  if (value === "1" || value.toLowerCase() === "true") return true;
  if (value === "0" || value.toLowerCase() === "false") return false;
  return fallback;
}

function clampLimit(value: string | null) {
  if (!value) return DEFAULT_LIMIT;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return DEFAULT_LIMIT;
  return Math.min(Math.max(parsed, MIN_LIMIT), MAX_LIMIT);
}

function normalizeSearch(value: string | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildPayloadParams({
  search,
  limit,
  verifiedOnly,
  popularFallback,
}: CityQuery) {
  const params = new URLSearchParams();
  params.set("select[id]", "true");
  params.set("select[name]", "true");
  params.set("select[county]", "true");
  params.set("select[slug]", "true");
  params.set("select[geo]", "true");
  params.set("select[featured]", "true");

  if (!search && popularFallback) {
    params.set("where[featured][equals]", "true");
    params.set("sort", "name");
    params.set("limit", String(limit));
    if (verifiedOnly) params.set("where[verified][equals]", "true");
    return params;
  }

  if (search) {
    params.set("where[name][like]", search);
  }

  if (verifiedOnly) {
    params.set("where[verified][equals]", "true");
  }

  params.set("limit", String(limit));
  params.set("sort", "name");

  return params;
}

async function getRedisSafe() {
  try {
    return getRedis();
  } catch (error) {
    console.warn("[cities BFF] Redis unavailable:", error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!payloadUrl) {
    return new Response("API_URL not configured", { status: 500 });
  }

  if (!process.env.SVC_TOKEN) {
    return new Response("SVC_TOKEN not configured", { status: 500 });
  }

  const searchParams = req.nextUrl.searchParams;
  const search = normalizeSearch(searchParams.get("search"));
  const verifiedOnly = parseBoolean(searchParams.get("verifiedOnly"), false);
  const popularFallback = parseBoolean(
    searchParams.get("popularFallback"),
    true,
  );
  const limit = clampLimit(searchParams.get("limit"));

  const query: CityQuery = {
    search,
    limit,
    verifiedOnly,
    popularFallback,
  };

  const cacheKey = redisKey(
    citiesKeys.list({
      search: search ?? "",
      limit,
      verifiedOnly,
      popularFallback,
    }),
  );

  const redis = await getRedisSafe();
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const data =
          typeof cached === "string" ? (JSON.parse(cached) as City[]) : cached;
        return buildResponse(data, { search, popularFallback });
      }
    } catch (error) {
      console.warn("[cities BFF] Failed to read from Redis:", error);
    }
  }

  const params = buildPayloadParams(query);
  const upstreamUrl = `${payloadUrl}/api/cities?${params.toString()}`;

  const upstreamResponse = await fetchWithRetry(
    upstreamUrl,
    {
      headers: {
        Accept: "application/json",
        "x-tenant": "unevent",
        Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
      },
      cache: "no-store",
    },
    { timeoutMs: 2000, retries: 1 },
  );

  if (!upstreamResponse.ok) {
    const errorBody = await upstreamResponse
      .text()
      .catch(() => upstreamResponse.statusText);
    return new Response(
      `Payload cities upstream error: ${errorBody || "Unknown error"}`,
      { status: upstreamResponse.status },
    );
  }

  const payload = (await upstreamResponse.json()) as { docs?: City[] };
  const docs = Array.isArray(payload?.docs) ? payload.docs : [];

  if (redis) {
    try {
      // Reduce cache TTL to prevent stale data - cities can be deleted/updated
      // Use shorter TTL: 1 hour for search results, 6 hours for popular cities
      await redis.set(
        cacheKey,
        JSON.stringify(docs),
        "EX",
        search ? 3600 : 21600, // 1 hour for search, 6 hours for popular
      );
    } catch (error) {
      console.warn("[cities BFF] Failed to write to Redis:", error);
    }
  }

  return buildResponse(docs, { search, popularFallback });
}

function buildResponse(
  docs: City[],
  opts: { search?: string; popularFallback: boolean },
) {
  const isPopularFeed = !opts.search && opts.popularFallback;
  const surrogateKeys = new Set<string>([
    tag.tenant("unevent"),
    CITY_TYPEAHEAD_TAG,
  ]);
  if (isPopularFeed) {
    surrogateKeys.add(CITY_POPULAR_TAG);
  }

  const sMaxAge = isPopularFeed ? 3600 : 300;
  const staleWhileRevalidate = isPopularFeed ? 86400 : 1800;

  return Response.json(docs, {
    headers: {
      "Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
      "Surrogate-Key": Array.from(surrogateKeys).join(" "),
    },
  });
}
