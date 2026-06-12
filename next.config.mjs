/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 828, 1080, 1280, 1440],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
}

export default nextConfig
