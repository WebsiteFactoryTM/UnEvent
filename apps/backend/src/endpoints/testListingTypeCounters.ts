import { syncListingTypeCounters } from '@/schedulers/syncListingTypeCounters'
import type { PayloadRequest } from 'payload'
import type { PayloadHandler } from 'payload'

export const testListingTypeCountersHandler: PayloadHandler = async (req: PayloadRequest) => {
  if (req.method !== 'POST')
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })

  // Allow in development or for admin users in production
  if (process.env.NODE_ENV === 'production') {
    if (!req.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    if (!req.user.roles.includes('admin'))
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 })
  }

  try {
    console.log('[testListingTypeCounters] Manual trigger started by user:', req.user?.email || 'dev')
    const startTime = Date.now()

    // Run the sync function
    await syncListingTypeCounters(req.payload)

    const duration = Math.round((Date.now() - startTime) / 1000)
    console.log(`[testListingTypeCounters] Manual trigger completed in ${duration}s`)

    return new Response(
      JSON.stringify({
        message: 'Listing type counters sync completed',
        duration: `${duration}s`,
      }),
      { status: 200 },
    )
  } catch (error) {
    console.error('[testListingTypeCounters] Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Listing type counters sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 },
    )
  }
}
