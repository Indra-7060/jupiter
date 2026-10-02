// Dumps every table to a JSON file:  node scripts/export-db.mjs backup.json
import { config } from 'dotenv';
import { writeFile } from 'node:fs/promises';
config({ path: '.env.local', quiet: true });
const { getSequelize, db } = await import('../src/lib/db.js');
const file = process.argv[2] || `jupiter-backup-${new Date().toISOString().slice(0, 10)}.json`;
const sequelize = getSequelize();
await sequelize.authenticate();
const models = db();
const dump = { exportedAt: new Date().toISOString(), tables: {} };
for (const [name, Model] of Object.entries(models)) {
  dump.tables[name] = (await Model.findAll({ raw: true })).map((r) => r);
  console.log(`${name}: ${dump.tables[name].length} rows`);
}
await writeFile(file, JSON.stringify(dump, null, 1));
console.log(`written ${file}`);
await sequelize.close();
