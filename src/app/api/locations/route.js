import { ok, withPublic } from '@/lib/api';
import { getLocations } from '@/lib/content';

export const GET = withPublic(async () => ok(await getLocations()));
