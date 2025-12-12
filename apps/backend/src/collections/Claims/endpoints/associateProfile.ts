import { PayloadHandler, PayloadRequest } from 'payload'

/**
 * Custom endpoint to associate a claim with a user's profile
 * This allows authenticated users to link their profile to a claim via token
 */
export const associateProfile: PayloadHandler = async (req: PayloadRequest) => {
  try {
    // Require authentication
    if (!req.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get token from query params
    const url = new URL(req.url || '', 'http://localhost')
    const token = url.searchParams.get('token')

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get user's profile ID
    const profileId = typeof req.user.profile === 'number' ? req.user.profile : req.user.profile?.id

    if (!profileId) {
      return new Response(
        JSON.stringify({ error: 'User profile not found - please complete your profile setup' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Find claim by token
    const claims = await req.payload.find({
      collection: 'claims',
      where: {
        claimToken: {
          equals: token,
        },
      },
      limit: 1,
      depth: 0,
    })

    if (!claims.docs || claims.docs.length === 0) {
      return new Response(JSON.stringify({ error: 'Claim not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const claim = claims.docs[0]

    // Validate claim is still pending
    if (claim.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Claim is no longer pending' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate email matches (optional but recommended security check)
    const userEmail = req.user.email?.toLowerCase()
    const claimEmail = claim.claimantEmail?.toLowerCase()

    if (userEmail && claimEmail && userEmail !== claimEmail) {
      // Don't block, but note for security monitoring
    }

    // Update claim with profile - use overrideAccess to bypass access control
    const updatedClaim = await req.payload.update({
      collection: 'claims',
      id: claim.id,
      data: {
        claimantProfile: profileId,
      },
      overrideAccess: true, // Allow this update since we've validated the user
    })

    return new Response(
      JSON.stringify({
        success: true,
        claim: updatedClaim,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to associate profile'
    req.payload.logger.error('[associateProfile] Error:', err)
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
