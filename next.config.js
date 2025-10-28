/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'pub-9b9ab0d0c1b54e4592cd963e04de2116.r2.dev',
      },
    ],
  },
};

module.exports = nextConfig;
