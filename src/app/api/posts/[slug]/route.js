import { fail, ok, withPublic } from '@/lib/api';
import { getPost } from '@/lib/content';

export const GET = withPublic(async (_req, { params }) => {
  const p = await getPost(params.slug);
  return p ? ok(p) : fail('Not found', 404);
});
