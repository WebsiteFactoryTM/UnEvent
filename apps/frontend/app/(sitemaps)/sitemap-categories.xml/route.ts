/**
 * Categories Sitemap
 * Includes city + category combination pages (HUB pages)
 */

export const revalidate = 21600; // 6 hours

async function fetchCitiesAndTypes() {
  try {
    const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!payloadUrl) {
      console.error("API_URL not configured");
      return { cities: [], types: [] };
    }

    // Fetch featured cities
    const citiesResponse = await fetch(
      `${payloadUrl}/api/cities?limit=100&where[featured][equals]=true&sort=-usageCount`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 21600 },
      },
    );

    // Fetch listing types
    const typesResponse = await fetch(
      `${payloadUrl}/api/listing-types?limit=200&where[isActive][equals]=true&sort=sortOrder`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 21600 },
      },
    );

    const cities = citiesResponse.ok
      ? (await citiesResponse.json()).docs || []
      : [];
    const types = typesResponse.ok
      ? (await typesResponse.json()).docs || []
      : [];

    return { cities, types };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { cities: [], types: [] };
  }
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://unevent.ro";

  const { cities, types } = await fetchCitiesAndTypes();

  // Fallback to top cities if API fails
  const topCities =
    cities.length > 0
      ? cities
      : [
          { slug: "bucuresti" },
          { slug: "cluj-napoca" },
          { slug: "timisoara" },
          { slug: "iasi" },
          { slug: "brasov" },
        ];

  // Group types by collection type
  const locationTypes = types.filter((t: any) => t.type === "locations");
  const serviceTypes = types.filter((t: any) => t.type === "services");
  const eventTypes = types.filter((t: any) => t.type === "events");

  // Helper to extract unique categories
  const getUniqueCategories = (types: any[]) => {
    const categories = new Set<string>();
    types.forEach((t) => {
      if (t.categorySlug) {
        categories.add(t.categorySlug);
      }
    });
    return Array.from(categories);
  };

  const locationCategories = getUniqueCategories(locationTypes);
  const serviceCategories = getUniqueCategories(serviceTypes);
  const eventCategories = getUniqueCategories(eventTypes);

  const urls = [];

  // Location category pages
  for (const city of topCities) {
    for (const category of locationCategories) {
      urls.push({
        url: `${baseUrl}/locatii/oras/${city.slug}/${category}`,
        lastmod: new Date().toISOString(),
        changefreq: "daily",
        priority: 0.9,
      });
    }
  }

  // Service category pages
  for (const city of topCities) {
    for (const category of serviceCategories) {
      urls.push({
        url: `${baseUrl}/servicii/oras/${city.slug}/${category}`,
        lastmod: new Date().toISOString(),
        changefreq: "daily",
        priority: 0.9,
      });
    }
  }

  // Event category pages
  for (const city of topCities) {
    for (const category of eventCategories) {
      urls.push({
        url: `${baseUrl}/evenimente/oras/${city.slug}/${category}`,
        lastmod: new Date().toISOString(),
        changefreq: "daily",
        priority: 0.9,
      });
    }
  }

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
      "Cache-Control": "public, max-age=21600, s-maxage=21600",
    },
  });
}
