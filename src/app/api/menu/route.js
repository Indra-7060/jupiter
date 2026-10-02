import { ok, withPublic } from '@/lib/api';
import { getMenu } from '@/lib/content';

export const GET = withPublic(async () => ok(await getMenu()));
