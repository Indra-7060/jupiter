/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sequelize', 'mysql2'],
  images: { unoptimized: true },
};

export default nextConfig;
