import { fail, ok, readJson, withAdmin } from '@/lib/api';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/content';
import { SETTINGS_SCHEMA } from '@/lib/resources';

export const GET = withAdmin(async () => ok(await getSettings()));

export const PUT = withAdmin(async (req) => {
  const body = await readJson(req);
  const { Setting } = db();
  const groups = Object.keys(body).filter((k) => SETTINGS_SCHEMA[k]);
  if (!groups.length) return fail('No valid settings groups supplied.');
  for (const key of groups) {
    const allowed = new Set(SETTINGS_SCHEMA[key].fields.map((f) => f.name));
    const value = {};
    for (const [k, v] of Object.entries(body[key] || {})) if (allowed.has(k)) value[k] = v;
    await Setting.upsert({ key, value });
  }
  return ok(await getSettings());
});
