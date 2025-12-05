import type { PayloadHandler, PayloadRequest } from 'payload'
import { enqueueNotification } from '@/utils/notificationsQueue'
import * as Sentry from '@sentry/nextjs'

// Regular v3 response
interface RecaptchaResponse {
  success: boolean
  score: number
  action: string
  challenge_ts: string
  hostname: string
  'error-codes'?: string[]
}

// Enterprise response
interface RecaptchaEnterpriseResponse {
  tokenProperties: {
    valid: boolean
    invalidReason?: string
    hostname: string
    action: string
    createTime: string
  }
  riskAnalysis: {
    score: number
    reasons: string[]
  }
  event: {
    token: string
    siteKey: string
    userAgent: string
    userIpAddress: string
    expectedAction: string
  }
}

export const contactHandler: PayloadHandler = async (req: PayloadRequest) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const body = (await req.json?.()) ?? req.body
    const { fullName, email, phone, subject, message, recaptchaToken } = body as {
      fullName: string
      email: string
      phone: string
      subject: string
      message: string
      recaptchaToken: string
    }

    // Validate required fields
    if (!fullName || !email || !phone || !subject || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate reCAPTCHA token
    if (!recaptchaToken) {
      return new Response(JSON.stringify({ error: 'reCAPTCHA token is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY
    const isEnterprise = process.env.RECAPTCHA_ENTERPRISE === 'true'
    const projectId = process.env.RECAPTCHA_PROJECT_ID || 'unevent'
    const siteKey = process.env.RECAPTCHA_SITE_KEY

    if (!recaptchaSecretKey) {
      console.error('[ContactEndpoint] RECAPTCHA_SECRET_KEY not configured')
      Sentry.captureMessage('RECAPTCHA_SECRET_KEY not configured', 'error')
      return new Response(JSON.stringify({ error: 'Contact form configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let score: number
    let success: boolean

    if (isEnterprise) {
      // Use Enterprise API
      const verificationUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${recaptchaSecretKey}`

      const verificationResponse = await fetch(verificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: {
            token: recaptchaToken,
            expectedAction: 'contact_form',
            siteKey: siteKey,
          },
        }),
      })

      if (!verificationResponse.ok) {
        const errorText = await verificationResponse.text()
        console.error(
          '[ContactEndpoint] Enterprise API error:',
          verificationResponse.status,
          errorText,
        )
        return new Response(
          JSON.stringify({ error: 'reCAPTCHA verification failed. Please try again.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        )
      }

      const result = (await verificationResponse.json()) as RecaptchaEnterpriseResponse

      success = result.tokenProperties.valid
      score = result.riskAnalysis.score

      if (!success) {
        console.warn(
          '[ContactEndpoint] Enterprise verification failed:',
          result.tokenProperties.invalidReason,
        )
        return new Response(
          JSON.stringify({ error: 'reCAPTCHA verification failed. Please try again.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        )
      }
    } else {
      // Use regular v3 API
      const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify'
      const verificationResponse = await fetch(verificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${recaptchaSecretKey}&response=${recaptchaToken}`,
      })

      const result = (await verificationResponse.json()) as RecaptchaResponse

      success = result.success
      score = result.score

      if (!success) {
        console.warn('[ContactEndpoint] v3 verification failed:', result['error-codes'])
        return new Response(
          JSON.stringify({ error: 'reCAPTCHA verification failed. Please try again.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        )
      }
    }

    // Check reCAPTCHA score (both return a score from 0.0 to 1.0)
    const minScore = 0.5
    if (score < minScore) {
      console.warn(`[ContactEndpoint] reCAPTCHA score too low: ${score} (min: ${minScore})`)
      Sentry.captureMessage(
        `Contact form submission rejected: low reCAPTCHA score ${score}`,
        'warning',
      )
      return new Response(
        JSON.stringify({
          error: 'Submission rejected. Please try again later.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    console.log(`[ContactEndpoint] ✅ reCAPTCHA verified successfully (score: ${score})`)

    // Sanitize input (basic sanitization - remove any HTML/script tags)
    const sanitize = (str: string) => str.replace(/<[^>]*>/g, '').trim()

    const emailPayload = {
      sender_name: sanitize(fullName),
      sender_email: sanitize(email),
      sender_phone: sanitize(phone),
      subject: sanitize(subject),
      message: sanitize(message),
      submitted_at: new Date().toISOString(),
    }

    // Enqueue email notification
    const result = await enqueueNotification('admin.contact', emailPayload)

    if (result.id) {
      console.log(`[ContactEndpoint] ✅ Enqueued admin.contact notification (job: ${result.id})`)
    } else {
      console.warn('[ContactEndpoint] ⚠️ Notification enqueued but no job ID returned')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contact form submitted successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[ContactEndpoint] Error processing contact form:', errMsg)

    // Report to Sentry with context
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', 'contact')
        scope.setContext('request', {
          method: 'POST',
        })
        Sentry.captureException(error)
      })
    }

    return new Response(JSON.stringify({ error: 'Failed to submit contact form' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
