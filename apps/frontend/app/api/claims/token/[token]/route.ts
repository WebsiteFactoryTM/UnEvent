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
    // Use custom endpoint that allows unauthenticated token lookup
    const claimRes = await fetch(
      `${payloadUrl}/api/claims/by-token?token=${token}`,
      {
        headers: {
          "x-tenant": "unevent",
        },
      },
    );

    if (!claimRes.ok) {
      const errorData = await claimRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch claim" },
        { status: claimRes.status },
      );
    }

    const result = await claimRes.json();

    return NextResponse.json(result);
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
    console.error("[PATCH /api/claims/token] No Authorization header found");
    return NextResponse.json(
      { error: "Unauthorized - No token provided" },
      { status: 401 },
    );
  }

  const jwtToken = authHeader.replace(/^(Bearer|JWT)\s+/i, "");
  const payloadAuthHeader = `Bearer ${jwtToken}`;

  console.log(
    "[PATCH /api/claims/token] Auth header present, validating user...",
  );

  try {
    // Get user profile
    const userRes = await fetch(`${payloadUrl}/api/users/me`, {
      headers: {
        Authorization: payloadAuthHeader,
        "x-tenant": "unevent",
      },
    });

    if (!userRes.ok) {
      const errorData = await userRes.json().catch(() => ({}));
      console.error(
        "[PATCH /api/claims/token] Failed to validate user:",
        userRes.status,
        errorData,
      );
      return NextResponse.json(
        { error: `Unauthorized - ${errorData.message || "Invalid token"}` },
        { status: 401 },
      );
    }

    const userResponse = await userRes.json();
    // Payload /api/users/me returns user object directly (not wrapped)
    const userData = userResponse.user || userResponse;

    if (!userData || !userData.id) {
      console.error(
        "[PATCH /api/claims/token] Invalid user data received:",
        userResponse,
      );
      return NextResponse.json(
        { error: "Invalid user data received" },
        { status: 500 },
      );
    }

    console.log("[PATCH /api/claims/token] User validated:", {
      userId: userData.id,
      email: userData.email,
      profile: userData.profile,
      profileType: typeof userData.profile,
    });

    // Extract profile ID - handle both number and object formats
    const profileId =
      typeof userData.profile === "number"
        ? userData.profile
        : userData.profile?.id;

    if (!profileId || typeof profileId !== "number") {
      console.error("[PATCH /api/claims/token] User has no valid profile:", {
        userId: userData.id,
        email: userData.email,
        profile: userData.profile,
      });
      return NextResponse.json(
        {
          error: "User profile not found - please complete your profile setup",
        },
        { status: 404 },
      );
    }

    console.log(
      "[PATCH /api/claims/token] Profile ID found:",
      profileId,
      "for user:",
      userData.id,
    );

    // Fetch claim by token using custom endpoint
    const claimRes = await fetch(
      `${payloadUrl}/api/claims/by-token?token=${token}`,
      {
        headers: {
          "x-tenant": "unevent",
        },
      },
    );

    if (!claimRes.ok) {
      const errorData = await claimRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch claim" },
        { status: claimRes.status },
      );
    }

    const result = await claimRes.json();
    const claim = result.claim;

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Validate claim is still pending
    if (claim.status !== "pending") {
      return NextResponse.json(
        { error: "Claim is no longer pending" },
        { status: 400 },
      );
    }

    // Use custom endpoint to associate profile - bypasses access control
    console.log("[PATCH /api/claims/token] Associating profile:", {
      claimId: claim.id,
      claimToken: claim.claimToken,
      currentProfile: claim.claimantProfile,
      newProfileId: profileId,
      userId: userData.id,
    });

    const updateRes = await fetch(
      `${payloadUrl}/api/claims/associate-profile?token=${token}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: payloadAuthHeader,
          "x-tenant": "unevent",
        },
      },
    );

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
