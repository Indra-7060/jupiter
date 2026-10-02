// Loads a JSON dump into the database the current env points at (creates tables, replaces all rows):
//   DATABASE_URL="mysql://…" DB_SSL=true node scripts/import-db.mjs backup.json
import { config } from 'dotenv';
import { readFile } from 'node:fs/promises';
config({ path: '.env.local', quiet: true });
const file = process.argv[2];
if (!file) { console.error('usage: node scripts/import-db.mjs <backup.json>'); process.exit(1); }
const dump = JSON.parse(await readFile(file, 'utf8'));
const { getSequelize, db } = await import('../src/lib/db.js');
const sequelize = getSequelize();
await sequelize.authenticate();
await sequelize.sync();
const models = db();
// parents before children (foreign keys)
const order = ['AdminUser', 'Setting', 'Page', 'Section', 'ProductCategory', 'Product', 'Machine', 'Post', 'Location', 'Enquiry', 'JobOpening', 'JobApplication', 'Media'];
const dialect = sequelize.getDialect();
if (dialect === 'mysql' || dialect === 'mariadb') await sequelize.query('SET FOREIGN_KEY_CHECKS=0');
for (const name of [...order].reverse()) if (models[name]) await models[name].destroy({ where: {}, truncate: dialect !== 'postgres', cascade: dialect === 'postgres' });
for (const name of order) {
  const rows = dump.tables[name] || [];
  if (!rows.length) continue;
  // JSON columns are stored as text: pass the raw string through the setter untouched
  const jsonKeys = Object.entries(models[name].rawAttributes).filter(([, a]) => a.type?.key === 'TEXT' && typeof a.set === 'function').map(([k]) => k);
  const prepared = rows.map((r) => { const o = { ...r }; for (const k of jsonKeys) if (typeof o[k] === 'string') { try { o[k] = JSON.parse(o[k]); } catch { /* keep */ } } return o; });
  await models[name].bulkCreate(prepared, { validate: false });
  console.log(`${name}: ${rows.length} rows`);
}
if (dialect === 'mysql' || dialect === 'mariadb') await sequelize.query('SET FOREIGN_KEY_CHECKS=1');
if (dialect === 'postgres') for (const name of order) { const t = models[name]?.getTableName(); if (t) await sequelize.query(`SELECT setval(pg_get_serial_sequence('"${t}"','id'), COALESCE((SELECT MAX(id) FROM "${t}"),0)+1, false)`).catch(() => {}); }
console.log('import complete');
await sequelize.close();
