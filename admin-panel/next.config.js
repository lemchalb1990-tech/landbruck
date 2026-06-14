const path = require('path')

/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['minio'],
  },
  images: { domains: ['res.cloudinary.com', 'evolutionapi-minio.0xr8dd.easypanel.host'] },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')
    return config
  },
}
