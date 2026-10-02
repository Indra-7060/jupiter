import { ok, withPublic } from '@/lib/api';
import { getPosts } from '@/lib/content';

export const GET = withPublic(async (req) => {
  const limit = Number(new URL(req.url).searchParams.get('limit') || 0);
  return ok(await getPosts({ limit }));
});
