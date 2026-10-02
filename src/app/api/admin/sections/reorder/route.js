import { fail, ok, readJson, withAdmin } from '@/lib/api';
import { db } from '@/lib/db';

/** Body: { ids: [sectionId, ...] } in the desired order. */
export const PUT = withAdmin(async (req) => {
  const { ids } = await readJson(req);
  if (!Array.isArray(ids)) return fail('ids array required');
  const { Section } = db();
  await Promise.all(ids.map((id, i) => Section.update({ order: i }, { where: { id: Number(id) } })));
  return ok({ updated: ids.length });
});
