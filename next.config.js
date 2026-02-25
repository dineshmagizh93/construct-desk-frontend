/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize for faster navigation
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Enable faster page transitions
    optimizeCss: true,
  },
  // Enable static optimization
  swcMinify: true,
  // Optimize images
  images: {
    unoptimized: false,
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Faster builds and navigation
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize chunks for better code splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig

