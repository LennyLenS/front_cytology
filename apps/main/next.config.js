const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@medml/config',
    '@medml/ui',
    '@medml/store',
    '@medml/shared',
    '@medml/auth',
    '@medml/layout',
    '@medml/patients',
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@cytology': path.resolve(__dirname, 'src/app/cytology/[id]'),
    };
    return config;
  },
};

module.exports = nextConfig;
