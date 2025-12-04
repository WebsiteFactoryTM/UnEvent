/**
 * Events Listings Sitemap
 * Includes all approved event detail pages
 */

export const revalidate = 3600; // 1 hour

async function fetchApprovedEvents() {
  try {
    const payloadUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!payloadUrl) {
      console.error('API_URL not configured');
      return [];
    }

    const response = await fetch(
      `${payloadUrl}/api/events?limit=5000&where[moderationStatus][equals]=approved&where[_status][equals]=published&depth=1`,
      {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch events:', response.status);
      return [];
    }

    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://unevent.ro';
  
  const events = await fetchApprovedEvents();

  const urls = events.map((event: any) => ({
    url: `${baseUrl}/evenimente/${event.slug}`,
    lastmod: event.updatedAt || new Date().toISOString(),
    changefreq: 'weekly',
    priority: 0.7,
  }));

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
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

