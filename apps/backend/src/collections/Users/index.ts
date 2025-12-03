import { isAdmin, isAdminOrSelf } from '@/collections/_access/roles'
import { createProfileAfterUserCreate } from './hooks/createProfileAfterUserCreate'
// import { sendWelcomeEmail } from './hooks/sendWelcomeEmail' // Disabled - Payload handles verification emails automatically
import type { CollectionConfig } from 'payload'
import { ensureBaseClientRole } from './hooks/ensureBaseClientRole'
import { deleteProfileUserDelete } from './hooks/deleteProfileAfterUserDelete'
import { notifyAdminNewUser } from './hooks/afterChange/notifyAdminNewUser'
import { newUserWelcomeEmail } from './hooks/afterChange/newUserWelcomeEmail'
import { changeRole } from './endpoints/changeRole'
import { render } from '@react-email/render'
import { VerificationEmail } from '@/emails/VerificationEmail'
import { ResetPasswordEmail } from '@/emails/ResetPasswordEmail'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  timestamps: true,
  access: {
    read: ({ req }) => !!req.user, // only logged-in users can read users
    update: ({ req }) => isAdminOrSelf({ req }), // must be logged in to update self (we can refine later)
    delete: ({ req }) => isAdmin({ req }),
    create: () => true, // allow public registration
  },
  auth: {
    verify: {
      generateEmailHTML: async ({
        token,
        user,
      }: {
        token: string
        user: { email: string; [key: string]: unknown }
      }) => {
        // Generate custom HTML email using React Email template
        const html = await render(
          VerificationEmail({
            user: {
              email: user.email,
              displayName: (user.displayName as string | null | undefined) || null,
            },
            token,
          }),
        )
        return html
      },
      generateEmailSubject: () => {
        return 'Bine ai venit la UN:EVENT — confirmă-ți emailul'
      },
    },
    forgotPassword: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      generateEmailHTML: async (args: any) => {
        if (!args?.token || !args?.user) {
          throw new Error('Token and user are required for password reset email')
        }
        // Generate custom HTML email using React Email template
        const html = await render(
          ResetPasswordEmail({
            user: {
              email: args.user.email,
              displayName: args.user.displayName || null,
            },
            token: args.token,
          }),
        )
        return html
      },
      generateEmailSubject: () => {
        return 'Resetează-ți parola pentru contul UN:EVENT'
      },
    },
    maxLoginAttempts: 3,
    tokenExpiration: 24 * 60 * 60, // 1 day
    useAPIKey: true,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
    {
      name: 'displayName',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'profile',
      type: 'relationship',
      relationTo: 'profiles',
      hasMany: false,
      maxDepth: 0,
    },
    {
      name: 'avatarURL',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Organizer', value: 'organizer' },
        { label: 'Host / Venue Owner', value: 'host' },
        { label: 'Service Provider', value: 'provider' },
        { label: 'Client / Attendee', value: 'client' },
        { label: 'Admin', value: 'admin' },
      ],
      required: true,
      defaultValue: ['client'],
      saveToJWT: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending Verification', value: 'pending' },
        { label: 'Suspended', value: 'suspended' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'agreeTermsAndConditions',
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
    {
      name: 'agreePrivacyPolicy',
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
  ],
  hooks: {
    afterChange: [createProfileAfterUserCreate, notifyAdminNewUser, newUserWelcomeEmail],
    // sendWelcomeEmail hook disabled - Payload handles verification emails automatically
    // when verify: true is enabled and email adapter is configured
    // afterChange: [createProfileAfterUserCreate, sendWelcomeEmail],
    beforeValidate: [ensureBaseClientRole],
    beforeDelete: [deleteProfileUserDelete],
  },
  endpoints: [
    {
      path: '/changeRole',
      method: 'post',
      handler: changeRole,
    },
  ],
}
