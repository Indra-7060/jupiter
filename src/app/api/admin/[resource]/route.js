import { created, fail, ok, readJson, withAdmin } from '@/lib/api';
import { Op, likeOp } from '@/lib/db';
import { ensureUniqueSlug, getResource, LABEL_FIELD, sanitizePayload, stripSensitive } from '@/lib/resourceModels';
import { ensureQuoteTable } from '@/lib/quotes';

export const GET = withAdmin(async (req, { params }) => {
  const resource = getResource(params.resource);
  if (!resource) return fail('Unknown resource', 404);
  if (params.resource === 'quotes') await ensureQuoteTable();
  const { Model, def, name } = resource;
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim();
  const limit = Math.min(Number(url.searchParams.get('limit') || 500), 1000);
  const offset = Number(url.searchParams.get('offset') || 0);

  const where = {};
  for (const [k, v] of url.searchParams.entries()) {
    if (k.startsWith('filter.') && Model.rawAttributes[k.slice(7)]) where[k.slice(7)] = v === 'null' ? null : v;
  }
  if (q) {
    const textCols = def.columns.map((c) => c.name).filter((n) => Model.rawAttributes[n] && /STRING|TEXT/.test(Model.rawAttributes[n].type.key));
    const label = LABEL_FIELD[name];
    if (label && !textCols.includes(label)) textCols.push(label);
    if (textCols.length) where[Op.or] = textCols.map((c) => ({ [c]: { [likeOp()]: `%${q}%` } }));
  }
  const { rows, count } = await Model.findAndCountAll({ where, order: def.orderBy, limit, offset });
  return ok({ rows: rows.map(stripSensitive), total: count, labelField: LABEL_FIELD[name] });
});

export const POST = withAdmin(async (req, { params, session }) => {
  const resource = getResource(params.resource);
  if (!resource) return fail('Unknown resource', 404);
  if (resource.def.readOnly) return fail('This resource cannot be created from the admin.', 405);
  if (params.resource === 'users' && session.role !== 'admin') return fail('Forbidden', 403);

  const body = await readJson(req);
  const data = await sanitizePayload(resource, body, { isCreate: true });
  for (const f of resource.def.fields) {
    if (f.required && (data[f.name] === undefined || data[f.name] === null || data[f.name] === '')) {
      return fail(`"${f.label}" is required.`);
    }
  }
  if (params.resource === 'users') {
    if (!body.password) return fail('Password is required for a new user.');
    data.email = String(data.email).toLowerCase().trim();
  }
  if (data.slug) data.slug = await ensureUniqueSlug(resource.Model, data.slug);
  const row = await resource.Model.create(data);
  return created(stripSensitive(row));
});
