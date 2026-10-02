/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sequelize', 'mysql2', 'pg', 'pg-hstore'],
  images: { unoptimized: true },
};

export default nextConfig;
