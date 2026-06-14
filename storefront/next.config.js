/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['res.cloudinary.com', 'via.placeholder.com'],
  },
}

module.exports = nextConfig
