/**
 * Cities Sitemap
 * Includes all city hub pages for each listing type
 */

export const dynamic = 'force-dynamic';
export const revalidate = 21600; // 6 hours

async function fetchCities() {
  try {
    const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!payloadUrl) {
      console.error('API_URL not configured');
      return [];
    }

    const response = await fetch(
      `${payloadUrl}/api/cities?limit=1000&where[featured][equals]=true&sort=usageCount`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 21600 }, // 6 hours
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch cities:', response.status);
      return [];
    }

    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://unevent.ro';
  const listingTypes = ['locatii', 'servicii', 'evenimente'];
  
  const cities = await fetchCities();
  
  // If no cities, use fallback top cities
  const topCities = cities.length > 0 
    ? cities 
    : [
        { slug: 'bucuresti' },
        { slug: 'cluj-napoca' },
        { slug: 'timisoara' },
        { slug: 'iasi' },
        { slug: 'brasov' },
        { slug: 'constanta' },
      ];

  const urls = listingTypes.flatMap(listingType =>
    topCities.map(city => ({
      url: `${baseUrl}/${listingType}/oras/${city.slug}`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.8,
    }))
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=21600, s-maxage=21600',
    },
  });
}

