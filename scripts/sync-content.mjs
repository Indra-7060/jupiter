// Pushes the text content from src/lib/seed-data.js into an existing database.
// Text fields only: image/video fields are never overwritten. Safe to re-run.
import { config } from 'dotenv';
config({ path: '.env.local', quiet: true });
const { getSequelize, db } = await import('../src/lib/db.js');
const seed = await import('../src/lib/seed-data.js');
const sequelize = getSequelize();
await sequelize.sync();
const { Page, Section, ProductCategory, Product, Machine, Post, Setting } = db();
const IMAGE_KEYS = new Set(['image', 'video', 'poster', 'background', 'cardImage', 'heroImage']);

/** Copy text from `from` into `into`, keeping existing values for image-like keys. */
function mergeText(into, from) {
  const out = { ...(into || {}) };
  for (const [k, v] of Object.entries(from || {})) {
    if (IMAGE_KEYS.has(k)) { if (out[k] === undefined || out[k] === null || out[k] === '') out[k] = v; continue; }
    if (Array.isArray(v) && v.length && typeof v[0] === 'object' && Array.isArray(out[k])) {
      out[k] = v.map((item, i) => mergeText(out[k][i], item));
    } else out[k] = v;
  }
  return out;
}

for (const page of [...seed.pages, seed.careersPage]) {
  const { sections = [], ...rest } = page;
  let p = await Page.findOne({ where: { slug: page.slug } });
  if (!p) { p = await Page.create(rest); console.log('page created', page.slug); }
  else await p.update({ title: rest.title, metaTitle: rest.metaTitle ?? p.metaTitle, metaDescription: rest.metaDescription ?? p.metaDescription, showCta: rest.showCta ?? p.showCta });
  const existing = await Section.findAll({ where: { pageId: p.id }, order: [['order', 'ASC'], ['id', 'ASC']] });
  const used = new Set();
  for (const [i, s] of sections.entries()) {
    const match = existing.find((e) => e.type === s.type && !used.has(e.id));
    if (match) { used.add(match.id); await match.update({ data: mergeText(match.get('data'), s.data), order: i }); }
    else { const row = await Section.create({ pageId: p.id, type: s.type, data: s.data, order: i, enabled: true }); used.add(row.id); console.log('section added', page.slug, s.type); }
  }
  // keep any extra sections the admin added, after the seeded ones
  let n = sections.length;
  for (const e of existing) if (!used.has(e.id)) await e.update({ order: n++ });
}

for (const cat of seed.productCategories) {
  const { products = [], ...rest } = cat;
  let c = await ProductCategory.findOne({ where: { slug: cat.slug } });
  if (!c) {
    c = await ProductCategory.create(rest);
    for (const [i, pr] of products.entries()) await Product.create({ ...pr, order: pr.order ?? i, categoryId: c.id });
    console.log('category created', cat.slug);
  } else {
    const patch = {};
    for (const [k, v] of Object.entries(rest)) { if (k === 'slug' || IMAGE_KEYS.has(k)) continue; patch[k] = k === 'industries' ? mergeText({ industries: c.get('industries') }, { industries: v }).industries : v; }
    await c.update(patch);
    // add sub-products that exist in the seed but not yet in the database (matched by image, then name); never deletes
    const have = await Product.findAll({ where: { categoryId: c.id } });
    for (const [i, pr] of products.entries()) {
      const byImage = pr.image && have.find((h) => h.get('image') === pr.image);
      const hit = byImage || have.find((h) => h.get('name') === pr.name);
      if (!hit) { const row = await Product.create({ ...pr, order: pr.order ?? i, categoryId: c.id }); have.push(row); console.log('product added', cat.slug, pr.name); }
      else if (byImage && hit.get('name') !== pr.name) await hit.update({ name: pr.name });
    }
  }
}

// sections retired on purpose (client asked for them to be removed)
const RETIRED = { 'power-press': ['machine_feature'] };
for (const [slug, types] of Object.entries(RETIRED)) {
  const p = await Page.findOne({ where: { slug } });
  if (!p) continue;
  const n = await Section.destroy({ where: { pageId: p.id, type: types } });
  if (n) console.log('sections removed', slug, types.join(','), n);
}

for (const m of seed.machines) {
  const row = await Machine.findOne({ where: { slug: m.slug } });
  if (row) await row.update({ description: m.description, cardText: m.cardText, ...(m.ctaPrimaryHref ? { ctaPrimaryHref: m.ctaPrimaryHref } : {}) });
}

for (const post of seed.posts) {
  if (!(await Post.findOne({ where: { slug: post.slug } }))) { await Post.create(post); console.log('post created', post.slug); }
}

const cta = await Setting.findByPk('cta');
if (cta) { const v = cta.get('value'); if (v.buttons?.[0]?.label === 'Download Catalog') { v.buttons[0].label = 'Download Full Catalog'; cta.value = v; await cta.save(); } }

console.log('content synced');
await sequelize.close();
