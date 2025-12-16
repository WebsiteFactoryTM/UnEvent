/**
 * Locations Listings Sitemap
 * Includes all approved location detail pages
 */

export const revalidate = 3600; // 1 hour

async function fetchApprovedLocations() {
  try {
    const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!payloadUrl) {
      console.error("API_URL not configured");
      return [];
    }

    const response = await fetch(
      `${payloadUrl}/api/locations?limit=5000&where[moderationStatus][equals]=approved&where[_status][equals]=published&depth=1`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch locations:", response.status);
      return [];
    }

    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://unevent.ro";

  const locations = await fetchApprovedLocations();

  const urls = locations.map((location: any) => ({
    url: `${baseUrl}/locatii/${location.slug}`,
    lastmod: location.updatedAt || new Date().toISOString(),
    changefreq: "weekly",
    priority: 0.7,
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (page: {
      url: string;
      lastmod: string;
      changefreq: string;
      priority: number;
    }) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
