import { revalidatePath, revalidateTag } from "next/cache";
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

    // If it's a listing tag, also revalidate related pages
    if (t.startsWith("listing:slug:")) {
      const slug = t.replace("listing:slug:", "");

      // Check if we have collection tags in this same request
      const hasLocations = tags.includes("collection:locations");
      const hasServices = tags.includes("collection:services");
      const hasEvents = tags.includes("collection:events");

      // Only revalidate paths for collections present in this request
      if (hasLocations) revalidatePath(`/locatii/${slug}`);
      if (hasServices) revalidatePath(`/servicii/${slug}`);
      if (hasEvents) revalidatePath(`/evenimente/${slug}`);
    }

    // Revalidate hub pages (listing type overview pages)
    if (t.startsWith("hub:snapshot:")) {
      const type = t.replace("hub:snapshot:", "");
      if (type === "locations") revalidatePath("/locatii");
      if (type === "services") revalidatePath("/servicii");
      if (type === "events") revalidatePath("/evenimente");
    }

    // Revalidate home page
    if (t === "home:snapshot" || t === "home") {
      revalidatePath("/");
    }
  }

  return NextResponse.json({ ok: true, count: tags.length });
}
