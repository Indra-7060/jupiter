import { fail, ok, readJson, withAdmin } from '@/lib/api';
import { db } from '@/lib/db';
import { ensureUniqueSlug, getResource, sanitizePayload, stripSensitive } from '@/lib/resourceModels';
import { ensureQuoteTable } from '@/lib/quotes';

export const GET = withAdmin(async (_req, { params }) => {
  const resource = getResource(params.resource);
  if (!resource) return fail('Unknown resource', 404);
  if (params.resource === 'quotes') await ensureQuoteTable();
  const row = await resource.Model.findByPk(Number(params.id));
  if (!row) return fail('Not found', 404);
  return ok(stripSensitive(row));
});

export const PUT = withAdmin(async (req, { params, session }) => {
  const resource = getResource(params.resource);
  if (!resource) return fail('Unknown resource', 404);
  const row = await resource.Model.findByPk(Number(params.id));
  if (!row) return fail('Not found', 404);
  if (params.resource === 'users' && session.role !== 'admin' && Number(session.sub) !== row.id) return fail('Forbidden', 403);

  const body = await readJson(req);
  const data = await sanitizePayload(resource, body, { isCreate: false });
  if (resource.def.readOnly) {
    Object.keys(data).forEach((k) => k !== 'status' && delete data[k]);
  }
  if (params.resource === 'pages' && row.isSystem && data.slug && data.slug !== row.slug) {
    return fail('The slug of a system page cannot be changed.');
  }
  if (params.resource === 'users' && data.email) data.email = String(data.email).toLowerCase().trim();
  if (data.slug) data.slug = await ensureUniqueSlug(resource.Model, data.slug, row.id);
  await row.update(data);
  return ok(stripSensitive(row));
});

export const DELETE = withAdmin(async (_req, { params, session }) => {
  const resource = getResource(params.resource);
  if (!resource) return fail('Unknown resource', 404);
  const row = await resource.Model.findByPk(Number(params.id));
  if (!row) return fail('Not found', 404);

  if (params.resource === 'pages' && row.isSystem) return fail('System pages cannot be deleted. Disable sections instead.');
  if (params.resource === 'users') {
    if (session.role !== 'admin') return fail('Forbidden', 403);
    if (row.id === Number(session.sub)) return fail('You cannot delete your own account.');
    const admins = await db().AdminUser.count({ where: { role: 'admin' } });
    if (row.role === 'admin' && admins <= 1) return fail('At least one administrator must remain.');
  }
  await row.destroy();
  return ok({ id: row.id });
});
