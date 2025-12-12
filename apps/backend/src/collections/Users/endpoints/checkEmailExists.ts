import { PayloadHandler, PayloadRequest } from 'payload'

/**
 * Check if an email already exists in the system
 * GET /api/users/check-email?email=user@example.com
 * Returns: { exists: boolean }
 */
export const checkEmailExists: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const url = new URL(req.url || '', 'http://localhost')
    const email = url.searchParams.get('email')

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check if user exists (using find with limit 1 for efficiency)
    const result = await req.payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email.toLowerCase().trim(),
        },
      },
      limit: 1,
      depth: 0,
    })

    const exists = result.docs && result.docs.length > 0

    return new Response(
      JSON.stringify({
        exists,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    req.payload.logger.error(`[checkEmailExists] Error: ${errorMessage}`)

    return new Response(
      JSON.stringify({
        error: 'Failed to check email existence',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
