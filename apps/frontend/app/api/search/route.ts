import { NextRequest } from "next/server";
import { fetchWithRetry } from "@/lib/server/fetcher";
import * as Sentry from "@sentry/nextjs";

const VALID_COLLECTIONS = ["locations", "services", "events"] as const;
type SearchCollection = (typeof VALID_COLLECTIONS)[number];

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(req: NextRequest) {
  const url = req.nextUrl;

  // Validate query parameter
  const q = url.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return new Response(
      JSON.stringify({
        error: 'Query parameter "q" must be at least 2 characters',
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Validate and parse collections parameter
  const collectionsParam = url.searchParams.get("collections");
  let collections: SearchCollection[] = [];

  if (collectionsParam) {
    const parsed = collectionsParam
      .split(",")
      .map((c) => c.trim())
      .filter((c) =>
        VALID_COLLECTIONS.includes(c as SearchCollection),
      ) as SearchCollection[];

    if (parsed.length === 0) {
      return new Response(
        JSON.stringify({
          error: `Invalid collections parameter. Must be one or more of: ${VALID_COLLECTIONS.join(", ")}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    collections = parsed;
  } else {
    // Default to all collections if not specified
    collections = [...VALID_COLLECTIONS];
  }

  // Validate and parse limit
  const limitParam = url.searchParams.get("limit");
  let limit = 5; // default
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return new Response(
        JSON.stringify({
          error: "Invalid limit parameter. Must be a positive number.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    limit = Math.min(parsedLimit, 20); // max 20
  }

  // Validate and parse page
  const pageParam = url.searchParams.get("page");
  let page = 1; // default
  if (pageParam) {
    const parsedPage = parseInt(pageParam, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      return new Response(
        JSON.stringify({
          error: "Invalid page parameter. Must be a positive number.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    page = parsedPage;
  }

  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!payloadUrl) {
    return new Response(JSON.stringify({ error: "API_URL not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!process.env.SVC_TOKEN) {
    return new Response(JSON.stringify({ error: "SVC_TOKEN not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Build upstream URL
  const upstreamParams = new URLSearchParams();
  upstreamParams.set("q", q.trim());
  upstreamParams.set("collections", collections.join(","));
  upstreamParams.set("limit", String(limit));
  upstreamParams.set("page", String(page));
  upstreamParams.set("depth", "2"); // Populate relationships to get images

  const upstream = `${payloadUrl}/api/search?${upstreamParams.toString()}`;

  console.log(`[Search API] Requesting search with:`, {
    q: q.trim(),
    collections: collections.join(","),
    limit,
    page,
    upstreamUrl: upstream,
  });

  try {
    const res = await fetchWithRetry(
      upstream,
      {
        headers: {
          "x-tenant": "unevent",
          Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
        },
        cache: "no-store", // Search results should be fresh
      },
      { timeoutMs: 3000, retries: 1 },
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => `HTTP ${res.status}`);
      console.error(`Search upstream error (${res.status}):`, errorText);
      return new Response(
        JSON.stringify({ error: "Upstream search error", details: errorText }),
        { status: res.status, headers: { "Content-Type": "application/json" } },
      );
    }

    const data = await res.json();

    console.log(
      `[Search API] Payload returned ${data.docs?.length || 0} results`,
    );
    console.log(
      "[Search API] Raw Payload response (first 3 docs):",
      JSON.stringify(
        {
          ...data,
          docs: data.docs?.slice(0, 3).map((d: any) => ({
            id: d.id,
            title: d.title,
            collection: d.doc?.relationTo || d.collection,
          })),
        },
        null,
        2,
      ),
    );

    // Transform the response to match our SearchResponse type
    // Payload search plugin returns results in a specific format
    // Note: We use Promise.all because the map callback is async (for fetching documents)
    const docsPromises = (data.docs || []).map(async (doc: any) => {
      // Extract collection from doc.relationTo or doc.collection
      const collection = doc.doc?.relationTo || doc.collection || "locations";

      // Filter: Only include approved listings
      // Check moderationStatus - if doc.doc.value is populated, check directly
      // Otherwise we'll check when we fetch for images
      let moderationStatus: string | null = null;
      if (
        doc.doc?.value &&
        typeof doc.doc.value === "object" &&
        doc.doc.value.moderationStatus
      ) {
        // doc.doc.value is populated, check directly
        moderationStatus = doc.doc.value.moderationStatus;
        // Skip non-approved listings early
        if (moderationStatus !== "approved") {
          console.log(
            `[Search API] Skipping doc ${doc.id} with moderationStatus: ${moderationStatus}`,
          );
          return null;
        }
      }

      // Extract slug from doc.doc.value if it's populated
      let slug: string | null = null;
      if (
        doc.doc?.value &&
        typeof doc.doc.value === "object" &&
        doc.doc.value.slug
      ) {
        slug = doc.doc.value.slug;
      } else if (doc.slug) {
        slug = doc.slug;
      }

      // Extract image - first try imageUrl from search index, then fallback to fetching doc
      let image: { url: string | null; alt: string | null } | null = null;

      console.log(`[Search API] Processing doc ${doc.id}:`, {
        hasImageUrl: !!doc.imageUrl,
        imageUrl: doc.imageUrl,
        hasDocValue: !!doc.doc?.value,
        docValueType: typeof doc.doc?.value,
        docValueKeys:
          doc.doc?.value && typeof doc.doc.value === "object"
            ? Object.keys(doc.doc.value)
            : null,
        relationTo: doc.doc?.relationTo,
      });

      // Priority 1: Use imageUrl stored in search index (from beforeSync)
      if (
        doc.imageUrl &&
        typeof doc.imageUrl === "string" &&
        doc.imageUrl.trim()
      ) {
        console.log(`[Search API] Using imageUrl from index: ${doc.imageUrl}`);
        image = {
          url: doc.imageUrl,
          alt: doc.title || null,
        };
      } else if (
        doc.doc?.value &&
        typeof doc.doc.value === "object" &&
        doc.doc.value !== null &&
        !(typeof doc.doc.value === "number")
      ) {
        console.log(
          `[Search API] Trying to extract from doc.doc.value for doc ${doc.id}`,
        );
        // Priority 2: Try to extract from populated doc.doc.value (if depth > 0)
        // Check for featuredImage
        const featuredImage = doc.doc.value.featuredImage;
        console.log(`[Search API] featuredImage for doc ${doc.id}:`, {
          exists: !!featuredImage,
          type: typeof featuredImage,
          isObject: featuredImage && typeof featuredImage === "object",
          keys:
            featuredImage && typeof featuredImage === "object"
              ? Object.keys(featuredImage)
              : null,
          url:
            featuredImage && typeof featuredImage === "object"
              ? (featuredImage as any).url
              : null,
          filename:
            featuredImage && typeof featuredImage === "object"
              ? (featuredImage as any).filename
              : null,
        });

        if (
          featuredImage &&
          typeof featuredImage === "object" &&
          featuredImage !== null
        ) {
          // Check if it has url property (populated media object)
          if ("url" in featuredImage || "filename" in featuredImage) {
            const url =
              (featuredImage.url as string) ||
              (featuredImage.filename as string);
            if (url && typeof url === "string") {
              console.log(
                `[Search API] Found image URL from featuredImage: ${url}`,
              );
              image = {
                url,
                alt: (featuredImage.alt as string) || doc.title || null,
              };
            }
          }
        }

        // Fallback to first gallery image if no featuredImage
        if (
          !image?.url &&
          doc.doc.value.gallery &&
          Array.isArray(doc.doc.value.gallery) &&
          doc.doc.value.gallery.length > 0
        ) {
          console.log(
            `[Search API] Trying gallery, first image:`,
            doc.doc.value.gallery[0],
          );
          const firstImage = doc.doc.value.gallery[0];
          if (
            firstImage &&
            typeof firstImage === "object" &&
            firstImage !== null &&
            ("url" in firstImage || "filename" in firstImage)
          ) {
            const url =
              (firstImage.url as string) || (firstImage.filename as string);
            if (url && typeof url === "string") {
              console.log(`[Search API] Found image URL from gallery: ${url}`);
              image = {
                url,
                alt: (firstImage.alt as string) || doc.title || null,
              };
            }
          }
        }
      } else if (
        !image?.url &&
        doc.doc?.relationTo &&
        doc.doc?.value &&
        typeof doc.doc.value === "number"
      ) {
        // Priority 3: Fetch the document from Payload when doc.doc.value is just an ID
        // Also check moderationStatus here since we need to fetch anyway
        try {
          const docId = doc.doc.value;
          const collection = doc.doc.relationTo;
          console.log(
            `[Search API] Fetching document ${docId} from collection ${collection} for image`,
          );

          const docUrl = `${payloadUrl}/api/${collection}/${docId}?depth=1`;
          const docRes = await fetchWithRetry(
            docUrl,
            {
              headers: {
                "x-tenant": "unevent",
                Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
              },
              cache: "no-store",
            },
            { timeoutMs: 2000, retries: 1 },
          );

          if (docRes.ok) {
            const docData = await docRes.json();

            // Check moderationStatus - skip if not approved
            if (docData.moderationStatus !== "approved") {
              console.log(
                `[Search API] Skipping doc ${docId} with moderationStatus: ${docData.moderationStatus}`,
              );
              return null;
            }

            console.log(
              `[Search API] Fetched document ${docId}, checking for images`,
            );
            console.log(`[Search API] Document ${docId} structure:`, {
              hasFeaturedImage: !!docData.featuredImage,
              featuredImageType: typeof docData.featuredImage,
              featuredImageValue: docData.featuredImage,
              hasGallery: !!docData.gallery,
              galleryIsArray: Array.isArray(docData.gallery),
              galleryLength: docData.gallery?.length || 0,
              galleryFirstItem: docData.gallery?.[0],
            });

            // Try featuredImage
            if (docData.featuredImage) {
              const featuredImage =
                typeof docData.featuredImage === "object"
                  ? docData.featuredImage
                  : null;
              console.log(`[Search API] FeaturedImage object:`, featuredImage);
              if (featuredImage?.url || featuredImage?.filename) {
                const url = featuredImage.url || featuredImage.filename || null;
                console.log(
                  `[Search API] Extracted URL from featuredImage:`,
                  url,
                );
                if (url && typeof url === "string") {
                  console.log(
                    `[Search API] Found image URL from fetched featuredImage: ${url}`,
                  );
                  image = {
                    url,
                    alt: featuredImage.alt || doc.title || null,
                  };
                } else {
                  console.log(
                    `[Search API] URL is not a valid string:`,
                    typeof url,
                    url,
                  );
                }
              } else {
                console.log(
                  `[Search API] FeaturedImage has no url or filename`,
                );
              }
            } else {
              console.log(
                `[Search API] Document ${docId} has no featuredImage`,
              );
            }

            // Fallback to gallery
            if (
              !image?.url &&
              docData.gallery &&
              Array.isArray(docData.gallery) &&
              docData.gallery.length > 0
            ) {
              console.log(`[Search API] Trying gallery for document ${docId}`);
              const firstImage = docData.gallery[0];
              console.log(`[Search API] First gallery image:`, firstImage);
              if (firstImage && typeof firstImage === "object") {
                const url = firstImage.url || firstImage.filename || null;
                console.log(`[Search API] Extracted URL from gallery:`, url);
                if (url && typeof url === "string") {
                  console.log(
                    `[Search API] Found image URL from fetched gallery: ${url}`,
                  );
                  image = {
                    url,
                    alt: firstImage.alt || doc.title || null,
                  };
                } else {
                  console.log(
                    `[Search API] Gallery URL is not a valid string:`,
                    typeof url,
                    url,
                  );
                }
              } else {
                console.log(
                  `[Search API] First gallery item is not an object:`,
                  typeof firstImage,
                );
              }
            } else {
              console.log(
                `[Search API] Document ${docId} has no gallery or gallery is empty`,
              );
            }
          } else {
            console.log(
              `[Search API] Failed to fetch document ${docId}: ${docRes.status}`,
            );
          }
        } catch (error) {
          console.error(
            `[Search API] Error fetching document for image:`,
            error,
          );
        }
      }

      console.log(`[Search API] Final image for doc ${doc.id}:`, image);

      // Handle type - it might be a string, JSON string, or array
      // Payload stores arrays in text fields as JSON strings
      let typeArray: string[] | null = null;
      if (doc.type !== null && doc.type !== undefined) {
        if (Array.isArray(doc.type)) {
          // Already an array
          typeArray = doc.type.filter(
            (t: unknown) => t && typeof t === "string",
          );
        } else if (typeof doc.type === "string") {
          // Try to parse as JSON array first (Payload stores arrays as JSON strings in text fields)
          try {
            const parsed = JSON.parse(doc.type);
            if (Array.isArray(parsed)) {
              typeArray = parsed.filter((t) => t && typeof t === "string");
            } else {
              // Not a JSON array, treat as comma-separated string or single value
              typeArray = doc.type.includes(",")
                ? doc.type
                    .split(",")
                    .map((t: string) => t.trim())
                    .filter(Boolean)
                : doc.type.trim()
                  ? [doc.type.trim()]
                  : null;
            }
          } catch {
            // Not valid JSON, treat as comma-separated string or single value
            typeArray = doc.type.includes(",")
              ? doc.type
                  .split(",")
                  .map((t: string) => t.trim())
                  .filter(Boolean)
              : doc.type.trim()
                ? [doc.type.trim()]
                : null;
          }
        }
      }

      const transformed = {
        id: doc.id,
        title: doc.title || "",
        description: doc.description || null,
        address: doc.address || null,
        cityName: doc.cityName || null,
        type: typeArray,
        priority: doc.priority || null,
        collection: collection as SearchCollection,
        slug,
        image,
      };

      console.log(`[Search API] Transformed result for doc ${doc.id}:`, {
        title: transformed.title,
        image: transformed.image,
        type: transformed.type,
      });

      return transformed;
    });

    // Wait for all async operations to complete
    const docs = await Promise.all(docsPromises);

    // Filter out null results (non-approved listings)
    let filteredDocs = docs.filter((doc) => doc !== null);

    // Additional client-side filtering: ensure we only return results from requested collections
    // This is a safety measure in case Payload's search plugin doesn't filter correctly
    filteredDocs = filteredDocs.filter((doc) => {
      if (!doc) return false;
      return collections.includes(doc.collection);
    });

    console.log(
      `[Search API] After filtering: ${filteredDocs.length} approved results (requested collections: ${collections.join(", ")})`,
    );
    console.log(
      `[Search API] Result collections breakdown:`,
      filteredDocs.reduce((acc: Record<string, number>, doc: any) => {
        acc[doc.collection] = (acc[doc.collection] || 0) + 1;
        return acc;
      }, {}),
    );

    const transformedData = {
      docs: filteredDocs,
      totalDocs: data.totalDocs || 0,
      limit: data.limit || limit,
      page: data.page || page,
      totalPages: data.totalPages || 0,
      hasNextPage: data.hasNextPage || false,
      hasPrevPage: data.hasPrevPage || false,
      nextPage: data.nextPage || null,
      prevPage: data.prevPage || null,
    };

    return Response.json(transformedData, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching search results:", error);

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag("endpoint", "search");
        scope.setContext("request", {
          q,
          collections: collections.join(","),
          limit,
          page,
          url: url.toString(),
        });
        Sentry.captureException(error);
      });
    }

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
