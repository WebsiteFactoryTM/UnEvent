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
    const res = await fetch(process.env.NEXT_PRIV_REVALIDATE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SVC_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags }),
    })

    if (res.ok) {
      payload.logger.info(`Revalidated ${tags.length} tag(s): ${tags.join(', ')}`)
    } else {
      const text = await res.text().catch(() => 'Unknown error')
      payload.logger.error(`Error revalidating tags: ${res.status} ${text}`)
    }
  } catch (err: unknown) {
    payload.logger.error(`Error hitting revalidate route: ${err}`)
  }
}
