// One-off: adds the Careers page, sample openings and footer link to an existing database.
import { config } from 'dotenv';
config({ path: '.env.local', quiet: true });
const { getSequelize, db } = await import('../src/lib/db.js');
const seed = await import('../src/lib/seed-data.js');
const sequelize = getSequelize();
await sequelize.sync();
const { Page, Section, JobOpening, Setting } = db();
let page = await Page.findOne({ where: { slug: 'careers' } });
if (!page) {
  const { sections, ...rest } = seed.careersPage;
  page = await Page.create(rest);
  for (const [i, s] of sections.entries()) await Section.create({ pageId: page.id, type: s.type, data: s.data, order: i, enabled: true });
  console.log('Careers page created');
}
if ((await JobOpening.count()) === 0) {
  for (const j of seed.jobs) await JobOpening.create({ ...j, slug: j.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') });
  console.log('Sample openings created');
}
const footer = await Setting.findByPk('footer');
if (footer) {
  const v = footer.get('value');
  if (!(v.links || []).some((l) => l.href === '/careers')) {
    v.links = [...(v.links || []).filter((l) => l.href !== '/contact'), { label: 'Careers', href: '/careers' }, ...(v.links || []).filter((l) => l.href === '/contact')];
    footer.value = v; await footer.save(); console.log('Footer link added');
  }
}
await sequelize.close();
