import { fail, ok, withPublic } from '@/lib/api';
import { getMachine } from '@/lib/content';

export const GET = withPublic(async (_req, { params }) => {
  const m = await getMachine(params.slug);
  return m ? ok(m) : fail('Not found', 404);
});
