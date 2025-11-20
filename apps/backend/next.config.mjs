import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: false, // Use 307 (temporary) instead of 308 (permanent)
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
