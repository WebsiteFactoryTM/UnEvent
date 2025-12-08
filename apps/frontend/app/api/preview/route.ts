import { draftMode, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const payloadToken = "payload-token";

// Force dynamic since we always check authentication
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const secret = searchParams.get("secret");

  if (!url) {
    return new Response("No URL provided", { status: 404 });
  }

  if (secret !== process.env.NEXT_PRIVATE_DRAFT_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  // Try to get token from either payload-token cookie (admin) or NextAuth session (user)
  const cookieStore = await cookies();
  let token = cookieStore.get(payloadToken)?.value;
  let isAdminToken = Boolean(token);

  // If no admin token, check for NextAuth session
  if (!token) {
    const session = await getServerSession(authOptions);
    if (session?.accessToken) {
      token = session.accessToken;
      isAdminToken = false;
    }
  }

  if (!token) {
    return new Response("You are not allowed to preview this page", {
      status: 403,
    });
  }

  // Validate token against Payload
  const userReq = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const userRes = await userReq.json();

  const dm = await draftMode();

  if (!userReq.ok || !userRes?.user) {
    dm.disable();
    return new Response("You are not allowed to preview this page", {
      status: 403,
    });
  }

  dm.enable();

  return redirect(url);
}
