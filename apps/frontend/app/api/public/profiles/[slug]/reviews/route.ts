import { tag } from "@unevent/shared";
import { fetchWithRetry } from "@/lib/server/fetcher";
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
  const searchParams = req.nextUrl.searchParams;
  const profileIdParam = searchParams.get("profileId");

  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!payloadUrl) {
    return new Response("PAYLOAD_INTERNAL_URL not configured", { status: 500 });
  }

  if (!process.env.SVC_TOKEN) {
    return new Response("SVC_TOKEN not configured", { status: 500 });
  }

  try {
    let profileId: number;
    let resolvedSlug = slug;

    // If profileId is provided, use it directly; otherwise resolve by slug
    if (profileIdParam) {
      profileId = Number(profileIdParam);
      if (isNaN(profileId)) {
        return new Response("Invalid profileId", { status: 400 });
      }
    } else {
      // Resolve profile ID by slug
      const profileUrl = `${payloadUrl}/api/profiles?where[slug][equals]=${encodeURIComponent(
        slug,
      )}&limit=1`;

      const profileRes = await fetchWithRetry(
        profileUrl,
        {
          headers: {
            "x-tenant": "unevent",
            Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
          },
          cache: "force-cache",
          next: { tags: [tag.profileSlug(slug)] },
        },
        { timeoutMs: 2000, retries: 1 },
      );

      if (!profileRes.ok) {
        return new Response("Profile not found", { status: profileRes.status });
      }

      const profileData = await profileRes.json();
      const profile = profileData?.docs?.[0];

      if (!profile?.id) {
        return new Response("Profile not found", { status: 404 });
      }

      profileId = profile.id;
      resolvedSlug = profile.slug || slug;
    }

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const reviewsUrl = `${payloadUrl}/api/reviews?where[user][equals]=${profileId}&where[status][equals]=approved&depth=2&page=${page}&limit=${limit}`;

    const reviewsRes = await fetchWithRetry(
      reviewsUrl,
      {
        headers: {
          "x-tenant": "unevent",
          Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
        },
        cache: "force-cache",
        next: { tags: [tag.profileSlug(slug)] },
      },
      { timeoutMs: 2000, retries: 1 },
    );

    if (!reviewsRes.ok) {
      const text = await reviewsRes.text().catch(() => "");
      console.error(
        `Error fetching reviews for profile ${slug}:`,
        reviewsRes.status,
        text,
      );
      return new Response("Failed to fetch reviews", {
        status: reviewsRes.status,
      });
    }

    const body = await reviewsRes.text();

    return new Response(body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "Surrogate-Key": `${tag.profileSlug(resolvedSlug)} ${tag.tenant("unevent")}`,
      },
    });
  } catch (error) {
    console.error(`Error fetching reviews for profile ${slug}:`, error);

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag("endpoint", "profile-reviews");
        scope.setContext("request", {
          slug,
          profileId: profileIdParam,
          url: req.url,
        });
        Sentry.captureException(error);
      });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
