import { PayloadHandler, PayloadRequest } from 'payload'

/**
 * Custom endpoint to lookup claim by token
 * This allows unauthenticated users to look up their claim during signup flow
 */
export const getClaimByToken: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const url = new URL(req.url || '', 'http://localhost')
    const token = url.searchParams.get('token')

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Find claim by token - use admin context to bypass access control
    const claims = await req.payload.find({
      collection: 'claims',
      where: {
        claimToken: {
          equals: token,
        },
      },
      limit: 1,
      depth: 2, // Populate listing relationship
    })

    if (!claims.docs || claims.docs.length === 0) {
      return new Response(JSON.stringify({ error: 'Claim not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const claim = claims.docs[0]

    return new Response(
      JSON.stringify({
        success: true,
        claim,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to fetch claim'
    req.payload.logger.error('[getClaimByToken] Error:', err)
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
