import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!payloadUrl) {
    return new Response("PAYLOAD_INTERNAL_URL not configured", { status: 500 });
  }

  // Get token from Authorization header
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Extract token (client may send "Bearer" or "JWT")
  const token = authHeader.replace(/^(Bearer|JWT)\s+/i, "");
  // Try with Bearer first - PayloadCMS might accept Bearer for server-to-server
  const payloadAuthHeader = `Bearer ${token}`;

  try {
    // Get body from request
    const body = await req.json();

    const res = await fetch(
      `${payloadUrl}/api/favorites/syncAnonymousFavorites`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: payloadAuthHeader,
          "x-tenant": "unevent",
        },
        body: JSON.stringify(body),
      },
    );

    const responseData = await res.json();

    if (!res.ok) {
      const errorMessage =
        responseData.message ||
        responseData.error ||
        "Failed to sync favorites";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: res.status,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error syncing favorites:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Failed to sync favorites",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
