import type { CollectionConfig, CollectionSlug } from 'payload'

export const Verifications: CollectionConfig = {
  slug: 'verifications',
  admin: { useAsTitle: 'status' },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
  },
  timestamps: true,
  fields: [
    {
      name: 'entity',
      type: 'relationship',
      relationTo: ['profiles', 'events', 'locations', 'services'],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: ['pending', 'approved', 'rejected'],
      index: true,
    },
    {
      name: 'documents',
      type: 'array',
      fields: [
        { name: 'type', type: 'select', options: ['id', 'company', 'other'] },
        { name: 'file', type: 'upload', relationTo: 'media', required: true },
        { name: 'notes', type: 'text' },
      ],
    },
    {
      name: 'verificationData',
      type: 'group',
      fields: [
        { name: 'fullName', type: 'text' },
        { name: 'address', type: 'text' },
        { name: 'isCompany', type: 'checkbox' },
        { name: 'companyName', type: 'text' },
        { name: 'cui', type: 'text' },
        { name: 'companyAddress', type: 'text' },
      ],
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'reviewedAt',
      type: 'date',
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        // Mark uploaded verification documents as permanent
        const ids: Array<string | number> =
          (doc.documents || [])
            .map((d: unknown) => {
              const file: unknown = (d as { file?: unknown })?.file
              if (file && typeof file === 'object' && 'id' in (file as Record<string, unknown>)) {
                return (file as { id: string | number }).id
              }
              return file as string | number
            })
            .filter(Boolean) ?? []
        await Promise.all(
          ids.map((id) =>
            req.payload.update({
              collection: 'media',
              id,
              data: { temp: false, context: 'verification' },
            }),
          ),
        )

        // Sync entity verification fields
        const entityRel = doc.entity as { relationTo: string; value: string | number }
        if (entityRel?.relationTo && entityRel?.value) {
          try {
            await req.payload.update({
              collection: entityRel.relationTo as CollectionSlug,
              id: entityRel.value,
              data: { verifiedStatus: doc.status, verification: doc.id } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            })
          } catch (e) {
            console.error('[Verifications] Failed to sync entity verification fields', e)
          }
        }
      },
    ],
  },
}
