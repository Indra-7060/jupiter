import { ok, withPublic } from '@/lib/api';
import { getProductCategories } from '@/lib/content';

export const GET = withPublic(async () => ok(await getProductCategories()));
