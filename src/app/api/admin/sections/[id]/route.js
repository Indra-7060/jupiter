import { fail, ok, readJson, withAdmin } from '@/lib/api';
import { db, plain } from '@/lib/db';
import { SECTION_TYPES } from '@/lib/sectionSchemas';

export const PUT = withAdmin(async (req, { params }) => {
  const { Section } = db();
  const row = await Section.findByPk(Number(params.id));
  if (!row) return fail('Not found', 404);
  const body = await readJson(req);
  const patch = {};
  if ('data' in body && body.data && typeof body.data === 'object') patch.data = body.data;
  if ('enabled' in body) patch.enabled = !!body.enabled;
  if ('label' in body) patch.label = body.label ? String(body.label).slice(0, 120) : null;
  if ('order' in body) patch.order = Number(body.order) || 0;
  if ('type' in body && SECTION_TYPES[body.type]) patch.type = body.type;
  await row.update(patch);
  return ok(plain(row));
});

export const DELETE = withAdmin(async (_req, { params }) => {
  const { Section } = db();
  const row = await Section.findByPk(Number(params.id));
  if (!row) return fail('Not found', 404);
  await row.destroy();
  return ok({ id: row.id });
});
