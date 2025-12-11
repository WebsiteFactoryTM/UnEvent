import { NextRequest, NextResponse } from "next/server";

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

  // Require authentication
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace(/^(Bearer|JWT)\s+/i, "");
  const payloadAuthHeader = `Bearer ${token}`;

  try {
    // Get user profile
    const userRes = await fetch(`${payloadUrl}/api/users/me`, {
      headers: {
        Authorization: payloadAuthHeader,
        "x-tenant": "unevent",
      },
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await userRes.json();
    const profileId =
      typeof userData.profile === "number"
        ? userData.profile
        : userData.profile?.id;

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
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch claims",
      },
      { status: 500 },
    );
  }
}
