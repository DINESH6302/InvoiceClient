/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    async redirects() {
      return [
        {
          source: '/signin',
          destination: '/login',
          permanent: true,
        },
      ]
    },
    async rewrites() {
      return [
        {
          source: '/v1/:path*',
          destination: 'http://127.0.0.1:9090/v1/:path*',
        },
      ]
    },
};

module.exports = nextConfig;
