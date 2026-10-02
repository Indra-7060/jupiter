import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { fail, withAdmin } from '@/lib/api';
import { db } from '@/lib/db';

const TYPES = { '.pdf': 'application/pdf', '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };

/** Streams an applicant's CV to a signed-in admin. CVs are stored outside /public on purpose. */
export const GET = withAdmin(async (_req, { params }) => {
  const row = await db().JobApplication.findByPk(Number(params.id));
  if (!row || !row.cvFile) return fail('No CV stored for this application.', 404);
  const file = path.join(process.cwd(), 'storage', 'cv', path.basename(row.cvFile));
  let data;
  try {
    data = await readFile(file);
  } catch {
    return fail('The CV file is no longer on the server (it was e-mailed to HR when the application was submitted).', 404);
  }
  const ext = path.extname(row.cvFile).toLowerCase();
  return new NextResponse(data, {
    headers: {
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${(row.cvName || `cv${ext}`).replace(/"/g, '')}"`,
    },
  });
});
