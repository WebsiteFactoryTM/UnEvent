import type { Payload } from 'payload'
import cron from 'node-cron'

async function cleanupTempMedia(payload: Payload) {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  try {
    const res = await payload.find({
      collection: 'media',
      where: {
        and: [{ temp: { equals: true } }, { createdAt: { less_than: cutoff } }],
      },
      limit: 200,
      depth: 0,
    })
    if (res.totalDocs === 0) return

    await Promise.all(
      res.docs.map(async (doc: any) => {
        try {
          await payload.delete({ collection: 'media', id: doc.id })
        } catch (e) {
          console.error('[CleanupTempMedia] Failed to delete media', doc.id, e)
        }
      }),
    )
    // If there are more, schedule next run will catch them
  } catch (e) {
    console.error('[CleanupTempMedia] Query error', e)
  }
}

export const registerCleanupTempMediaScheduler = (payload: Payload) => {
  // Run every hour at minute 13
  cron.schedule('13 * * * *', () => cleanupTempMedia(payload))
}
