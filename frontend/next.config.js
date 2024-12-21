/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    ...require(`./config/${process.env.APP_ENV || 'development'}.json`),
  },
};

module.exports = nextConfig;
