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
      // Adobe Lightroom Web — galerias compartilhadas
      { protocol: 'https', hostname: 'lightroom.adobe.com' },
      { protocol: 'https', hostname: '**.adobe.com' },
      { protocol: 'https', hostname: '**.adobe.io' },
      { protocol: 'https', hostname: '**.adobecc.com' },
      // CDN comum para assets do Adobe (Cloudfront)
      { protocol: 'https', hostname: '**.cloudfront.net' },
    ],
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://www.googletagmanager.com https://lightroom.adobe.com https://*.adobe.com https://*.adobe.io https://*.adobecc.com https://*.cloudfront.net",
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
