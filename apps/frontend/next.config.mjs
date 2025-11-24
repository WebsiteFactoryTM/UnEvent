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
      ...(process.env.NEXT_PUBLIC_API_URL
        ? [
            {
              protocol: "https",
              hostname: new URL(process.env.NEXT_PUBLIC_API_URL).hostname,
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

export default nextConfig;
