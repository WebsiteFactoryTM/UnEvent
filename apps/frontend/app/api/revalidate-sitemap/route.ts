/**
 * Sitemap Revalidation API
 * Triggered by PayloadCMS hooks when listings are created/updated
 */

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.NEXT_PRIVATE_REVALIDATION_KEY || process.env.SVC_TOKEN}`;

    if (authHeader !== expectedAuth) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { type } = body; // 'locations', 'services', 'events', or 'all'

    console.log(
      `[Sitemap Revalidation] Revalidating sitemaps for type: ${type || "all"}`,
    );

    // Revalidate main sitemap index
    revalidatePath("/sitemap.xml");

    // Revalidate specific sitemaps based on type
    if (!type || type === "all") {
      // Revalidate all sitemaps
      revalidatePath("/sitemap-static.xml");
      revalidatePath("/sitemap-cities.xml");
      revalidatePath("/sitemap-categories.xml");
      revalidatePath("/sitemap-listings-locatii.xml");
      revalidatePath("/sitemap-listings-servicii.xml");
      revalidatePath("/sitemap-listings-evenimente.xml");

      console.log("[Sitemap Revalidation] All sitemaps revalidated");
    } else {
      // Revalidate specific listing type sitemap
      if (type === "locations") {
        revalidatePath("/sitemap-listings-locatii.xml");
        console.log("[Sitemap Revalidation] Locations sitemap revalidated");
      } else if (type === "services") {
        revalidatePath("/sitemap-listings-servicii.xml");
        console.log("[Sitemap Revalidation] Services sitemap revalidated");
      } else if (type === "events") {
        revalidatePath("/sitemap-listings-evenimente.xml");
        console.log("[Sitemap Revalidation] Events sitemap revalidated");
      }
    }

    // Optional: Ping Google about sitemap update
    if (process.env.PING_GOOGLE_ON_SITEMAP_UPDATE === "true") {
      try {
        const sitemapUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL || "https://unevent.ro"}/sitemap.xml`;
        await fetch(
          `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
        );
        console.log("[Sitemap Revalidation] Google pinged successfully");
      } catch (error) {
        console.error("[Sitemap Revalidation] Failed to ping Google:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sitemap(s) revalidated for type: ${type || "all"}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Sitemap Revalidation] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
