import { created, fail, ok, readJson, withAdmin } from '@/lib/api';
import { db, plain } from '@/lib/db';
import { SECTION_TYPES } from '@/lib/sectionSchemas';

export const GET = withAdmin(async (req) => {
  const pageId = Number(new URL(req.url).searchParams.get('pageId'));
  if (!pageId) return fail('pageId is required');
  const { Section } = db();
  return ok(plain(await Section.findAll({ where: { pageId }, order: [['order', 'ASC'], ['id', 'ASC']] })));
});

export const POST = withAdmin(async (req) => {
  const body = await readJson(req);
  const pageId = Number(body.pageId);
  if (!pageId || !SECTION_TYPES[body.type]) return fail('pageId and a valid type are required.');
  const { Section } = db();
  const max = await Section.max('order', { where: { pageId } });
  const row = await Section.create({
    pageId,
    type: body.type,
    label: body.label || null,
    order: Number.isFinite(max) ? max + 1 : 0,
    enabled: body.enabled !== false,
    data: body.data && typeof body.data === 'object' ? body.data : {},
  });
  return created(plain(row));
});
