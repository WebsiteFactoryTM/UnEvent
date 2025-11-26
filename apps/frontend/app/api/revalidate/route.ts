import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getRedis } from "@/utils/redis";

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

    // If home-related tags are being revalidated, update the timestamp
    if (t === "home" || t === "homeSnapshot" || t.startsWith("hub:snapshot:")) {
      try {
        const redis = getRedis();
        await redis.set("home:lastUpdate", Date.now().toString(), "EX", 3600); // Expire in 1 hour
      } catch (error) {
        console.error("Failed to update home timestamp:", error);
      }
    }
  }

  return NextResponse.json({ ok: true, count: tags.length });
}
