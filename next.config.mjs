/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    // Увеличиваем лимит размера тела запроса для API routes (до 10GB)
    experimental: {
        serverActions: {
            bodySizeLimit: '10gb',
        },
    },
    // Включаем standalone output для Docker
    output: 'standalone',
};

export default nextConfig;

// module.exports = {
//     reactStrictMode: false,
//     eslint: {
//         dirs: ['pages', 'utils'], // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
//     },
// }
