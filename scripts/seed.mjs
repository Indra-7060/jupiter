import { config } from 'dotenv';
config({ path: ".env.local", quiet: true });
config({ quiet: true });
import bcrypt from 'bcryptjs';

const { getSequelize, db } = await import('../src/lib/db.js');
const seed = await import('../src/lib/seed-data.js');

const force = process.argv.includes('--force');
const sequelize = getSequelize();
await sequelize.authenticate();
await sequelize.sync({ force });
const { AdminUser, Setting, Page, Section, ProductCategory, Product, Machine, Post, Location, JobOpening } = db();

const existing = await Page.count();
if (existing && !force) {
  console.log('Database already has content. Re-run with --force (npm run db:reset) to wipe and re-seed.');
  await ensureAdmin();
  await sequelize.close();
  process.exit(0);
}

for (const [key, value] of Object.entries(seed.settings)) {
  await Setting.upsert({ key, value });
}

for (const page of [...seed.pages, seed.careersPage]) {
  const { sections = [], ...rest } = page;
  const p = await Page.create(rest);
  for (const [i, s] of sections.entries()) {
    await Section.create({ pageId: p.id, type: s.type, data: s.data, order: i, enabled: true });
  }
}

for (const cat of seed.productCategories) {
  const { products = [], ...rest } = cat;
  const c = await ProductCategory.create(rest);
  for (const [i, pr] of products.entries()) {
    await Product.create({ ...pr, order: pr.order ?? i, categoryId: c.id });
  }
}

for (const m of seed.machines) await Machine.create(m);
for (const p of seed.posts) await Post.create(p);
for (const l of seed.locations) await Location.create(l);
for (const j of seed.jobs) await JobOpening.create({ ...j, slug: j.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') });

await ensureAdmin();

console.log('Seed complete.');
await sequelize.close();

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@jupiterclamps.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const found = await AdminUser.findOne({ where: { email } });
  if (!found) {
    await AdminUser.create({ name: 'Administrator', email, passwordHash: await bcrypt.hash(password, 10), role: 'admin' });
    console.log(`Admin user created: ${email}`);
  }
}
