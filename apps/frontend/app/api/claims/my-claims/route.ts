import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * GET /api/claims/my-claims - Get claims for authenticated user
 */
export async function GET(req: NextRequest) {
  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!payloadUrl) {
    return NextResponse.json(
      { error: "PAYLOAD_INTERNAL_URL not configured" },
      { status: 500 },
    );
  }

  // Require authentication - try server-side session first, then Authorization header
  const session = await getServerSession(authOptions);
  let payloadAuthHeader: string | undefined;
  let profileId: number | undefined;

  // Try to get profile ID from session first
  if (session?.user?.profile) {
    profileId =
      typeof session.user.profile === "number"
        ? session.user.profile
        : (session.user.profile as any)?.id;

    if (session?.accessToken) {
      payloadAuthHeader = `Bearer ${session.accessToken}`;
    }
  }

  // Fallback to Authorization header if session doesn't have profile
  if (!profileId || !payloadAuthHeader) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace(/^(Bearer|JWT)\s+/i, "");
    payloadAuthHeader = `Bearer ${token}`;
  }

  try {
    // Fetch profile ID from API if not in session
    if (!profileId) {
      const userRes = await fetch(`${payloadUrl}/api/users/me`, {
        headers: {
          Authorization: payloadAuthHeader!,
          "x-tenant": "unevent",
        },
      });

      if (!userRes.ok) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userData = await userRes.json();
      // Handle both wrapped and direct user object
      const user = userData.user || userData;
      profileId =
        typeof user.profile === "number" ? user.profile : user.profile?.id;
    }

    if (!profileId) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const listingType = searchParams.get("listingType");
    const status = searchParams.get("status");

    // Build where clause
    const where: string[] = [`claimantProfile[equals]=${profileId}`];
    if (listingType) {
      where.push(`listingType[equals]=${listingType}`);
    }
    if (status) {
      where.push(`status[equals]=${status}`);
    }

    // Fetch claims
    const claimsRes = await fetch(
      `${payloadUrl}/api/claims?where[${where.join("]&where[")}]&limit=100&depth=2`,
      {
        headers: {
          Authorization: payloadAuthHeader,
          "x-tenant": "unevent",
        },
      },
    );

    if (!claimsRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch claims" },
        { status: claimsRes.status },
      );
    }

    const claimsData = await claimsRes.json();

    return NextResponse.json({
      success: true,
      claims: claimsData.docs || [],
      totalDocs: claimsData.totalDocs || 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch claims",
      },
      { status: 500 },
    );
  }
}
