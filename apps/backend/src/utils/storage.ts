/**
 * Storage utility functions for bucket selection and configuration
 */

export type MediaContext = 'listing' | 'avatar' | 'event' | 'document' | 'verification'

/**
 * Check if cloud storage (R2) should be used
 * Returns true if R2 credentials are configured
 */
export function shouldUseCloudStorage(): boolean {
  return !!(
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_PUBLIC_BUCKET &&
    process.env.R2_PUBLIC_ENDPOINT
  )
}

/**
 * Determine which bucket to use based on media context
 * @param context - The media context (listing, avatar, event, document, verification)
 * @returns Bucket name or null if using local storage
 */
export function getBucketForContext(context: MediaContext): string | null {
  if (!shouldUseCloudStorage()) {
    return null // Use local storage
  }

  // Public contexts go to public bucket
  if (context === 'listing' || context === 'avatar' || context === 'event') {
    return process.env.R2_PUBLIC_BUCKET || null
  }

  // Private contexts go to private bucket
  if (context === 'verification' || context === 'document') {
    return process.env.R2_PRIVATE_BUCKET || process.env.R2_PUBLIC_BUCKET || null
  }

  // Default to public bucket
  return process.env.R2_PUBLIC_BUCKET || null
}

/**
 * Check if a context requires private storage
 */
export function isPrivateContext(context: MediaContext): boolean {
  return context === 'verification' || context === 'document'
}

/**
 * Check if a context is public
 */
export function isPublicContext(context: MediaContext): boolean {
  return context === 'listing' || context === 'avatar' || context === 'event'
}
