import { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: {
    group: 'Settings',
    description: 'Settings for the application',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Scheduler Settings',
          fields: [
            {
              name: 'enableJobs',
              type: 'checkbox',
              label: 'Enable Background Jobs',
              defaultValue: false,
              admin: {
                description:
                  'Enable or disable background schedulers. Falls back to ENABLE_JOBS environment variable if not set. Requires restart to take effect.',
              },
            },
            {
              name: 'schedulerEnvironment',
              type: 'select',
              label: 'Scheduler Environment',
              options: [
                { label: 'Development (6x slower intervals)', value: 'dev' },
                { label: 'Staging (3x slower intervals)', value: 'staging' },
                { label: 'Production (normal intervals)', value: 'production' },
              ],
              admin: {
                description:
                  'Override the scheduler environment multiplier. Falls back to SCHEDULER_ENV or NODE_ENV if not set. Requires restart to take effect.',
              },
            },
          ],
        },
        {
          label: 'Admin Actions',
          fields: [
            {
              name: 'adminActions',
              type: 'ui',
              admin: {
                components: {
                  Field: {
                    path: './components/AdminActions/index.tsx',
                    exportName: 'AdminActionsPanel',
                  },
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
