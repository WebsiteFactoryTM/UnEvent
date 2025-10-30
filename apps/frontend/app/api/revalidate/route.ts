import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const collection = req.nextUrl.searchParams.get("collection");
  const slug = req.nextUrl.searchParams.get("slug");
  const secret = req.nextUrl.searchParams.get("secret");

  console.log(collection, slug, secret);
  if (
    !secret ||
    secret !== process.env.NEXT_PRIVATE_REVALIDATION_KEY ||
    typeof collection !== "string" ||
    typeof slug !== "string"
  ) {
    // Do not indicate that the revalidation key is incorrect in the response
    // This will protect this API route from being exploited
    return new Response("Invalid request", { status: 400 });
  }

  if (typeof collection === "string" && typeof slug === "string") {
    revalidateTag(`${collection}_${slug}`);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  }

  return NextResponse.json({ revalidated: false, now: Date.now() });
}
