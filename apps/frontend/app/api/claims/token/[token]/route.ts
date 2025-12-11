import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type Params = {
  params: Promise<{ token: string }>;
};

/**
 * GET /api/claims/token/[token] - Lookup claim by token
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!payloadUrl) {
    return NextResponse.json(
      { error: "PAYLOAD_INTERNAL_URL not configured" },
      { status: 500 },
    );
  }

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  try {
    // Fetch claim by token
    const claimRes = await fetch(
      `${payloadUrl}/api/claims?where[claimToken][equals]=${token}&depth=2&limit=1`,
      {
        headers: {
          "x-tenant": "unevent",
        },
      },
    );

    if (!claimRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch claim" },
        { status: claimRes.status },
      );
    }

    const claimData = await claimRes.json();

    if (!claimData.docs || claimData.docs.length === 0) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const claim = claimData.docs[0];

    return NextResponse.json({
      success: true,
      claim,
    });
  } catch (error) {
    console.error("Error fetching claim by token:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch claim",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/claims/token/[token] - Associate claim with profile
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { token } = await params;
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

  const jwtToken = authHeader.replace(/^(Bearer|JWT)\s+/i, "");
  const payloadAuthHeader = `Bearer ${jwtToken}`;

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

    // Fetch claim by token
    const claimRes = await fetch(
      `${payloadUrl}/api/claims?where[claimToken][equals]=${token}&limit=1`,
      {
        headers: {
          "x-tenant": "unevent",
        },
      },
    );

    if (!claimRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch claim" },
        { status: claimRes.status },
      );
    }

    const claimData = await claimRes.json();

    if (!claimData.docs || claimData.docs.length === 0) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const claim = claimData.docs[0];

    // Validate claim is still pending
    if (claim.status !== "pending") {
      return NextResponse.json(
        { error: "Claim is no longer pending" },
        { status: 400 },
      );
    }

    // Update claim with profile
    const updateRes = await fetch(`${payloadUrl}/api/claims/${claim.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: payloadAuthHeader,
        "x-tenant": "unevent",
      },
      body: JSON.stringify({
        claimantProfile: profileId,
      }),
    });

    const updateResult = await updateRes.json();

    if (!updateRes.ok) {
      const errorMessage =
        updateResult.message ||
        updateResult.errors?.[0]?.message ||
        "Failed to update claim";
      return NextResponse.json(
        { error: errorMessage },
        { status: updateRes.status },
      );
    }

    return NextResponse.json({
      success: true,
      claim: updateResult,
    });
  } catch (error) {
    console.error("Error associating claim with profile:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to associate claim",
      },
      { status: 500 },
    );
  }
}
