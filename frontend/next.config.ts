/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing config here
  reactStrictMode: true,
  
  // Add this images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig