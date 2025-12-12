import { PayloadHandler, PayloadRequest } from 'payload'
import { z } from 'zod'

const CreateClaimSchema = z.object({
  listingId: z.coerce.number().int().positive(),
  listingType: z.enum(['locations', 'events', 'services']),
  claimantEmail: z.string().email(),
  claimantName: z.string().optional(),
  claimantPhone: z.string().optional(),
})

export const createClaim: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const body = (await req.json?.()) ?? req.body
    const parsed = CreateClaimSchema.parse(body)

    // Check if listing exists and is claimable
    const listing = await req.payload.findByID({
      collection: parsed.listingType,
      id: parsed.listingId,
    })

    if (!listing || (listing as any).claimStatus !== 'unclaimed') {
      return new Response(JSON.stringify({ error: 'This listing cannot be claimed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check for existing pending claims
    const existingClaims = await req.payload.find({
      collection: 'claims',
      where: {
        and: [
          {
            listingType: {
              equals: parsed.listingType,
            },
          },
          {
            claimantEmail: {
              equals: parsed.claimantEmail,
            },
          },
          {
            status: {
              equals: 'pending',
            },
          },
        ],
      },
      limit: 100,
      depth: 0,
    })

    // Filter by listing ID in memory
    const matchingClaims = existingClaims.docs?.filter((claim) => {
      const claimListingId =
        typeof claim.listing === 'object' && claim.listing !== null
          ? (claim.listing as { relationTo: string; value: number }).value
          : typeof claim.listing === 'number'
            ? claim.listing
            : null
      return claimListingId === parsed.listingId
    })

    if (matchingClaims && matchingClaims.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'A pending claim already exists for this listing and email',
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Get user profile if authenticated
    let profileId: number | undefined
    if (req.user) {
      const userProfileId =
        typeof req.user.profile === 'number' ? req.user.profile : req.user.profile?.id
      if (userProfileId) {
        profileId = userProfileId
      }
    }

    // Create claim with proper polymorphic relationship format
    const claimData: any = {
      listing: {
        relationTo: parsed.listingType,
        value: parsed.listingId,
      },
      listingType: parsed.listingType,
      claimantEmail: parsed.claimantEmail,
      status: 'pending',
    }

    if (parsed.claimantName) claimData.claimantName = parsed.claimantName
    if (parsed.claimantPhone) claimData.claimantPhone = parsed.claimantPhone
    if (profileId) claimData.claimantProfile = profileId

    const claim = await req.payload.create({
      collection: 'claims',
      data: claimData,
    })

    // Payload.create returns the document directly, but ensure we access it correctly
    const claimDoc = (claim as any).doc || claim

    // Ensure we have the ID - sometimes it might be in a different format
    const claimId = claimDoc?.id || (claim as any)?.id

    const response = {
      success: true,
      claimId: claimId,
      claimToken: claimDoc?.claimToken || (claim as any)?.claimToken,
      profileId: profileId ?? null, // Explicitly include null if undefined
    }

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to create claim'
    req.payload.logger.error('[createClaim] Error:', err)
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
