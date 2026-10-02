import { ok, withAdmin } from '@/lib/api';
import { db, plain } from '@/lib/db';

export const GET = withAdmin(async (req) => {
  const { Media } = db();
  const url = new URL(req.url);
  const type = url.searchParams.get('type'); // image | video | pdf
  const rows = plain(await Media.findAll({ order: [['createdAt', 'DESC']], limit: 1000 }));
  const filtered = type ? rows.filter((r) => (r.mime || '').startsWith(type === 'pdf' ? 'application/pdf' : `${type}/`)) : rows;
  return ok(filtered);
});
