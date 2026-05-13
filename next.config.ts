import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Next.js 16+ requires an explicit allowlist of qualities so attackers can't
    // multiply transformations by varying ?q= in the URL. 60=thumb, 75=grid,
    // 85=cover, 90=hero.
    qualities: [60, 75, 85, 90],
    // Photos rarely change once uploaded — cache for 31 days to slash repeat
    // transformations and cache writes on Vercel.
    minimumCacheTTL: 2678400,
    // Single format keeps transformations down. AVIF is ~30% smaller than WebP
    // but doubles the transformation cost (one transform per format). WebP only.
    formats: ['image/webp'],
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://www.googletagmanager.com",
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://analytics.google.com",
      "frame-ancestors 'none'",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
