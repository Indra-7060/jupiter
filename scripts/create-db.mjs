
import { config } from 'dotenv';
import mysql from 'mysql2/promise';

config({ path: '.env.local', quiet: true });

if (process.env.DATABASE_URL) { console.log('DATABASE_URL is set; the hosted database already exists, nothing to create.'); process.exit(0); }
const name = process.env.DB_NAME || 'jupiter_cms';
const conn = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
});
await conn.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
console.log(`Database "${name}" is ready.`);
await conn.end();
