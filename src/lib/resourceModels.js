import { db } from './db.js';
import { RESOURCES } from './resources.js';
import { slugify } from './util.js';
import { hashPassword } from './auth.js';

const MODEL_BY_RESOURCE = {
  products: 'ProductCategory',
  'product-items': 'Product',
  machines: 'Machine',
  posts: 'Post',
  locations: 'Location',
  pages: 'Page',
  users: 'AdminUser',
  enquiries: 'Enquiry',
  quotes: 'QuoteRequest',
  jobs: 'JobOpening',
  applications: 'JobApplication',
};

export const LABEL_FIELD = {
  products: 'name',
  'product-items': 'name',
  machines: 'name',
  posts: 'title',
  locations: 'name',
  pages: 'title',
  users: 'name',
  enquiries: 'name',
  quotes: 'name',
  jobs: 'title',
  applications: 'name',
};

export function getResource(name) {
  const def = RESOURCES[name];
  const modelName = MODEL_BY_RESOURCE[name];
  if (!def || !modelName) return null;
  return { name, def, Model: db()[modelName] };
}

function coerce(field, value) {
  if (value === undefined) return undefined;
  switch (field.type) {
    case 'number':
      return value === '' || value === null ? null : Number(value);
    case 'boolean':
      return value === true || value === 'true' || value === 1 || value === '1';
    case 'date':
      return value ? new Date(value) : null;
    case 'relation':
      return value === '' || value === null || value === undefined ? null : Number(value);
    case 'tags':
      if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
      return String(value || '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    case 'list':
      return Array.isArray(value) ? value : [];
    case 'object':
      return value && typeof value === 'object' ? value : {};
    default:
      return value;
  }
}

/** Whitelist + coerce an incoming payload according to the resource field schema. */
export async function sanitizePayload(resource, body, { isCreate } = {}) {
  const { def } = resource;
  const out = {};
  for (const f of def.fields) {
    if (f.readOnly && !isCreate) continue;
    if (!(f.name in body)) continue;
    if (f.type === 'password') {
      if (body.password) out.passwordHash = await hashPassword(String(body.password));
      continue;
    }
    out[f.name] = coerce(f, body[f.name]);
  }
  if ('slug' in body && typeof body.slug === 'string') out.slug = slugify(body.slug);
  if (def.slugFrom && !out.slug && (isCreate || 'slug' in body)) {
    const base = body[def.slugFrom] || out[def.slugFrom];
    if (base) out.slug = slugify(base);
  }
  return out;
}

export async function ensureUniqueSlug(Model, slug, excludeId) {
  if (!slug || !Model.rawAttributes.slug) return slug;
  let candidate = slug;
  let n = 2;
  for (;;) {
    const found = await Model.findOne({ where: { slug: candidate } });
    if (!found || (excludeId && found.id === Number(excludeId))) return candidate;
    candidate = `${slug}-${n++}`;
  }
}

export function stripSensitive(row) {
  const o = typeof row.get === 'function' ? row.get({ plain: true }) : row;
  if (o && 'passwordHash' in o) delete o.passwordHash;
  return JSON.parse(JSON.stringify(o));
}
