/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.infrastructureLogging = {
      level: 'error'
    }
    return config
  }
}

module.exports = nextConfig 