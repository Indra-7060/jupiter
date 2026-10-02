import { deleteMedia } from '@/lib/storage';
import { fail, ok, readJson, withAdmin } from '@/lib/api';
import { db } from '@/lib/db';

export const DELETE = withAdmin(async (_req, { params }) => {
  const { Media } = db();
  const row = await Media.findByPk(Number(params.id));
  if (!row) return fail('Not found', 404);
  await deleteMedia(row.url, row.filename);
  await row.destroy();
  return ok({ id: row.id });
});

export const PUT = withAdmin(async (req, { params }) => {
  const { Media } = db();
  const row = await Media.findByPk(Number(params.id));
  if (!row) return fail('Not found', 404);
  const body = await readJson(req);
  if ('alt' in body) row.alt = String(body.alt || '').slice(0, 255);
  await row.save();
  return ok(row.get({ plain: true }));
});
