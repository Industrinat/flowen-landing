/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',  // <-- Kommentera bort denna rad
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
