import Sequelize from 'sequelize';
// Import the drivers explicitly: Sequelize loads them by name at runtime, which Vercel's file tracer
// cannot see, so without these imports the deployed function has no database driver.
import mysql2 from 'mysql2';
import pg from 'pg';
import { initModels, MODELS_VERSION } from './models/index.js';

const g = globalThis;

/**
 * Database connection (singleton, survives hot reloads).
 * Local:   DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD (MySQL / MariaDB)
 * Hosted:  DATABASE_URL (mysql://… or postgres://…) + DB_SSL=true
 */
export function getSequelize() {
  if (!g.__jiwSequelize) {
    const url = process.env.DATABASE_URL;
    const dialect = process.env.DB_DIALECT || (url && url.startsWith('postgres') ? 'postgres' : 'mysql');
    const ssl = process.env.DB_SSL === 'true';
    const common = {
      dialect,
      dialectModule: dialect === 'postgres' ? pg : mysql2,
      logging: process.env.DB_LOGGING === 'true' ? console.log : false,
      // serverless platforms run many small instances: keep the pool tiny there
      pool: { max: Number(process.env.DB_POOL_MAX || (process.env.VERCEL ? 2 : 10)), min: 0, idle: 10000, acquire: 30000 },
      dialectOptions:
        dialect === 'postgres'
          ? { ssl: ssl ? { require: true, rejectUnauthorized: false } : undefined }
          : { charset: 'utf8mb4', decimalNumbers: true, ssl: ssl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined },
      define: dialect === 'postgres' ? {} : { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
    };
    const sequelize = url
      ? new Sequelize(url, common)
      : new Sequelize(process.env.DB_NAME || 'jupiter_cms', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {
          host: process.env.DB_HOST || '127.0.0.1',
          port: Number(process.env.DB_PORT || 3306),
          ...common,
        });
    g.__jiwModels = initModels(sequelize);
    g.__jiwModelsVersion = MODELS_VERSION;
    g.__jiwSequelize = sequelize;
  } else if (g.__jiwModelsVersion !== MODELS_VERSION) {
    g.__jiwModels = initModels(g.__jiwSequelize);
    g.__jiwModelsVersion = MODELS_VERSION;
  }
  return g.__jiwSequelize;
}

/** Returns the model map, initialising the connection on first use. */
export function db() {
  getSequelize();
  return g.__jiwModels;
}

/** Case-insensitive LIKE operator for the active dialect. */
export function likeOp() {
  return getSequelize().getDialect() === 'postgres' ? Sequelize.Op.iLike : Sequelize.Op.like;
}

/** Convert Sequelize instances (or arrays of them) to plain JSON-safe objects. */
export function plain(x) {
  if (x === null || x === undefined) return x;
  if (Array.isArray(x)) return x.map(plain);
  if (typeof x.get === 'function') return JSON.parse(JSON.stringify(x.get({ plain: true })));
  return JSON.parse(JSON.stringify(x));
}

export const Op = Sequelize.Op;
