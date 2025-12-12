import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type Params = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/claims/[id] - Get claim by ID
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!payloadUrl) {
    return NextResponse.json(
      { error: "PAYLOAD_INTERNAL_URL not configured" },
      { status: 500 },
    );
  }

  if (!id) {
    return NextResponse.json(
      { error: "Claim ID is required" },
      { status: 400 },
    );
  }

  try {
    // Fetch claim by ID (public access for email links)
    const claimRes = await fetch(`${payloadUrl}/api/claims/${id}?depth=2`, {
      headers: {
        "x-tenant": "unevent",
      },
    });

    if (!claimRes.ok) {
      return NextResponse.json(
        { error: "Claim not found" },
        { status: claimRes.status },
      );
    }

    const claim = await claimRes.json();

    return NextResponse.json({
      success: true,
      claim,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch claim",
      },
      { status: 500 },
    );
  }
}
