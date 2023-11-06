/**
 * @type {import('next').NextConfig}
 **/

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({
  // pageExtensions: ['page.tsx', 'page.ts'],
  experimental: {
    appDir: true
  },
  env: {
    API_ORIGIN: process.env.API_ORIGIN,
    CDN_ORIGIN: process.env.CDN_ORIGIN
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/sequence/create',
        permanent: true
      }
    ]
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.node/,
      use: 'raw-loader'
    })

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })

    return config
  }
})
