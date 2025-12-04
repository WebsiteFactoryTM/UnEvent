/**
 * Static Pages Sitemap
 * Includes homepage and other static pages
 */

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://unevent.ro';
  
  const staticPages = [
    { url: '', priority: 1.0, changefreq: 'daily' },
    { url: '/locatii', priority: 0.9, changefreq: 'daily' },
    { url: '/servicii', priority: 0.9, changefreq: 'daily' },
    { url: '/evenimente', priority: 0.9, changefreq: 'daily' },
    { url: '/despre', priority: 0.5, changefreq: 'monthly' },
    { url: '/contact', priority: 0.5, changefreq: 'monthly' },
    { url: '/politica-de-confidentialitate', priority: 0.3, changefreq: 'yearly' },
    { url: '/termeni-si-conditii', priority: 0.3, changefreq: 'yearly' },
    { url: '/politica-cookie', priority: 0.3, changefreq: 'yearly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
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

