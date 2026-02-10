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
};

module.exports = nextConfig;
