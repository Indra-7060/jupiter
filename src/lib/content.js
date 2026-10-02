import { cache } from 'react';
import { db, plain, Op } from './db.js';
import * as defaults from './seed-data.js';

export const getSettings = cache(async function getSettings() {
  const { Setting } = db();
  const rows = await Setting.findAll();
  const out = structuredClone(defaults.settings);
  for (const r of rows) {
    const v = r.get('value');
    out[r.key] = { ...(out[r.key] || {}), ...(v || {}) };
  }
  return out;
});

/**
 * The header navigation is generated automatically:
 * fixed links + a mega menu for product categories + a mega menu for power presses.
 * Labels, panel texts and extra links are editable in Site settings → Header.
 */
export const getMenu = cache(async function getMenu() {
  const [settings, cats, machines] = await Promise.all([getSettings(), getProductCategories(), getMachines()]);
  const h = settings.header || {};
  const mega = (m = {}, href, width) => ({ ...m, ctaHref: m.ctaHref || href, width });
  const items = [
    { id: 'home', label: h.homeLabel || 'Home', href: '/', kind: 'link', children: [] },
    { id: 'about', label: h.aboutLabel || 'About Us', href: '/about', kind: 'link', children: [] },
    {
      id: 'power-press',
      label: h.powerPressLabel || 'Power Press',
      href: '/power-press',
      kind: 'mega',
      mega: mega(h.powerPressMega, '/power-press', machines.length > 4 ? 'w2' : 'w1'),
      children: machines.map((m) => ({ id: `m${m.id}`, label: m.name, href: `/power-press/${m.slug}`, description: m.cardText, image: m.image })),
    },
    {
      id: 'products',
      label: h.productsLabel || 'Products',
      href: '/products',
      kind: 'mega',
      mega: mega(h.productsMega, '/products', cats.length > 4 ? 'w2' : 'w1'),
      children: cats.map((c) => ({ id: `c${c.id}`, label: c.name, href: `/products/${c.slug}`, description: c.cardText ? shortText(c.cardText) : '', image: c.cardImage })),
    },
    { id: 'press', label: h.pressLabel || 'Insights', href: '/press', kind: 'link', children: [] },
    ...(h.showCareers === false ? [] : [{ id: 'careers', label: h.careersLabel || 'Careers', href: '/careers', kind: 'link', children: [] }]),
    ...(h.extraLinks || []).filter((l) => l?.label && l?.href).map((l, i) => ({ id: `x${i}`, label: l.label, href: l.href, kind: 'link', children: [] })),
    { id: 'contact', label: h.contactLabel || 'Contact', href: '/contact', kind: 'link', children: [] },
  ];
  return items.filter((it) => it.kind !== 'mega' || it.children.length);
});

function shortText(t, max = 42) {
  const s = String(t).trim();
  if (s.length <= max) return s;
  return s.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

export async function getPage(slug) {
  const { Page, Section } = db();
  const page = await Page.findOne({
    where: { slug },
    include: [{ model: Section, as: 'sections', where: { enabled: true }, required: false }],
    order: [[{ model: Section, as: 'sections' }, 'order', 'ASC']],
  });
  return page ? plain(page) : null;
}

export async function getCustomPageSlugs() {
  const { Page } = db();
  return plain(await Page.findAll({ where: { isSystem: false, published: true }, attributes: ['slug'] })).map((p) => p.slug);
}

export async function getProductCategories() {
  const { ProductCategory } = db();
  return plain(await ProductCategory.findAll({ where: { published: true }, order: [['order', 'ASC'], ['name', 'ASC']] }));
}

export async function getProductCategory(slug) {
  const { ProductCategory, Product } = db();
  const cat = await ProductCategory.findOne({
    where: { slug, published: true },
    include: [{ model: Product, as: 'products', where: { published: true }, required: false }],
    order: [[{ model: Product, as: 'products' }, 'order', 'ASC']],
  });
  return cat ? plain(cat) : null;
}

export async function getMachines() {
  const { Machine } = db();
  return plain(await Machine.findAll({ where: { published: true }, order: [['order', 'ASC'], ['name', 'ASC']] }));
}

export async function getMachineById(id) {
  const { Machine } = db();
  const m = await Machine.findOne({ where: { id, published: true } });
  return m ? plain(m) : null;
}

export async function getMachine(slug) {
  const { Machine } = db();
  const m = await Machine.findOne({ where: { slug, published: true } });
  return m ? plain(m) : null;
}

export async function getPosts({ limit = 0, excludeId } = {}) {
  const { Post } = db();
  const where = { published: true };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return plain(
    await Post.findAll({
      where,
      order: [['publishedAt', 'DESC'], ['id', 'DESC']],
      ...(limit ? { limit } : {}),
    })
  );
}

export async function getPost(slug, { countView = false } = {}) {
  const { Post } = db();
  const post = await Post.findOne({ where: { slug, published: true } });
  if (!post) return null;
  if (countView) {
    post.increment('views').catch(() => {});
  }
  return plain(post);
}

export async function getJobs() {
  const { JobOpening } = db();
  return plain(await JobOpening.findAll({ where: { published: true }, order: [['order', 'ASC'], ['id', 'DESC']] }));
}

export async function getLocations() {
  const { Location } = db();
  return plain(await Location.findAll({ where: { published: true }, order: [['order', 'ASC']] }));
}

export function pageTitle(settings, title) {
  const suffix = settings?.site?.titleSuffix ?? '';
  return `${title}${suffix}`;
}
