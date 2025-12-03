import { tag } from "@unevent/shared";
import { fetchWithRetry } from "@/lib/server/fetcher";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

// Use auto to allow both static generation and tag-based revalidation
export const dynamic = "auto";
export const revalidate = 300;
export const fetchCache = "default-cache";
export const preferredRegion = "auto";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const url = req.nextUrl;

  const isDraft = url.searchParams.get("draft") === "1";

  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!payloadUrl) {
    return new Response("PAYLOAD_INTERNAL_URL not configured", { status: 500 });
  }

  // For draft mode, get token from cookies; otherwise use service token
  let authHeader: string;
  if (isDraft) {
    const cookieStore = await cookies();
    const payloadToken = cookieStore.get("payload-token")?.value;
    if (!payloadToken) {
      return new Response("Unauthorized", { status: 401 });
    }
    authHeader = `JWT ${payloadToken}`;
  } else {
    if (!process.env.SVC_TOKEN) {
      return new Response("SVC_TOKEN not configured", { status: 500 });
    }
    authHeader = `users API-Key ${process.env.SVC_TOKEN}`;
  }

  const apiUrl = `${payloadUrl}/api/profiles?where[slug][equals]=${encodeURIComponent(
    slug,
  )}&depth=2&limit=1`;

  try {
    const res = await fetchWithRetry(
      apiUrl,
      {
        headers: {
          "x-tenant": "unevent",
          Authorization: authHeader,
        },
        cache: isDraft ? "no-store" : "force-cache",
        next: isDraft ? undefined : { tags: [tag.profileSlug(slug)] },
      },
      { timeoutMs: 2000, retries: isDraft ? 0 : 1 },
    );

    if (!res.ok) {
      return new Response("Not found", { status: res.status });
    }

    const data = await res.json();
    const doc = data?.docs?.[0];

    if (!doc) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(JSON.stringify(doc), {
      headers: {
        "Content-Type": "application/json",
        ...(isDraft
          ? { "Cache-Control": "no-store" }
          : {
              "Cache-Control":
                "public, s-maxage=300, stale-while-revalidate=600",
              "Surrogate-Key": `${tag.profileSlug(slug)} ${tag.tenant(
                "unevent",
              )}`,
            }),
      },
    });
  } catch (error) {
    console.error(`Error fetching profile ${slug}:`, error);

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag("endpoint", "profile");
        scope.setContext("request", {
          slug,
          isDraft,
          url: req.url,
        });
        Sentry.captureException(error);
      });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
