/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/data/:path*',
        destination: '/api/data/:path*',
      },
    ];
  },
}

module.exports = nextConfig

