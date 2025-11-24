// Optional: purge CDN (Cloudflare) by tag
export async function purgeCDN(tags: string[]): Promise<void> {
  if (!process.env.CF_API_TOKEN || !process.env.CF_ZONE_ID) {
    return // CDN purge not configured
  }

  try {
    await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags }),
      },
    )
  } catch (err) {
    console.error('CDN purge failed:', err)
  }
}
