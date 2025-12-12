import type { Payload } from 'payload'

export const revalidate = async (args: { tags: string[]; payload: Payload }): Promise<void> => {
  const { tags, payload } = args

  if (!process.env.NEXT_PRIV_REVALIDATE_URL) {
    payload.logger.error('NEXT_PRIV_REVALIDATE_URL is not set')
    return
  }

  if (!process.env.SVC_TOKEN) {
    payload.logger.error('SVC_TOKEN is not set')
    return
  }

  try {
    // Add timeout to prevent hanging (10 seconds)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(process.env.NEXT_PRIV_REVALIDATE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SVC_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (res.ok) {
      payload.logger.info(`Revalidated ${tags.length} tag(s): ${tags.join(', ')}`)
    } else {
      const text = await res.text().catch(() => 'Unknown error')
      payload.logger.error(`Error revalidating tags: ${res.status} ${text}`)
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      payload.logger.warn(`Revalidation timeout after 10s for tags: ${tags.join(', ')}`)
    } else {
      payload.logger.error(`Error hitting revalidate route: ${err}`)
    }
  }
}
