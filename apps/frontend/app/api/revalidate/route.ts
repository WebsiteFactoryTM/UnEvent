import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.SVC_TOKEN}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { tags } = await req.json();
  if (!Array.isArray(tags)) {
    return new Response("Bad Request", { status: 400 });
  }

  for (const t of tags) {
    revalidateTag(t);
  }

  return NextResponse.json({ ok: true, count: tags.length });
}
