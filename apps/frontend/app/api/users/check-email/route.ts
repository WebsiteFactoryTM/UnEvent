import { NextRequest, NextResponse } from "next/server";

/**
 * Check if an email exists in the system
 * GET /api/users/check-email?email=user@example.com
 */
export async function GET(req: NextRequest) {
  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!payloadUrl) {
    return NextResponse.json(
      { error: "API_URL not configured" },
      { status: 500 },
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email parameter is required" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${payloadUrl}/api/users/check-email?email=${encodeURIComponent(email)}`,
      {
        headers: {
          "x-tenant": "unevent",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to check email" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[check-email] Error:", error);
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 },
    );
  }
}
