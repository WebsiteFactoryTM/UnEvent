/**
 * Main Sitemap Index
 * Lists all segmented sitemaps
 */

export const revalidate = 0;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://unevent.ro';
  
  const sitemaps = [
    {
      loc: `${baseUrl}/sitemap-static.xml`,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `${baseUrl}/sitemap-cities.xml`,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `${baseUrl}/sitemap-categories.xml`,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `${baseUrl}/sitemap-listings-locatii.xml`,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `${baseUrl}/sitemap-listings-servicii.xml`,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `${baseUrl}/sitemap-listings-evenimente.xml`,
      lastmod: new Date().toISOString(),
    },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

