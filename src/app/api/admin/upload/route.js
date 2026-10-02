import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { created, fail, withAdmin } from '@/lib/api';
import { db } from '@/lib/db';
import { slugify } from '@/lib/util';

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
  'video/mp4',
  'video/webm',
  'application/pdf',
]);
const MAX = 25 * 1024 * 1024;

export const POST = withAdmin(async (req) => {
  const form = await req.formData();
  const files = form.getAll('files').filter((f) => typeof f === 'object' && f.size);
  if (!files.length) return fail('No files received.');
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  const { Media } = db();
  const out = [];
  for (const file of files) {
    if (!ALLOWED.has(file.type)) return fail(`File type ${file.type || 'unknown'} is not allowed (${file.name}).`);
    if (file.size > MAX) return fail(`${file.name} is larger than 25 MB.`);
    const ext = path.extname(file.name).toLowerCase() || '';
    const base = slugify(path.basename(file.name, ext)) || 'file';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${base}${ext}`;
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    const row = await Media.create({ filename: name, url: `/uploads/${name}`, mime: file.type, size: file.size, alt: form.get('alt') || null });
    out.push(row.get({ plain: true }));
  }
  return created(out);
});
