import Sequelize from 'sequelize';
import { initModels, MODELS_VERSION } from './models/index.js';

const g = globalThis;

export function getSequelize() {
  if (!g.__jiwSequelize) {
    const sequelize = new Sequelize(
      process.env.DB_NAME || 'jupiter_cms',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        dialect: 'mysql',
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
        define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
        pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
        dialectOptions: { charset: 'utf8mb4', decimalNumbers: true },
      }
    );
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

/** Convert Sequelize instances (or arrays of them) to plain JSON-safe objects. */
export function plain(x) {
  if (x === null || x === undefined) return x;
  if (Array.isArray(x)) return x.map(plain);
  if (typeof x.get === 'function') return JSON.parse(JSON.stringify(x.get({ plain: true })));
  return JSON.parse(JSON.stringify(x));
}

export const Op = Sequelize.Op;
