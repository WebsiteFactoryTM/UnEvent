import { NextRequest } from "next/server";

type Params = {
  params: Promise<{ type: "locations" | "events" | "services"; id: string }>;
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function PATCH(req: NextRequest, { params }: Params) {
  const { type, id } = await params;
  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!payloadUrl) {
    return new Response("PAYLOAD_INTERNAL_URL not configured", { status: 500 });
  }

  // Get token from Authorization header
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Extract token (client may send "Bearer" or "JWT", we normalize to JWT)
  const token = authHeader.replace(/^(Bearer|JWT)\s+/i, "");
  const payloadAuthHeader = `Bearer ${token}`;

  // Extract draft parameter from query string
  const draftParam = req.nextUrl.searchParams.get('draft') === 'true' ? '?draft=true' : '';

  try {
    const body = await req.json();

    const res = await fetch(`${payloadUrl}/api/${type}/${id}${draftParam}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: payloadAuthHeader,
        "x-tenant": "unevent",
      },
      body: JSON.stringify(body),
    });

    const responseData = await res.json();

    if (!res.ok) {
      // Pass through full error response including errors array for field-level errors
      const errorResponse = {
        error:
          responseData.message ||
          responseData.error ||
          "Failed to update listing",
        errors: responseData.errors || [],
        message: responseData.message,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: res.status,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }

    return new Response(JSON.stringify(responseData.doc || responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error updating listing:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Failed to update listing",
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

export async function DELETE(req: NextRequest, { params }: Params) {
  const { type, id } = await params;
  const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!payloadUrl) {
    return new Response("PAYLOAD_INTERNAL_URL not configured", { status: 500 });
  }

  // Get token from Authorization header
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Extract token (client may send "Bearer" or "JWT", we normalize to JWT)
  const token = authHeader.replace(/^(Bearer|JWT)\s+/i, "");
  const payloadAuthHeader = `Bearer ${token}`;

  try {
    // Perform soft delete by setting deletedAt timestamp
    // This preserves the listing for 6 months before cleanup scheduler hard deletes it
    const res = await fetch(`${payloadUrl}/api/${type}/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: payloadAuthHeader,
        "Content-Type": "application/json",
        "x-tenant": "unevent",
      },
      body: JSON.stringify({
        deletedAt: new Date().toISOString(),
      }),
    });

    const responseData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage =
        responseData.message ||
        responseData.errors?.[0]?.message ||
        "Failed to delete listing";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: res.status,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }

    return new Response(JSON.stringify(responseData.doc || responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Failed to delete listing",
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
