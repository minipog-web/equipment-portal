/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Netlify specific optimizations can be added here
  // For example, ensuring static pages are correctly handled
  // output: 'standalone', // Better for serverless environments
};

export default nextConfig;
