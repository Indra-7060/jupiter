import { config } from 'dotenv';
config({ path: ".env.local", quiet: true });
config({ quiet: true });
const { getSequelize } = await import('../src/lib/db.js');

const sequelize = getSequelize();
await sequelize.authenticate();
await sequelize.sync({ alter: process.argv.includes('--alter') });
console.log('Tables synchronised.');
await sequelize.close();
