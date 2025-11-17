import { draftMode, cookies } from "next/headers";
import { redirect } from "next/navigation";

const payloadToken = "payload-token";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(payloadToken)?.value;

  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const secret = searchParams.get("secret");

  if (!url) {
    return new Response("No URL provided", { status: 404 });
  }

  if (!token) {
    return new Response("You are not allowed to preview this page", {
      status: 403,
    });
  }

  // Validate Payload token
  const userReq = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
    {
      headers: {
        Authorization: `JWT ${token}`,
      },
    },
  );

  const userRes = await userReq.json();

  const dm = await draftMode();

  if (!userReq.ok || !userRes?.user) {
    dm.disable();
    console.log("user not found");
    return new Response("You are not allowed to preview this page", {
      status: 403,
    });
  }

  if (secret !== process.env.NEXT_PRIVATE_DRAFT_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  dm.enable();

  console.log("redirect url", url);

  return redirect(url);
}
