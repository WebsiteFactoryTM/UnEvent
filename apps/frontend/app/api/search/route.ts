import { NextRequest } from "next/server";
import { fetchWithRetry } from "@/lib/server/fetcher";
import * as Sentry from "@sentry/nextjs";

const VALID_COLLECTIONS = ["locations", "services", "events"] as const;
type SearchCollection = (typeof VALID_COLLECTIONS)[number];

type SearchDoc = {
  id: string;
  title?: string;
  description?: string;
  address?: string;
  cityName?: string;
  type?: unknown;
  imageUrl?: string;
  priority?: number;
  collection?: SearchCollection;
  // plugin also stores a polymorphic relationship to original doc
  doc?: { relationTo?: SearchCollection; value?: unknown };
  slug?: string;
  listingCollectionName?: SearchCollection;
};

export const dynamic = "force-dynamic";
export const revalidate = 60;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl;

  // Validate query parameter
  const q = url.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return jsonResponse(
      { error: 'Query parameter "q" must be at least 2 characters' },
      400,
    );
  }

  // Validate and parse collections parameter
  const collectionsParam = url.searchParams.get("collections");
  let listingCollectionName: SearchCollection[];

  if (collectionsParam) {
    const parsed = collectionsParam
      .split(",")
      .map((c) => c.trim())
      .filter((c) =>
        VALID_COLLECTIONS.includes(c as SearchCollection),
      ) as SearchCollection[];

    if (parsed.length === 0) {
      return jsonResponse(
        {
          error: `Invalid collections parameter. Must be one or more of: ${VALID_COLLECTIONS.join(
            ", ",
          )}`,
        },
        400,
      );
    }

    listingCollectionName = parsed;
  } else {
    // Default to all collections if not specified
    listingCollectionName = [...VALID_COLLECTIONS];
  }

  // Validate and parse limit
  const limitParam = url.searchParams.get("limit");
  let limit = 5; // default
  if (limitParam) {
    const parsedLimit = Number.parseInt(limitParam, 10);
    if (Number.isNaN(parsedLimit) || parsedLimit < 1) {
      return jsonResponse(
        { error: "Invalid limit parameter. Must be a positive number." },
        400,
      );
    }
    limit = Math.min(parsedLimit, 20); // max 20
  }

  // Validate and parse page
  const pageParam = url.searchParams.get("page");
  let page = 1; // default
  if (pageParam) {
    const parsedPage = Number.parseInt(pageParam, 10);
    if (Number.isNaN(parsedPage) || parsedPage < 1) {
      return jsonResponse(
        { error: "Invalid page parameter. Must be a positive number." },
        400,
      );
    }
    page = parsedPage;
  }

  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!payloadUrl) {
    return jsonResponse({ error: "API_URL not configured" }, 500);
  }

  if (!process.env.SVC_TOKEN) {
    return jsonResponse({ error: "SVC_TOKEN not configured" }, 500);
  }

  // Build upstream URL
  // NOTE: @payloadcms/plugin-search creates a normal collection called "search".
  // It does NOT support a custom `q` parameter for searching. We must use Payload's
  // standard `where` syntax.
  const upstreamParams = new URLSearchParams();

  // Pagination
  upstreamParams.set("limit", String(limit));
  upstreamParams.set("page", String(page));

  // Keep depth low. We rely on `imageUrl` stored in the search index.
  upstreamParams.set("depth", "0");

  upstreamParams.set("sort", "-tier,-favoritesCount,-rating,-views");
  const trimmedQuery = q.trim();

  // 1) Restrict results to selected collections at the DB query level.
  // We store the source collection in the indexed text field `listingCollectionName`
  // (set in the search plugin's beforeSync hook).
  // where[and][0][or][i][listingCollectionName][equals]=<collection>
  listingCollectionName.forEach((col, i) => {
    upstreamParams.set(
      `where[and][0][or][${i}][listingCollectionName][equals]`,
      col,
    );
  });

  // 2) Match query against key searchable fields
  // where[and][1][or][i][field][like]=<query>
  const searchableFields = [
    "title",
    "description",
    "address",
    "cityName",

    // NOTE: `type` is indexed as JSON (string[]). Depending on DB adapter and Payload's query validation,
    // querying JSON with `like` may be unsupported. We keep it out of the upstream query and handle it
    // in the relevance guard below.
  ] as const;

  searchableFields.forEach((field, i) => {
    upstreamParams.set(`where[and][1][or][${i}][${field}][like]`, trimmedQuery);
  });

  const upstream = `${payloadUrl}/api/search?${upstreamParams.toString()}`;

  try {
    const res = await fetchWithRetry(
      upstream,
      {
        headers: {
          "x-tenant": "unevent",
          Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
        },
        cache: "no-store",
      },
      { timeoutMs: 3000, retries: 1 },
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => `HTTP ${res.status}`);
      return jsonResponse(
        { error: "Upstream search error", details: errorText },
        res.status,
      );
    }

    const data = await res.json();

    const docs = (Array.isArray(data?.docs) ? data.docs : []) as SearchDoc[];

    const transformedDocs = docs.map((doc) => {
      const collection = (doc.listingCollectionName ||
        doc.collection ||
        doc.doc?.relationTo ||
        "locations") as SearchCollection;

      // `type` is indexed as json (string[]) but handle legacy values gracefully
      let typeArray: string[] | null = null;
      if (Array.isArray(doc.type)) {
        typeArray = doc.type.filter((t) => typeof t === "string" && t.trim());
      } else if (typeof doc.type === "string") {
        try {
          const parsed = JSON.parse(doc.type);
          if (Array.isArray(parsed)) {
            typeArray = parsed.filter((t) => typeof t === "string" && t.trim());
          } else {
            typeArray = doc.type.trim() ? [doc.type.trim()] : null;
          }
        } catch {
          typeArray = doc.type.trim() ? [doc.type.trim()] : null;
        }
      }

      const image =
        typeof doc.imageUrl === "string" && doc.imageUrl.trim()
          ? { url: doc.imageUrl, alt: doc.title ?? null }
          : null;

      return {
        id: doc.id,
        title: doc.title ?? "",
        description: doc.description ?? null,
        address: doc.address ?? null,
        cityName: doc.cityName ?? null,
        type: typeArray,
        priority: doc.priority ?? null,
        collection,
        slug: doc.slug ?? null,
        image,
      };
    });

    // Lightweight relevance guard (defensive): ensure q is present in at least one display field.
    // This prevents unexpected matches due to `like` behavior on json/text.
    const qLower = trimmedQuery.toLowerCase();
    const filteredDocs = transformedDocs.filter((doc) => {
      const haystackParts: string[] = [];
      if (doc.title) haystackParts.push(doc.title);
      if (doc.description) haystackParts.push(doc.description);
      if (doc.address) haystackParts.push(doc.address);
      if (doc.cityName) haystackParts.push(doc.cityName);
      if (Array.isArray(doc.type)) haystackParts.push(doc.type.join(" "));
      const haystack = haystackParts.join(" ").toLowerCase();
      return haystack.includes(qLower);
    });

    // Important: metadata is from upstream query (already filtered by collection + query)
    // The extra relevance guard may slightly reduce docs count on the page.
    return jsonResponse({
      docs: filteredDocs,
      totalDocs: data.totalDocs ?? filteredDocs.length,
      limit: data.limit ?? limit,
      page: data.page ?? page,
      totalPages: data.totalPages ?? 1,
      hasNextPage: data.hasNextPage ?? false,
      hasPrevPage: data.hasPrevPage ?? false,
      nextPage: data.nextPage ?? null,
      prevPage: data.prevPage ?? null,
    });
  } catch (error) {
    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag("endpoint", "search");
        scope.setContext("request", {
          q,
          collections: listingCollectionName.join(","),
          limit,
          page,
          url: url.toString(),
        });
        Sentry.captureException(error);
      });
    }

    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}
