/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sequelize', 'mysql2', 'pg', 'pg-hstore'],
  images: { unoptimized: true },
  // Sequelize requires pg-hstore by name when using Postgres; make sure it is shipped too.
  outputFileTracingIncludes: { '/**/*': ['./node_modules/pg-hstore/**/*'] },
};

export default nextConfig;
