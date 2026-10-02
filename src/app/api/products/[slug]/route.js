import { fail, ok, withPublic } from '@/lib/api';
import { getProductCategory } from '@/lib/content';

export const GET = withPublic(async (_req, { params }) => {
  const cat = await getProductCategory(params.slug);
  return cat ? ok(cat) : fail('Not found', 404);
});
