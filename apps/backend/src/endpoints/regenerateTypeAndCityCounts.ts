import { syncCityCounters } from '@/schedulers/syncCityCounters'
import { syncListingTypeCounters } from '@/schedulers/syncListingTypeCounters'
import { PayloadHandler, PayloadRequest } from 'payload'

export const regenerateHubHandler: PayloadHandler = async (req: PayloadRequest) => {
  if (req.method !== 'GET')
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  if (!req.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  if (!req.user.roles.includes('admin'))
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  try {
    await syncListingTypeCounters(req.payload)
    await syncCityCounters(req.payload)
    return new Response(JSON.stringify({ message: 'Type and city counts regenerated' }), {
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'Error regenerating type and city counts' }), {
      status: 500,
    })
  }
}
