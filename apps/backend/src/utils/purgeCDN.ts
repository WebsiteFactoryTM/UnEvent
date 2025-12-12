// Optional: purge CDN (Cloudflare) by tag
export async function purgeCDN(tags: string[]): Promise<void> {
  if (!process.env.CF_API_TOKEN || !process.env.CF_ZONE_ID) {
    return // CDN purge not configured
  }

  try {
    // Add timeout to prevent hanging (10 seconds)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags }),
        signal: controller.signal,
      },
    )

    clearTimeout(timeoutId)
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn(`CDN purge timeout after 10s for tags: ${tags.join(', ')}`)
    } else {
      console.error('CDN purge failed:', err)
    }
  }
}
