import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload'
import { isAdmin } from './_access/roles'

/**
 * Generates a unique filename by appending timestamp and random string if duplicate exists
 */
async function ensureUniqueFilename(
  filename: string,
  payload: any, // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<string> {
  // Check if filename already exists
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })

  // If no duplicate, return original filename
  if (existing.totalDocs === 0) {
    return filename
  }

  // Parse filename and extension
  const lastDotIndex = filename.lastIndexOf('.')
  const hasExtension = lastDotIndex > 0 && lastDotIndex < filename.length - 1

  let baseName: string
  let extension: string

  if (hasExtension) {
    baseName = filename.substring(0, lastDotIndex)
    extension = filename.substring(lastDotIndex)
  } else {
    baseName = filename
    extension = ''
  }

  // Generate unique suffix: timestamp + random string
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8) // 6 char random string
  const uniqueFilename = `${baseName}-${timestamp}-${randomStr}${extension}`

  // Recursively check if the generated name also exists (very unlikely but possible)
  const checkUnique = await payload.find({
    collection: 'media',
    where: { filename: { equals: uniqueFilename } },
    limit: 1,
  })

  // If somehow the generated name also exists, append another random string
  if (checkUnique.totalDocs > 0) {
    const extraRandom = Math.random().toString(36).substring(2, 6) // 4 char random string
    return `${baseName}-${timestamp}-${randomStr}-${extraRandom}${extension}`
  }

  return uniqueFilename
}

const beforeChange: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  const profileId =
    typeof req.user?.profile === 'number' ? req.user?.profile : req.user?.profile?.id

  // Handle filename deduplication on create operations with file uploads
  // For upload collections, filename is available in data.filename after PayloadCMS processes the upload
  // We also check req.file for the raw file object
  if (operation === 'create') {
    const file = (req as any).file // eslint-disable-line @typescript-eslint/no-explicit-any
    const filename = file?.filename || (data as any)?.filename // eslint-disable-line @typescript-eslint/no-explicit-any

    if (filename && typeof filename === 'string') {
      const uniqueFilename = await ensureUniqueFilename(filename, req.payload)

      // Update filename in both locations to ensure consistency
      if (file) {
        file.filename = uniqueFilename
      }
      if (data) {
        ;(data as any).filename = uniqueFilename // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    }
  }

  return {
    ...data,
    temp: data?.temp ?? true,
    context: data?.context ?? 'listing',
    uploadedBy: profileId,
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { useAsTitle: 'filename' },
  access: {
    read: ({ req, data }) => {
      const doc = data
      // Public contexts: listing, avatar, event - accessible to everyone
      if (doc?.context === 'listing' || doc?.context === 'avatar' || doc?.context === 'event') {
        return true
      }
      // Private contexts: verification, document - require authentication
      if (doc?.context === 'verification' || doc?.context === 'document') {
        if (!req.user) return false
        // Admins can access all private documents
        if (isAdmin({ req })) return true
        // Users can only access their own documents
        const profileId =
          typeof req.user?.profile === 'number' ? req.user?.profile : req.user?.profile?.id
        return !!profileId && doc?.uploadedBy === profileId
      }
      // Default: allow read (fallback for any other contexts)
      return true
    },
    create: () => true,
    update: ({ req }) => {
      if (isAdmin({ req })) return true
      const profileId =
        typeof req.user?.profile === 'number' ? req.user?.profile : req.user?.profile?.id
      return !!req.user && !!profileId && { uploadedBy: { equals: profileId } }
    },
    delete: ({ req }) => {
      if (isAdmin({ req })) return true
      const profileId =
        typeof req.user?.profile === 'number' ? req.user?.profile : req.user?.profile?.id
      return !!req.user && !!profileId && { uploadedBy: { equals: profileId } }
    },
  },
  upload: {
    staticDir: 'media',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'context',
      type: 'select',
      options: ['listing', 'avatar', 'event', 'document', 'verification'],
      required: true,
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'profiles',
    },
    {
      name: 'temp',
      type: 'checkbox',
      defaultValue: true,
      label: 'Temporary file',
    },
    {
      name: 'prefix',
      type: 'text',
      admin: {
        readOnly: true,
        hidden: true,
      },
      // This field is used by the cloud storage plugin
      // It's automatically populated by the plugin when files are uploaded
    },
  ],
  hooks: {
    beforeChange: [beforeChange],
  },
}
