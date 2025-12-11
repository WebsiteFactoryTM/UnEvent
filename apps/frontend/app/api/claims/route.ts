import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * POST /api/claims - Create a new claim
 */
export async function POST(req: NextRequest) {
  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!payloadUrl) {
    return NextResponse.json(
      { error: "PAYLOAD_INTERNAL_URL not configured" },
      { status: 500 },
    );
  }

  try {
    const body = await req.json();
    const {
      listingId,
      listingType,
      claimantEmail,
      claimantName,
      claimantPhone,
    } = body;

    // Validate required fields
    if (!listingId || !listingType || !claimantEmail) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: listingId, listingType, claimantEmail",
        },
        { status: 400 },
      );
    }

    // Validate listingType
    if (!["locations", "events", "services"].includes(listingType)) {
      return NextResponse.json(
        { error: "Invalid listingType" },
        { status: 400 },
      );
    }

    // Check if user is authenticated
    const authHeader = req.headers.get("authorization");
    let payloadAuthHeader: string | undefined;
    let profileId: number | undefined;

    if (authHeader) {
      const token = authHeader.replace(/^(Bearer|JWT)\s+/i, "");
      payloadAuthHeader = `Bearer ${token}`;

      // Try to get user profile from Payload
      try {
        const userRes = await fetch(`${payloadUrl}/api/users/me`, {
          headers: {
            Authorization: payloadAuthHeader,
            "x-tenant": "unevent",
          },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          profileId =
            typeof userData.profile === "number"
              ? userData.profile
              : userData.profile?.id;
        }
      } catch (error) {
        // User might not be logged in, continue without profile
      }
    }

    // Check if listing exists and is claimable
    const listingRes = await fetch(
      `${payloadUrl}/api/${listingType}/${listingId}`,
      {
        headers: {
          "x-tenant": "unevent",
        },
      },
    );

    if (!listingRes.ok) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const listing = await listingRes.json();

    if (listing.claimStatus !== "unclaimed") {
      return NextResponse.json(
        { error: "This listing cannot be claimed" },
        { status: 400 },
      );
    }

    // Note: Duplicate check removed - Payload will handle validation
    // We'll catch duplicate errors from Payload response instead

    // Create claim with polymorphic relationship format
    const claimData: any = {
      listing: {
        relationTo: listingType,
        value: listingId,
      },
      listingType,
      claimantEmail,
      status: "pending",
    };

    if (claimantName) claimData.claimantName = claimantName;
    if (claimantPhone) claimData.claimantPhone = claimantPhone;
    if (profileId) claimData.claimantProfile = profileId;

    const createRes = await fetch(`${payloadUrl}/api/claims`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(payloadAuthHeader ? { Authorization: payloadAuthHeader } : {}),
        "x-tenant": "unevent",
      },
      body: JSON.stringify(claimData),
    });

    const claimResult = await createRes.json();

    if (!createRes.ok) {
      // Check for duplicate claim error
      const errorMessage =
        claimResult.message ||
        claimResult.errors?.[0]?.message ||
        "Failed to create claim";

      // If it's a validation error that might indicate duplicate, return 409
      if (
        errorMessage.toLowerCase().includes("duplicate") ||
        errorMessage.toLowerCase().includes("already exists")
      ) {
        return NextResponse.json(
          {
            error: "A pending claim already exists for this listing and email",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: createRes.status },
      );
    }

    return NextResponse.json({
      success: true,
      claimId: claimResult.id,
      claimToken: claimResult.claimToken,
      profileId,
    });
  } catch (error) {
    console.error("Error creating claim:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create claim",
      },
      { status: 500 },
    );
  }
}
