/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  pageExtensions: ['page.tsx', 'page.ts'],
  env: {
    API_ORIGIN: process.env.API_ORIGIN,
    CDN_ORIGIN: process.env.CDN_ORIGIN,
    API_PREFIX: process.env.API_PREFIX
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.node/,
      use: 'raw-loader'
    })

    return config
  }
}
