import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Remove unoptimized: true to enable Next.js image optimization
    // This will proxy images through /api/_next/image for caching
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          process.env.R2_PUBLIC_URL?.replace(/^https?:\/\//, "").split(
            "/",
          )[0] ||
          process.env.R2_PUBLIC_ENDPOINT?.replace(/^https?:\/\//, "")
            .replace("/api", "")
            .split("/")[0] ||
          "*.r2.cloudflarestorage.com", // Cloudflare R2 default domain
      },
      // Add your backend domain if images are served from there

      ...(process.env.API_URL
        ? [
            {
              protocol: "https",
              hostname: new URL(process.env.API_URL).hostname,
            },
          ]
        : []),

      ...(process.env.API_URL && process.env.NODE_ENV !== "production"
        ? [
            {
              protocol: "http",
              hostname: new URL(process.env.API_URL).hostname,
            },
          ]
        : []),
    ],
    // Optional: Configure image sizes for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optional: Set minimum cache TTL (in seconds)
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  async redirects() {
    return [
      {
        source: "/cont",
        destination: "/cont/profil",
        permanent: true, // 308
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
