import { fail, ok, withPublic } from '@/lib/api';
import { getPage } from '@/lib/content';

export const GET = withPublic(async (_req, { params }) => {
  const page = await getPage(params.slug);
  return page && page.published ? ok(page) : fail('Not found', 404);
});
