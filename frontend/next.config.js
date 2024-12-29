/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    ...require(`./config/${process.env.APP_ENV || 'local'}.json`),
  },
};

module.exports = nextConfig;
